import React from 'react';
import type { SearchResult } from '../../context/SeasonContext';
import { UnitCard } from '../unit/UnitCard';
import { QuestItem } from '../unit/QuestItem';
import { MapPinIcon } from '../common/Icons';

export interface SearchResultsViewProps {
    results: SearchResult[];
    showEditModal: (title: string, initialValue: string, onSave: (value: string) => void) => void;
    showConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
    onNavigate: (seasonId: string, unitId: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ results, showEditModal, showConfirmModal, onNavigate }) => {
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
                    return <UnitCard key={result.unit.id} seasonId={result.season.id} unit={result.unit} showEditModal={showEditModal} showConfirmModal={showConfirmModal} seasonName={result.season.name} onNavigate={onNavigate} />;
                }
                if (result.type === 'quest') {
                    return (
                        <div key={result.unit.id} className="unit-container bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex-grow">
                                    <h4 className="text-xl font-semibold text-gray-100">{result.unit.name}</h4>
                                    <p className="text-sm text-yellow-500">{result.season.name}</p>
                                </div>
                                <button onClick={() => onNavigate(result.season.id, result.unit.id)} title="Go to unit" className="bg-gray-700/50 hover:bg-gray-700 text-green-400 font-bold p-2 rounded-md transition duration-300">
                                    <MapPinIcon size={18} />
                                </button>
                            </div>
                            <div className="quests-container ml-4 space-y-2">
                                {result.quests.map(quest => <QuestItem key={quest.id} seasonId={result.season.id} unitId={result.unit.id} quest={quest} showEditModal={showEditModal} showConfirmModal={showConfirmModal} onNavigate={onNavigate} />)}
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
