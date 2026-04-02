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
            <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 p-10 rounded-lg">
                <h3 className="text-lg font-semibold">No Season Selected</h3>
                <p>Select a season from the list above to see its units, or add a new one.</p>
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
                    ? visibleUnits.map(unit => <UnitCard key={unit.id} seasonId={season.id} unit={unit} showEditModal={showEditModal} showConfirmModal={showConfirmModal} />)
                    : <p className="text-gray-400">No units selected for display.</p>
                }
            </div>
            
            {/* Add New Unit Form */}
            <div className="mt-6 border-t border-gray-700 pt-4">
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Add New Unit</h3>
                <form onSubmit={handleAddUnitSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
                    <input name="unitName" type="text" placeholder="Unit name..." required className="flex-grow w-full sm:w-auto bg-gray-700 text-white placeholder-gray-400 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full sm:w-auto">Add</button>
                </form>
            </div>
        </div>
    );
};
