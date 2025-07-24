import React, { useState, useEffect, useMemo } from 'react';
import { Season, Unit, Quest } from './types';

// --- Icon Components (inlined to fix resolution error) ---
interface IconProps {
  size?: number;
  className?: string;
}

const SaveIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const UploadIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const SearchIcon: React.FC<IconProps> = ({ size = 20, className = "text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
  </svg>
);

const DeleteIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const FlameIcon: React.FC<IconProps> = ({ size = 40, className = "text-yellow-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 14c-2.07 0-3.81-1.33-4.5-3.12-1.33-3.5-2.04-7.88-2-10.88 2.5.88 5.13 2.63 6.5 5.5A5 5 0 0 1 15 14Z"></path>
    <path d="M4 14c-1.25 1.25-2 2.9-2 4.5 0 3 4 4.5 6 4.5 1.76 0 3.26-1.08 4-2.5"></path>
  </svg>
);

const CheckmarkIcon: React.FC<IconProps> = ({ size = 18, className = "text-green-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

// --- Main Application Component ---
const App: React.FC = () => {
    // --- State Management ---
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
    const [activeUnitIds, setActiveUnitIds] = useState<string[]>([]);
    
    const [unitSearchQuery, setUnitSearchQuery] = useState('');
    const [questSearchQuery, setQuestSearchQuery] = useState('');

    const [modal, setModal] = useState<'confirm' | 'edit' | null>(null);
    const [modalProps, setModalProps] = useState<any>({});
    
    // MODIFIED: Added state to hold the file handle
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
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
        showEditModal('Add New Season', '', name => {
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
            showEditModal('Edit Season', activeSeason.name, newName => {
                if (newName) {
                    handleSetSeasons(prev => prev.map(s => s.id === activeSeasonId ? { ...s, name: newName } : s));
                }
            });
        }
    };

    const handleDeleteSeason = () => {
        if (activeSeason) {
            showConfirmModal('Delete Season?', `Are you sure you want to delete '${activeSeason.name}'? This action cannot be undone.`, () => {
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
    
    // MODIFIED: File Operations to remember the last file
    const handleSaveFile = async () => {
        if (!window.showSaveFilePicker) {
            alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.");
            return;
        }

        try {
            // Use the existing file handle if it exists, otherwise prompt the user to select a file.
            const handle = fileHandle || await window.showSaveFilePicker({
                suggestedName: `conquerors-blade-data.json`,
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
            });

            // If a new file was selected (i.e., we didn't have a handle before), store it.
            if (!fileHandle) {
                setFileHandle(handle);
            }

            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(seasons, null, 2));
            await writable.close();
            setFileInfo(`Saved to: ${handle.name}`);
            setSaveStatus('saving');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error saving file:', err);
                 // If permission is denied, the handle might be invalid. Clear it to re-prompt next time.
                 if (err.name === 'NotAllowedError') {
                    setFileHandle(null);
                    setFileInfo('Save permission denied. Please try saving again.');
                }
            }
        }
    };

    const handleImportFile = async () => {
        if (!window.showOpenFilePicker) {
            alert("Your browser does not support the File System Access API.");
            return;
        }
        try {
            const [handle] = await window.showOpenFilePicker({
                 types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
            });
            const file = await handle.getFile();
            const content = await file.text();
            const importedData = JSON.parse(content);
            
            if (!Array.isArray(importedData)) throw new Error("Invalid file format.");

            showConfirmModal("Import Data?", "This will replace all current data. Do you want to continue?", () => {
                // Basic data validation and ID generation
                const sanitizedData: Season[] = importedData.map((s: any) => ({
                    id: s.id || crypto.randomUUID(),
                    name: s.name || "Unnamed Season",
                    units: (s.units || []).map((u: any) => ({
                        id: u.id || crypto.randomUUID(),
                        name: u.name || "Unnamed Unit",
                        quests: (u.quests || []).map((q: any) => ({
                            id: q.id || crypto.randomUUID(),
                            description: q.description || "Unnamed Quest",
                            completed: !!q.completed
                        }))
                    }))
                }));
                
                setSeasons(sanitizedData);
                const firstSeason = [...sanitizedData].sort((a,b) => a.name.localeCompare(b.name))[0];
                setActiveSeasonId(firstSeason?.id || null);
                setActiveUnitIds(firstSeason?.units.map(u => u.id) || []);
                
                // MODIFIED: Store the handle of the imported file
                setFileHandle(handle);
                setFileInfo(`Imported from: ${handle.name}`);
            });

        } catch (err: any) {
             if (err.name !== 'AbortError') {
                 console.error('Error importing file:', err);
                 alert(`Error during import: ${err.message}`);
                 setFileHandle(null); // Clear handle on error
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
                <p className="text-gray-400 mt-3">Import your .json file to load data. Don't forget to save your changes.</p>
            </header>

            {/* --- Data Management & Search --- */}
            <div className="section-card bg-gray-800/80 border border-gray-700 backdrop-blur-sm p-4 rounded-lg mb-6 sticky top-4 z-20">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                     {/* Search Inputs */}
                    <div className="flex-grow grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="search" value={unitSearchQuery} onChange={e => { setUnitSearchQuery(e.target.value); setQuestSearchQuery(''); }} placeholder="Search unit..." className="w-full bg-gray-700 text-white placeholder-gray-400 p-2.5 pl-10 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        </div>
                        <div className="relative">
                            <input type="search" value={questSearchQuery} onChange={e => { setQuestSearchQuery(e.target.value); setUnitSearchQuery(''); }} placeholder="Search quest..." className="w-full bg-gray-700 text-white placeholder-gray-400 p-2.5 pl-10 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"/>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        </div>
                    </div>

                    {/* File Controls */}
                    <div className="flex gap-2 items-center">
                        <p className="text-xs text-gray-500 self-center mr-2 hidden sm:block">{fileInfo}</p>
                         {/* MODIFIED: Changed onClick to call the new handleSaveFile function */}
                         <button onClick={handleSaveFile} title="Save data" className={`flex items-center justify-center bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 text-gray-300 hover:text-white p-2 rounded-md transition-all duration-300 ${saveStatus === 'saving' ? 'border-green-500' : ''}`}>
                             {saveStatus === 'saving' ? <CheckmarkIcon /> : <SaveIcon />}
                         </button>
                        <button onClick={handleImportFile} title="Import from .json file" className="flex items-center justify-center bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 text-gray-300 hover:text-white p-2 rounded-md transition-all duration-300">
                            <UploadIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Season Selector --- */}
            {!isSearching && (
                 <div className="section-card bg-gray-800 border border-gray-700 p-5 rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">Select Season</h2>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <select value={activeSeasonId || ''} onChange={handleSeasonChange} className="flex-grow w-full bg-gray-700 text-white p-2.5 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" disabled={seasons.length === 0}>
                            <option value="" disabled>Select a season...</option>
                            {sortedSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button onClick={handleAddSeason} title="Add New Season" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-2.5 rounded-md transition duration-300"><PlusIcon /></button>
                        {activeSeason && <>
                            <button onClick={handleEditSeason} className="text-gray-500 hover:text-yellow-400 transition-colors p-2 rounded-full"><EditIcon /></button>
                            <button onClick={handleDeleteSeason} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full"><DeleteIcon /></button>
                        </> }
                    </div>
                 </div>
            )}
            
            {/* --- Main Content Area --- */}
            <main id="content-container" className="space-y-8">
                {seasons.length === 0 && !isSearching ? (
                    <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 p-10 rounded-lg">
                        <h3 className="text-2xl font-semibold text-gray-200">Welcome!</h3>
                        <p className="mt-2">The application is empty. Start by importing a data file using the import button above.</p>
                        <p className="mt-4 text-sm">If you don't have a file, you can start from scratch by creating a new season.</p>
                    </div>
                ) : isSearching ? (
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
                <h3 className="text-lg font-semibold">No Season Selected</h3>
                <p>Select a season from the list above to see its units, or add a new one.</p>
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
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Select units to display</h3>
                {sortedUnits.length > 0 ? (
                    <>
                        <select multiple value={activeUnitIds} onChange={(e) => setActiveUnitIds(Array.from(e.target.selectedOptions, option => option.value))}
                            className="w-full h-40 bg-gray-900/50 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {sortedUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
                    </>
                ) : <p className="text-gray-400">No units have been added to this season.</p>}
            </div>

            {/* Visible Units */}
            <div className="units-container space-y-6">
                {visibleUnits.length > 0 
                    ? visibleUnits.map(unit => <UnitCard key={unit.id} seasonId={season.id} unit={unit} setSeasons={setSeasons} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />)
                    : <p className="text-gray-400">No units selected for display.</p>
                }
            </div>
            
            {/* Add New Unit Form */}
            <div className="mt-6 border-t border-gray-700 pt-4">
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Add New Unit</h3>
                <form onSubmit={e => { e.preventDefault(); handleAddUnit(e.currentTarget.unitName.value); e.currentTarget.reset(); }} className="flex flex-col sm:flex-row gap-3 items-center">
                    <input name="unitName" type="text" placeholder="Unit name..." required className="flex-grow w-full sm:w-auto bg-gray-700 text-white placeholder-gray-400 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full sm:w-auto">Add</button>
                </form>
            </div>
        </div>
    );
};

const SearchResultsView = ({ results, setSeasons, showEditModal, showConfirmModal }) => {
     if (results.length === 0) {
        return (
            <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 p-10 rounded-lg">
                <h3 className="text-lg font-semibold">No Results</h3>
                <p>Your search did not match any data.</p>
            </div>
        );
    }
    
    const isUnitSearch = results[0]?.type === 'unit';

    return (
        <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg">
            <h2 className={`text-2xl font-bold mb-4 ${isUnitSearch ? 'text-blue-400' : 'text-green-400'}`}>
                Search Results
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
        showEditModal('Edit Unit', unit.name, newName => {
            if(newName) {
                setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, units: s.units.map(u => u.id === unit.id ? { ...u, name: newName } : u) } : s ));
            }
        });
    };

    const handleDeleteUnit = () => {
        showConfirmModal('Delete Unit?', `Are you sure you want to delete '${unit.name}' and all of its quests?`, () => {
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
                    : <p className="text-xs text-gray-500">No quests added.</p>
                }
            </div>

            {/* Add Quest Form */}
            <div className="mt-4 ml-4 border-t border-gray-600 pt-3">
                 <form onSubmit={e => { e.preventDefault(); handleAddQuest(e.currentTarget.questDesc.value); e.currentTarget.reset(); }} className="flex flex-col sm:flex-row gap-2 items-center">
                    <input name="questDesc" type="text" placeholder="Description of new quest..." required className="flex-grow w-full sm:w-auto bg-gray-600 text-white placeholder-gray-400 p-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-300 w-full sm:w-auto">Add Quest</button>
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
        showEditModal('Edit Quest', quest.description, newDesc => {
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
        showConfirmModal('Delete Quest?', 'Are you sure you want to delete this quest?', () => {
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
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                    <button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Confirm</button>
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
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Save</button>
                </div>
            </div>
        </div>
    );
};

export default App;
