import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Season, Unit, Quest } from '../types';

interface SeasonContextType {
  seasons: Season[];
  setSeasons: React.Dispatch<React.SetStateAction<Season[]>>;
  activeSeasonId: string | null;
  setActiveSeasonId: (id: string | null) => void;
  activeUnitIds: string[];
  setActiveUnitIds: React.Dispatch<React.SetStateAction<string[]>>;
  unitSearchQuery: string;
  setUnitSearchQuery: (query: string) => void;
  questSearchQuery: string;
  setQuestSearchQuery: (query: string) => void;
  activeSeason: Season | undefined;
  sortedSeasons: Season[];
  searchResults: SearchResult[];
  isSearching: boolean;
  addSeason: (name: string) => void;
  editSeason: (id: string, newName: string) => void;
  deleteSeason: (id: string) => void;
  swapSeasonOrder: (id1: string, id2: string) => void;
  addUnit: (seasonId: string, name: string) => void;
  editUnit: (seasonId: string, unitId: string, newName: string) => void;
  deleteUnit: (seasonId: string, unitId: string) => void;
  addQuest: (seasonId: string, unitId: string, description: string) => void;
  editQuest: (seasonId: string, unitId: string, questId: string, newDescription: string) => void;
  deleteQuest: (seasonId: string, unitId: string, questId: string) => void;
  toggleQuest: (seasonId: string, unitId: string, questId: string, completed: boolean) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

export type UnitSearchResult = { type: 'unit'; season: Season; unit: Unit; };
export type QuestSearchResult = { type: 'quest'; season: Season; unit: Unit; quests: Quest[]; };
export type SearchResult = UnitSearchResult | QuestSearchResult;

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [activeUnitIds, setActiveUnitIds] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [questSearchQuery, setQuestSearchQuery] = useState('');

  const activeSeason = useMemo(() => seasons.find(s => s.id === activeSeasonId), [seasons, activeSeasonId]);
  
