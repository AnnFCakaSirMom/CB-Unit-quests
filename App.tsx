
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Season, Unit, Quest } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SaveIcon, UploadIcon, PlusIcon, EditIcon, DeleteIcon, SearchIcon, FlameIcon, CheckmarkIcon } from './components/Icons';

// --- Main Application Component ---
const App: React.FC = () => {
    // --- State Management ---
    const [seasons, setSeasons] = useLocalStorage<Season[]>('cb_tracker_seasons', []);
    const [activeSeasonId, setActiveSeasonId] = useLocalStorage<string | null>('cb_tracker_activeSeasonId', null);
    const [activeUnitIds, setActiveUnitIds] = useLocalStorage<string[]>('cb_tracker_activeUnitIds', []);
    
    const [unitSearchQuery, setUnitSearchQuery] = useState('');
    const [questSearchQuery, setQuestSearchQuery] = useState('');

    const [modal, setModal] = useState<'confirm' | 'edit' | null>(null);
    const [modalProps, setModalProps] = useState<any>({});
    
    const [fileInfo, setFileInfo] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle'|'saving'>('idle');


    // --- Derived State & Memoization ---
    const activeSeason = useMemo(() => seasons.find(s => s.id === activeSeasonId), [seasons, activeSeasonId]);
    const sortedSeasons = useMemo(() => [...seasons].sort((a, b) => a.name.localeCompare(b.name)), [seasons]);
    
    const isSearching = unitSearchQuery.length > 0 || questSearchQuery.length > 0;

    const searchResults = useMemo(() => {
        if (unitSearchQuery) {
            const query = unitSearchQuery.toLowerCase();
            return seasons.flatMap(season =>
                season.units
                    .filter(unit => unit.name.toLowerCase().includes(query))
                    .map(unit => ({ type: 'unit' as const, season, unit }))
            ).sort((a,b) => a.unit.name.localeCompare(b.unit.name));
        }
        if (questSearchQuery) {
            const query = questSearchQuery.toLowerCase();
            return seasons.flatMap(season =>
                season.units.flatMap(unit => {
                    const matchingQuests = unit.quests.filter(quest => quest.description.toLowerCase().includes(query));
                    return matchingQuests.length > 0
                        ? [{ type: 'quest' as const, season, unit, quests: matchingQuests }]
                        : [];
                })
            );
        }
        return [];
    }, [seasons, unitSearchQuery, questSearchQuery]);


    // --- Event Handlers & Logic ---
    const handleSetSeasons = (newSeasons: Season[] | ((prev: Season[]) => Season[])) => {
        const updatedSeasons = typeof newSeasons === 'function' ? newSeasons(seasons) : newSeasons;
        setSeasons(updatedSeasons);
    };
    
    const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
        setModalProps({ title, message, onConfirm });
        setModal('confirm');
    };

    const showEditModal = (title: string, initialValue: string, onSave: (value: string) => void) => {
        setModalProps({ title, initialValue, onSave });
        setModal('edit');
    };

    const closeModal = () => setModal(null);

    // Season Management
    const handleAddSeason = () => {
        showEditModal('Lägg till ny säsong', '', name => {
            if (name) {
                const newSeason: Season = { id: crypto.randomUUID(), name, units: [] };
                handleSetSeasons(prev => [...prev, newSeason]);
                setActiveSeasonId(newSeason.id);
                setActiveUnitIds([]);
            }
        });
    };

    const handleEditSeason = () => {
        if (activeSeason) {
            showEditModal('Redigera säsong', activeSeason.name, newName => {
                if (newName) {
                    handleSetSeasons(prev => prev.map(s => s.id === activeSeasonId ? { ...s, name: newName } : s));
                }
            });
        }
    };

    const handleDeleteSeason = () => {
        if (activeSeason) {
            showConfirmModal('Ta bort säsong?', `Är du säker på att du vill ta bort '${activeSeason.name}'? Detta kan inte ångras.`, () => {
                handleSetSeasons(prev => prev.filter(s => s.id !== activeSeasonId));
                const firstSeason = sortedSeasons.filter(s => s.id !== activeSeasonId)[0];
                setActiveSeasonId(firstSeason ? firstSeason.id : null);
                setActiveUnitIds([]);
            });
        }
    };
    
    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setActiveSeasonId(newId);
        const newSeason = seasons.find(s => s.id === newId);
        setActiveUnitIds(newSeason ? newSeason.units.map(u => u.id) : []);
    };
    
    // File Operations
    const handleSaveFile = async (saveAs = false) => {
        if (!window.showSaveFilePicker) {
            alert("Din webbläsare stödjer inte File System Access API. Använd en modern webbläsare som Chrome eller Edge.");
            return;
        }

        const options = {
            suggestedName: `conquerors-blade-data.json`,
            types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
        };

        try {
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(seasons, null, 2));
            await writable.close();
            setFileInfo(`Sparad till: ${handle.name}`);
            setSaveStatus('saving');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err: any) {
            if (err.name !== 'AbortError') console.error('Error saving file:', err);
        }
    };

    const handleImportFile = async () => {
        if (!window.showOpenFilePicker) {
            alert("Din webbläsare stödjer inte File System Access API.");
            return;
        }
        try {
            const [handle] = await window.showOpenFilePicker({
                 types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
            });
            const file = await handle.getFile();
            const content = await file.text();
            const importedData = JSON.parse(content);
            
            if (!Array.isArray(importedData)) throw new Error("Ogiltigt filformat.");

            showConfirmModal("Importera data?", "Detta ersätter all nuvarande data. Vill du fortsätta?", () => {
                // Basic data validation and ID generation
                const sanitizedData: Season[] = importedData.map((s: any) => ({
                    id: s.id || crypto.randomUUID(),
                    name: s.name || "Namnlös Säsong",
                    units: (s.units || []).map((u: any) => ({
                        id: u.id || crypto.randomUUID(),
                        name: u.name || "Namnlös Enhet",
                        quests: (u.quests || []).map((q: any) => ({
                           id: q.id || crypto.randomUUID(),
                           description: q.description || "Namnlöst Uppdrag",
                           completed: !!q.completed
                        }))
                    }))
                }));
                
                setSeasons(sanitizedData);
                const firstSeason = [...sanitizedData].sort((a,b) => a.name.localeCompare(b.name))[0];
                setActiveSeasonId(firstSeason?.id || null);
                setActiveUnitIds(firstSeason?.units.map(u => u.id) || []);
                setFileInfo(`Importerad från: ${handle.name}`);
            });

        } catch (err: any) {
             if (err.name !== 'AbortError') {
                console.error('Error importing file:', err);
                alert(`Fel vid import: ${err.message}`);
             }
        }
    };


    return (
        <div id="app" className="container mx-auto p-4 md:p-8 max-w-5xl">
            {/* --- Header --- */}
            <header className="text-center mb-10">
                <div className="flex justify-center items-center gap-4">
                    <FlameIcon />
                    <h1 className="text-5xl font-cinzel font-bold text-yellow-400 tracking-wider">Conqueror's Blade Tracker</h1>
                </div>
                <p className="text-gray-400 mt-3">Håll koll på dina enheters uppdrag. All data sparas automatiskt i din webbläsare.</p>
            </header>

            {/* --- Data Management & Search --- */}
            <div className="section-card bg-gray-800/80 border border-gray-700 backdrop-blur-sm p-4 rounded-lg mb-6 sticky top-4 z-20">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                     {/* Search Inputs */}
                    <div className="flex-grow grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="search" value={unitSearchQuery} onChange={e => { setUnitSearchQuery(e.target.value); setQuestSearchQuery(''); }} placeholder="Sök enhet..." className="w-full bg-gray-700 text-white placeholder-gray-400 p-2.5 pl-10 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        </div>
                        <div className="relative">
                            <input type="search" value={questSearchQuery} onChange={e => { setQuestSearchQuery(e.target.value); setUnitSearchQuery(''); }} placeholder="Sök uppdrag..." className="w-full bg-gray-700 text-white placeholder-gray-400 p-2.5 pl-10 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"/>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        </div>
                    </div>

                    {/* File Controls */}
                    <div className="flex gap-2 items-center">
                        <p className="text-xs text-gray-500 self-center mr-2 hidden sm:block">{fileInfo}</p>
                         <button onClick={() => handleSaveFile(true)} title="Spara data som .json-fil" className={`flex items-center justify-center bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 text-gray-300 hover:text-white p-2 rounded-md transition-all duration-300 ${saveStatus === 'saving' ? 'border-green-500' : ''}`}>
                            {saveStatus === 'saving' ? <CheckmarkIcon /> : <SaveIcon />}
                        </button>
                        <button onClick={handleImportFile} title="Importera från .json-fil" className="flex items-center justify-center bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 text-gray-300 hover:text-white p-2 rounded-md transition-all duration-300">
                            <UploadIcon />
                        </button>
                    </div>
                </div>
                 {/* NEW: Storage Indicator */}
                <div className="mt-4">
                    <StorageIndicator data={seasons} />
                </div>
            </div>

            {/* --- Season Selector --- */}
            {!isSearching && (
                 <div className="section-card bg-gray-800 border border-gray-700 p-5 rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">Välj Säsong</h2>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <select value={activeSeasonId || ''} onChange={handleSeasonChange} className="flex-grow w-full bg-gray-700 text-white p-2.5 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <option value="" disabled>Välj en säsong...</option>
                            {sortedSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button onClick={handleAddSeason} title="Lägg till ny säsong" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-2.5 rounded-md transition duration-300"><PlusIcon /></button>
                        {activeSeason && <>
                            <button onClick={handleEditSeason} className="text-gray-500 hover:text-yellow-400 transition-colors p-2 rounded-full"><EditIcon /></button>
                            <button onClick={handleDeleteSeason} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full"><DeleteIcon /></button>
                        </>}
                    </div>
                 </div>
            )}
            
            {/* --- Main Content Area --- */}
            <main id="content-container" className="space-y-8">
                {isSearching ? (
                    <SearchResultsView results={searchResults} setSeasons={handleSetSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />
                ) : (
                    <SeasonView season={activeSeason} activeUnitIds={activeUnitIds} setActiveUnitIds={setActiveUnitIds} setSeasons={handleSetSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal}/>
                )}
            </main>

            {/* --- Modals --- */}
            <ConfirmationModal isOpen={modal === 'confirm'} onCancel={closeModal} {...modalProps} />
            <EditModal isOpen={modal === 'edit'} onCancel={closeModal} {...modalProps} />

        </div>
    );
};

// --- View Components ---

const SeasonView = ({ season, activeUnitIds, setActiveUnitIds, setSeasons, showEditModal, showConfirmModal }) => {
    if (!season) {
        return (
            <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 p-10 rounded-lg">
                <h3 className="text-lg font-semibold">Ingen säsong vald</h3>
                <p>Välj en säsong från listan ovan för att se dess enheter, eller lägg till en ny.</p>
            </div>
        );
    }
    
    const sortedUnits = useMemo(() => [...season.units].sort((a,b) => a.name.localeCompare(b.name)), [season.units]);
    const visibleUnits = useMemo(() => sortedUnits.filter(u => activeUnitIds.includes(u.id)), [sortedUnits, activeUnitIds]);

    const handleAddUnit = (name: string) => {
        if (name) {
            const newUnit: Unit = { id: crypto.randomUUID(), name, quests: [] };
            setSeasons(prev => prev.map(s => s.id === season.id ? { ...s, units: [...s.units, newUnit] } : s));
            setActiveUnitIds(prev => [...prev, newUnit.id]);
        }
    };
    
    return (
        <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg">
            {/* Unit Selector */}
            <div className="mb-6 pb-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Välj enheter att visa</h3>
                {sortedUnits.length > 0 ? (
                    <>
                        <select multiple value={activeUnitIds} onChange={(e) => setActiveUnitIds(Array.from(e.target.selectedOptions, option => option.value))}
                            className="w-full h-40 bg-gray-900/50 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {sortedUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Håll ner Ctrl (eller Cmd på Mac) för att välja flera.</p>
                    </>
                ) : <p className="text-gray-400">Inga enheter har lagts till i denna säsong.</p>}
            </div>

            {/* Visible Units */}
            <div className="units-container space-y-6">
                {visibleUnits.length > 0 
                    ? visibleUnits.map(unit => <UnitCard key={unit.id} seasonId={season.id} unit={unit} setSeasons={setSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />)
                    : <p className="text-gray-400">Inga enheter valda att visa.</p>
                }
            </div>
            
            {/* Add New Unit Form */}
            <div className="mt-6 border-t border-gray-700 pt-4">
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Lägg till ny enhet</h3>
                <form onSubmit={e => { e.preventDefault(); handleAddUnit(e.currentTarget.unitName.value); e.currentTarget.reset(); }} className="flex flex-col sm:flex-row gap-3 items-center">
                    <input name="unitName" type="text" placeholder="Enhetens namn..." required className="flex-grow w-full sm:w-auto bg-gray-700 text-white placeholder-gray-400 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full sm:w-auto">Lägg till</button>
                </form>
            </div>
        </div>
    );
};

const SearchResultsView = ({ results, setSeasons, showEditModal, showConfirmModal }) => {
     if (results.length === 0) {
        return (
            <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 p-10 rounded-lg">
                <h3 className="text-lg font-semibold">Inget resultat</h3>
                <p>Din sökning gav inga träffar.</p>
            </div>
        );
    }
    
    const isUnitSearch = results[0]?.type === 'unit';

    return (
        <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg">
            <h2 className={`text-2xl font-bold mb-4 ${isUnitSearch ? 'text-blue-400' : 'text-green-400'}`}>
                Sökresultat
            </h2>
            <div className="space-y-6">
            {results.map(result => {
                if (result.type === 'unit') {
                     return <UnitCard key={result.unit.id} seasonId={result.season.id} unit={result.unit} setSeasons={setSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal} seasonName={result.season.name} />;
                }
                if (result.type === 'quest') {
                    return (
                        <div key={result.unit.id} className="unit-container bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
                             <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-100">{result.unit.name}</h4>
                                    <p className="text-sm text-yellow-500">{result.season.name}</p>
                                </div>
                            </div>
                            <div className="quests-container ml-4 space-y-2">
                                {result.quests.map(quest => <QuestItem key={quest.id} seasonId={result.season.id} unitId={result.unit.id} quest={quest} setSeasons={setSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />)}
                            </div>
                        </div>
                    );
                }
                return null;
            })}
            </div>
        </div>
    );
};

// --- Component Primitives ---

const UnitCard = ({ seasonId, unit, setSeasons, showEditModal, showConfirmModal, seasonName = null }) => {
    const handleAddQuest = (description: string) => {
        if(description) {
            const newQuest: Quest = { id: crypto.randomUUID(), description, completed: false };
            setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.map(u => u.id === unit.id ? { ...u, quests: [...u.quests, newQuest] } : u) } : s ));
        }
    };
    
    const handleEditUnit = () => {
        showEditModal('Redigera enhet', unit.name, newName => {
            if(newName) {
                setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.map(u => u.id === unit.id ? { ...u, name: newName } : u) } : s ));
            }
        });
    };

    const handleDeleteUnit = () => {
        showConfirmModal('Ta bort enhet?', `Är du säker på att du vill ta bort '${unit.name}' och alla dess uppdrag?`, () => {
            setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.filter(u => u.id !== unit.id) } : s ));
        });
    };
    
    const sortedQuests = useMemo(() => [...unit.quests].sort((a,b) => a.description.localeCompare(b.description)), [unit.quests]);

    return (
        <div className="unit-container bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h4 className="text-xl font-semibold text-gray-100">{unit.name}</h4>
                    {seasonName && <p className="text-sm text-yellow-500 -mt-1">{seasonName}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleEditUnit} className="action-icon text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded-full"><EditIcon size={16} /></button>
                    <button onClick={handleDeleteUnit} className="action-icon text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"><DeleteIcon size={20} /></button>
                </div>
            </div>

            {/* Quests List */}
            <div className="quests-container ml-4 space-y-2">
                {sortedQuests.length > 0 
                    ? sortedQuests.map(q => <QuestItem key={q.id} quest={q} seasonId={seasonId} unitId={unit.id} setSeasons={setSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />)
                    : <p className="text-xs text-gray-500">Inga uppdrag tillagda.</p>
                }
            </div>

            {/* Add Quest Form */}
            <div className="mt-4 ml-4 border-t border-gray-600 pt-3">
                 <form onSubmit={e => { e.preventDefault(); handleAddQuest(e.currentTarget.questDesc.value); e.currentTarget.reset(); }} className="flex flex-col sm:flex-row gap-2 items-center">
                    <input name="questDesc" type="text" placeholder="Beskrivning av nytt uppdrag..." required className="flex-grow w-full sm:w-auto bg-gray-600 text-white placeholder-gray-400 p-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-300 w-full sm:w-auto">Lägg till uppdrag</button>
                </form>
            </div>
        </div>
    );
};

