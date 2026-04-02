import React, { useState } from 'react';
import { Season } from './types';
import { FlameIcon, SaveIcon, UploadIcon, SearchIcon, ListIcon, PlusIcon, EditIcon, DeleteIcon } from './components/common/Icons';
import { SeasonProvider, useSeasons } from './context/SeasonContext';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { SeasonView } from './components/season/SeasonView';
import { SearchResultsView } from './components/season/SearchResultsView';
import { ConfirmationModal, ConfirmationModalProps } from './components/modals/ConfirmationModal';
import { EditModal, EditModalProps } from './components/modals/EditModal';
import { ManageOrderModal } from './components/modals/ManageOrderModal';

const AppContent: React.FC = () => {
    const {
        seasons, setSeasons,
        activeSeasonId, setActiveSeasonId,
        setActiveUnitIds,
        unitSearchQuery, setUnitSearchQuery,
        questSearchQuery, setQuestSearchQuery,
        activeSeason,
        sortedSeasons,
        searchResults,
        isSearching,
        isDirty, setIsDirty,
        addSeason, editSeason, deleteSeason, swapSeasonOrder
    } = useSeasons();

    useUnsavedChanges(isDirty);

    const [modal, setModal] = useState<'confirm' | 'edit' | 'order' | null>(null);
    const [modalProps, setModalProps] = useState<Partial<ConfirmationModalProps & EditModalProps>>({});
    
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
    const [fileInfo, setFileInfo] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle'|'saving'>('idle');

    const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
        setModalProps({ title, message, onConfirm });
        setModal('confirm');
    };

    const showEditModal = (title: string, initialValue: string, onSave: (value: string) => void) => {
        setModalProps({ title, initialValue, onSave });
        setModal('edit');
    };

    const closeModal = () => setModal(null);

    // Season Management Handlers
    const handleAddSeason = () => {
        showEditModal('Add New Season', '', name => { if (name) addSeason(name); });
    };

    const handleEditSeason = () => {
        if (activeSeason) {
            showEditModal('Edit Season', activeSeason.name, newName => { if (newName) editSeason(activeSeason.id, newName); });
        }
    };

    const handleDeleteSeason = () => {
        if (activeSeason) {
            showConfirmModal('Delete Season?', `Are you sure you want to delete '${activeSeason.name}'? This action cannot be undone.`, () => {
                deleteSeason(activeSeason.id);
            });
        }
    };
    
    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setActiveSeasonId(newId);
        const newSeason = seasons.find(s => s.id === newId);
        setActiveUnitIds(newSeason ? newSeason.units.map(u => u.id) : []);
    };
    
    const handleNavigateToResult = (seasonId: string, unitId: string) => {
        setUnitSearchQuery('');
        setQuestSearchQuery('');
        setActiveSeasonId(seasonId);
        
        const targetSeason = seasons.find(s => s.id === seasonId);
        if (targetSeason) {
            setActiveUnitIds(targetSeason.units.map(u => u.id));
        }

        setTimeout(() => {
            const element = document.getElementById(unitId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-4', 'ring-yellow-500/50', 'ring-offset-2', 'ring-offset-gray-900');
                setTimeout(() => {
                    element.classList.remove('ring-4', 'ring-yellow-500/50', 'ring-offset-2', 'ring-offset-gray-900');
                }, 2000);
            }
        }, 100);
    };
    
    // File Operations
    const handleSaveFile = async () => {
        if (!window.showSaveFilePicker) {
            alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.");
            return;
        }

        try {
            const handle = fileHandle || await window.showSaveFilePicker({
                suggestedName: `conquerors-blade-data.json`,
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
            });

            if (!fileHandle) setFileHandle(handle);

            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(seasons, null, 2));
            await writable.close();
            
            setFileInfo(`Saved to: ${handle.name}`);
            setSaveStatus('saving');
            setIsDirty(false); // Reset dirty flag upon successful save
            
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error saving file:', err);
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
                const now = Date.now();
                const sanitizedData: Season[] = importedData.map((s: any, index: number) => ({
                    id: s.id || crypto.randomUUID(),
                    name: s.name || "Unnamed Season",
                    createdAt: s.createdAt || (now - (importedData.length - index) * 1000),
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
                const newestSeason = [...sanitizedData].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
                setActiveSeasonId(newestSeason?.id || null);
                setActiveUnitIds(newestSeason?.units.map(u => u.id) || []);
                
                setFileHandle(handle);
                setFileInfo(`Imported from: ${handle.name}`);
                setIsDirty(false); // Reset dirty flag on fresh import
            });

        } catch (err: any) {
             if (err.name !== 'AbortError') {
                 console.error('Error importing file:', err);
                 alert(`Error during import: ${err.message}`);
                 setFileHandle(null);
             }
        }
    };

    return (
        <div id="app" className="container mx-auto p-4 md:p-8 max-w-5xl">
            <header className="text-center mb-10">
                <div className="flex justify-center items-center gap-4">
                    <FlameIcon />
                    <h1 className="text-5xl font-cinzel font-bold text-yellow-400 tracking-wider">Conqueror's Blade Tracker</h1>
                </div>
                <p className="text-gray-400 mt-3">Import your .json file to load data. Don't forget to save your changes.</p>
            </header>

            <div className="section-card bg-gray-800/80 border border-gray-700 backdrop-blur-sm p-4 rounded-lg mb-6 sticky top-4 z-20">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-grow grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="search" value={unitSearchQuery} onChange={e => { setUnitSearchQuery(e.target.value); setQuestSearchQuery(''); }} placeholder="Search unit..." className="input input-bordered w-full pl-10 focus:border-info outline-none bg-base-300"/>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        </div>
                        <div className="relative">
                            <input type="search" value={questSearchQuery} onChange={e => { setQuestSearchQuery(e.target.value); setUnitSearchQuery(''); }} placeholder="Search quest..." className="input input-bordered w-full pl-10 focus:border-info outline-none bg-base-300"/>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <p className="text-xs text-base-content/50 self-center mr-2 hidden sm:block">{fileInfo}</p>
                         <button onClick={handleSaveFile} title="Save data" className={`btn ${saveStatus === 'saving' ? 'btn-info' : 'btn-ghost btn-outline'} relative gap-2`}>
                              {isDirty && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-info"></span></span>}
                              {saveStatus === 'saving' ? <><span className="loading loading-spinner loading-xs"></span></> : <SaveIcon />}
                         </button>
                        <button onClick={handleImportFile} title="Import from .json file" className="btn btn-ghost btn-outline">
                            <UploadIcon />
                        </button>
                    </div>
                </div>
            </div>

            {!isSearching && (
                 <div className="card bg-base-200 border border-base-300 p-4 mb-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-base-content">Select Season</h2>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <select value={activeSeasonId || ''} onChange={handleSeasonChange} className="select select-bordered w-full flex-grow bg-base-300 focus:border-info outline-none" disabled={seasons.length === 0}>
                            <option value="" disabled>Select a season...</option>
                            {sortedSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button onClick={() => setModal('order')} title="Manage Season Order" className="btn btn-outline" disabled={seasons.length < 2}><ListIcon /></button>
                        <button onClick={handleAddSeason} title="Add New Season" className="btn btn-ghost btn-outline border-base-content/20 hover:bg-info hover:text-white"><PlusIcon /></button>
                        {activeSeason && <>
                            <div className="divider divider-horizontal mx-0"></div>
                            <button onClick={handleEditSeason} title="Edit Season Name" className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary"><EditIcon size={18} /></button>
                            <button onClick={handleDeleteSeason} title="Delete Season" className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-error"><DeleteIcon size={20} /></button>
                        </> }
                    </div>
                 </div>
            )}
            
            <main id="content-container" className="space-y-8">
                {seasons.length === 0 && !isSearching ? (
                    <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 p-10 rounded-lg">
                        <h3 className="text-2xl font-semibold text-gray-200">Welcome!</h3>
                        <p className="mt-2">The application is empty. Start by importing a data file using the import button above.</p>
                        <p className="mt-4 text-sm">If you don't have a file, you can start from scratch by creating a new season.</p>
                    </div>
                ) : isSearching ? (
                    <SearchResultsView results={searchResults} showEditModal={showEditModal} showConfirmModal={showConfirmModal} onNavigate={handleNavigateToResult} />
                ) : (
                    <SeasonView season={activeSeason} showEditModal={showEditModal} showConfirmModal={showConfirmModal}/>
                )}
            </main>

            <ConfirmationModal isOpen={modal === 'confirm'} onCancel={closeModal} {...modalProps} />
            <EditModal isOpen={modal === 'edit'} onCancel={closeModal} {...modalProps} />
            <ManageOrderModal isOpen={modal === 'order'} seasons={sortedSeasons} onSwap={swapSeasonOrder} onClose={closeModal} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <SeasonProvider>
            <AppContent />
        </SeasonProvider>
    );
};

export default App;