  const sortedSeasons = useMemo(() => {
    return [...seasons].sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        if (timeA !== timeB) return timeB - timeA; 
        return a.name.localeCompare(b.name);
    });
  }, [seasons]);

  const isSearching = unitSearchQuery.length > 0 || questSearchQuery.length > 0;

  const searchResults: SearchResult[] = useMemo(() => {
    if (unitSearchQuery) {
        const query = unitSearchQuery.toLowerCase();
        return seasons.flatMap(season =>
            season.units
                .filter(unit => {
                     const words = unit.name.toLowerCase().split(/\s+/);
                     return words.some(word => word.startsWith(query));
                })
                .map(unit => ({ type: 'unit' as const, season, unit }))
        ).sort((a,b) => a.unit.name.localeCompare(b.unit.name));
    }
    if (questSearchQuery) {
        const query = questSearchQuery.toLowerCase();
        return seasons.flatMap(season =>
            season.units.flatMap(unit => {
                const matchingQuests = unit.quests.filter(quest => {
                     const words = quest.description.toLowerCase().split(/\s+/);
                     return words.some(word => word.startsWith(query));
                });
                return matchingQuests.length > 0
                    ? [{ type: 'quest' as const, season, unit, quests: matchingQuests }]
                    : [];
            })
        );
    }
    return [];
  }, [seasons, unitSearchQuery, questSearchQuery]);

  const markDirty = () => setIsDirty(true);

  // Actions
  const addSeason = (name: string) => {
    const newSeason: Season = { id: crypto.randomUUID(), name, units: [], createdAt: Date.now() };
    setSeasons(prev => [...prev, newSeason]);
    setActiveSeasonId(newSeason.id);
    setActiveUnitIds([]);
    markDirty();
  };

  const editSeason = (id: string, newName: string) => {
    setSeasons(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
    markDirty();
  };

  const deleteSeason = (id: string) => {
    setSeasons(prev => {
        const remaining = prev.filter(s => s.id !== id);
        if (activeSeasonId === id) {
             const firstSeason = [...remaining].sort((a,b) => a.name.localeCompare(b.name))[0];
             setActiveSeasonId(firstSeason ? firstSeason.id : null);
             setActiveUnitIds([]);
        }
        return remaining;
    });
    markDirty();
  };

  const swapSeasonOrder = (season1Id: string, season2Id: string) => {
    setSeasons(prev => {
        const s1 = prev.find(s => s.id === season1Id);
        const s2 = prev.find(s => s.id === season2Id);
        if (!s1 || !s2) return prev;
        
        // Use existing createdAt or initialize based on current index if missing
        const t1 = s1.createdAt || (Date.now() - prev.indexOf(s1));
        const t2 = s2.createdAt || (Date.now() - prev.indexOf(s2));

        return prev.map(s => {
          if (s.id === season1Id) return { ...s, createdAt: t2 };
          if (s.id === season2Id) return { ...s, createdAt: t1 };
          return s;
        });
    });
    markDirty();
  };

  const addUnit = (seasonId: string, name: string) => {
    const newUnit: Unit = { id: crypto.randomUUID(), name, quests: [] };
    setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: [...s.units, newUnit] } : s));
    setActiveUnitIds(prev => [...prev, newUnit.id]);
    markDirty();
  };

  const editUnit = (seasonId: string, unitId: string, newName: string) => {
    setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.map(u => u.id === unitId ? { ...u, name: newName } : u) } : s ));
    markDirty();
  };

  const deleteUnit = (seasonId: string, unitId: string) => {
    setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.filter(u => u.id !== unitId) } : s ));
    setActiveUnitIds(prev => prev.filter(id => id !== unitId));
    markDirty();
  };

  const addQuest = (seasonId: string, unitId: string, description: string) => {
    const newQuest: Quest = { id: crypto.randomUUID(), description, completed: false };
    setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.map(u => u.id === unitId ? { ...u, quests: [...u.quests, newQuest] } : u) } : s ));
    markDirty();
  };

  const editQuest = (seasonId: string, unitId: string, questId: string, newDescription: string) => {
    setSeasons(prev => prev.map(s => s.id === seasonId
        ? { ...s, units: s.units.map(u => u.id === unitId 
            ? { ...u, quests: u.quests.map(q => q.id === questId ? { ...q, description: newDescription } : q) }
            : u)
        } : s
    ));
    markDirty();
  };

  const deleteQuest = (seasonId: string, unitId: string, questId: string) => {
    setSeasons(prev => prev.map(s => s.id === seasonId
        ? { ...s, units: s.units.map(u => u.id === unitId 
            ? { ...u, quests: u.quests.filter(q => q.id !== questId) }
            : u)
        } : s
    ));
    markDirty();
  };

  const toggleQuest = (seasonId: string, unitId: string, questId: string, completed: boolean) => {
    setSeasons(prev => prev.map(s => s.id === seasonId
        ? { ...s, units: s.units.map(u => u.id === unitId 
            ? { ...u, quests: u.quests.map(q => q.id === questId ? { ...q, completed } : q) }
            : u)
        } : s
    ));
    markDirty();
  };

  const value = {
    seasons, setSeasons,
    activeSeasonId, setActiveSeasonId,
    activeUnitIds, setActiveUnitIds,
    unitSearchQuery, setUnitSearchQuery,
    questSearchQuery, setQuestSearchQuery,
    activeSeason,
    sortedSeasons,
    searchResults,
    isSearching,
    isDirty, setIsDirty,
    addSeason, editSeason, deleteSeason, swapSeasonOrder,
    addUnit, editUnit, deleteUnit,
    addQuest, editQuest, deleteQuest, toggleQuest
  };

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
};

export const useSeasons = () => {
    const context = useContext(SeasonContext);
    if (context === undefined) {
        throw new Error('useSeasons must be used within a SeasonProvider');
    }
    return context;
};