const QuestItem = ({ quest, seasonId, unitId, setSeasons, showEditModal, showConfirmModal }) => {
    
    const handleToggleQuest = (completed: boolean) => {
        setSeasons(prev => prev.map(s => s.id === seasonId
            ? { ...s, units: s.units.map(u => u.id === unitId 
                ? { ...u, quests: u.quests.map(q => q.id === quest.id ? { ...q, completed } : q) }
                : u)
            } : s
        ));
    };

    const handleEditQuest = () => {
        showEditModal('Redigera uppdrag', quest.description, newDesc => {
            if (newDesc) {
                 setSeasons(prev => prev.map(s => s.id === seasonId
                    ? { ...s, units: s.units.map(u => u.id === unitId 
                        ? { ...u, quests: u.quests.map(q => q.id === quest.id ? { ...q, description: newDesc } : q) }
                        : u)
                    } : s
                ));
            }
        });
    };

    const handleDeleteQuest = () => {
        showConfirmModal('Ta bort uppdrag?', 'Är du säker på att du vill ta bort detta uppdrag?', () => {
             setSeasons(prev => prev.map(s => s.id === seasonId
                ? { ...s, units: s.units.map(u => u.id === unitId 
                    ? { ...u, quests: u.quests.filter(q => q.id !== quest.id) }
                    : u)
                } : s
            ));
        });
    };
    
    const questClasses = `quest-item flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-gray-700 ${quest.completed ? 'completed-quest' : ''}`;
    const labelClasses = `flex-grow cursor-pointer ${quest.completed ? 'line-through text-gray-500' : ''}`;

    return (
        <div className={questClasses}>
            <input type="checkbox" checked={quest.completed} onChange={e => handleToggleQuest(e.target.checked)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-yellow-500 focus:ring-yellow-600 cursor-pointer flex-shrink-0" />
            <label onClick={() => handleToggleQuest(!quest.completed)} className={labelClasses}>{quest.description}</label>
            <div className="flex items-center gap-1">
                <button onClick={handleEditQuest} className="action-icon text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded-full"><EditIcon size={14} /></button>
                <button onClick={handleDeleteQuest} className="action-icon text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"><DeleteIcon size={18}/></button>
            </div>
        </div>
    );
};

// --- Modal Components ---

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onCancel();
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="modal-container bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Avbryt</button>
                    <button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Bekräfta</button>
                </div>
            </div>
        </div>
    );
};

