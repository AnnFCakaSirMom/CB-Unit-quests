import React, { useMemo } from 'react';
import { Season } from '../../types';
import { useSeasons } from '../../context/SeasonContext';
import { UnitCard } from '../unit/UnitCard';

export interface SeasonViewProps {
    season: Season | undefined;
    showEditModal: (title: string, initialValue: string, onSave: (value: string) => void) => void;
    showConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

export const SeasonView: React.FC<SeasonViewProps> = ({ season, showEditModal, showConfirmModal }) => {
    const { activeUnitIds, setActiveUnitIds, addUnit } = useSeasons();

    if (!season) {
        return (
            <div className="alert alert-info bg-base-200 border border-base-300 shadow-sm">
                <div>
                    <h3 className="font-bold">No Season Selected</h3>
                    <div className="text-xs">Select a season from the list above to see its units, or add a new one.</div>
                </div>
            </div>
        );
    }
    
    const sortedUnits = useMemo(() => [...season.units].sort((a,b) => a.name.localeCompare(b.name)), [season.units]);
    const visibleUnits = useMemo(() => sortedUnits.filter(u => activeUnitIds.includes(u.id)), [sortedUnits, activeUnitIds]);

    const handleAddUnitSubmit = (e: React.FormEvent<HTMLFormElement & { unitName: HTMLInputElement }>) => {
        e.preventDefault();
        const unitName = e.currentTarget.unitName.value;
        if (unitName) {
            addUnit(season.id, unitName);
        }
        e.currentTarget.reset();
    };
    
    return (
        <div className="card bg-base-200 shadow-sm border border-base-300 p-4">
            {/* Unit Selector */}
            <div className="mb-4 pb-4 border-b border-base-300">
                <h3 className="text-lg font-bold text-base-content mb-2">Select units to display</h3>
                {sortedUnits.length > 0 ? (
                    <>
                        <div className="w-full h-48 bg-base-300 border border-base-100 rounded-btn p-1 overflow-y-auto custom-scrollbar">
                            {sortedUnits.map(unit => {
                                const isSelected = activeUnitIds.includes(unit.id);
                                return (
                                    <div 
                                        key={unit.id} 
                                        onClick={() => {
                                            if (isSelected) {
                                                setActiveUnitIds(activeUnitIds.filter(id => id !== unit.id));
                                            } else {
                                                setActiveUnitIds([...activeUnitIds, unit.id]);
                                            }
                                        }}
                                        className={`px-3 py-0.5 mb-0.5 rounded-md cursor-pointer transition-all select-none text-base border border-transparent ${
                                            isSelected 
                                                ? 'bg-info text-white font-bold shadow-sm' 
                                                : 'text-base-content hover:bg-info/10 hover:border-info/30'
                                        }`}
                                    >
                                        {unit.name}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-base-content/50 mt-1.5 ml-1 italic">Click on a unit to show/hide it below.</p>
                    </>
                ) : <p className="text-base-content/50 text-sm">No units have been added to this season.</p>}
            </div>

            {/* Visible Units */}
            <div className="units-container space-y-4">
                {visibleUnits.length > 0 
                    ? visibleUnits.map(unit => <UnitCard key={unit.id} seasonId={season.id} unit={unit} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />)
                    : <p className="text-base-content/50 italic text-sm">No units selected for display.</p>
                }
            </div>
            
            {/* Add New Unit Form */}
            <div className="mt-4 pt-4 border-t border-base-300">
                <h3 className="text-lg font-bold text-base-content mb-2">Add New Unit</h3>
                <form onSubmit={handleAddUnitSubmit} className="flex flex-col sm:flex-row gap-2 items-center join w-full">
                    <input name="unitName" type="text" placeholder="Unit name..." required className="input input-sm input-bordered join-item flex-grow w-full bg-base-300" />
                    <button type="submit" className="btn btn-sm btn-info join-item w-full sm:w-auto">Add Unit</button>
                </form>
            </div>
        </div>
    );
};