const EditModal = ({ isOpen, title, initialValue, onSave, onCancel }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setValue(initialValue);
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (value.trim()) {
            onSave(value.trim());
            onCancel();
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') onCancel();
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="modal-container bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <input type="text" value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKeyDown} autoFocus
                    className="w-full bg-gray-700 text-white placeholder-gray-400 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Avbryt</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Spara</button>
                </div>
            </div>
        </div>
    );
};

// --- NEW: Storage Indicator Component ---
const StorageIndicator = ({ data }) => {
    const limit = 5 * 1024 * 1024; // 5 MB in bytes

    const sizeInBytes = useMemo(() => {
        if (!data) return 0;
        // Using Blob is a more accurate way to get byte size of UTF-8 string
        return new Blob([JSON.stringify(data)]).size;
    }, [data]);
    
    const percentage = useMemo(() => (sizeInBytes / limit) * 100, [sizeInBytes, limit]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const progressBarColor = useMemo(() => {
        if (percentage > 90) return 'bg-red-600';
        if (percentage > 75) return 'bg-yellow-500';
        return 'bg-green-600';
    }, [percentage]);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
                <span>Lagring i webbläsare</span>
                <span>{formatBytes(sizeInBytes)} / {formatBytes(limit)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all duration-500 ${progressBarColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                    title={`Använder ${percentage.toFixed(2)}% av lagringsutrymmet`}
                ></div>
            </div>
        </div>
    );
};

export default App;
