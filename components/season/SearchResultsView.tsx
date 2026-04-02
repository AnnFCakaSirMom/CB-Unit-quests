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
            <div className="alert alert-warning bg-base-200 border border-base-300 shadow-sm">
                <div>
                    <h3 className="font-bold">No Results</h3>
                    <div className="text-xs">Your search did not match any data.</div>
                </div>
            </div>
        );
    }
    

    return (
        <div className="card bg-base-200 shadow-sm border border-base-300 p-4">
            <h2 className="text-xl font-bold mb-4 text-info">
                Search Results
            </h2>
            <div className="space-y-6">
            {results.map(result => {
                if (result.type === 'unit') {
                    return <UnitCard key={result.unit.id} seasonId={result.season.id} unit={result.unit} showEditModal={showEditModal} showConfirmModal={showConfirmModal} seasonName={result.season.name} onNavigate={onNavigate} />;
                }
                if (result.type === 'quest') {
                    return (
                        <div key={result.unit.id} className="card bg-base-300 shadow-sm border-l-4 border-info/50 p-3 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex-grow">
                                    <h4 className="text-lg font-bold text-base-content m-0">{result.unit.name}</h4>
                                    <p className="text-xs text-info m-0 mt-1 font-semibold">{result.season.name}</p>
                                </div>
                                <button onClick={() => onNavigate(result.season.id, result.unit.id)} title="Go to unit" className="btn btn-sm btn-ghost btn-circle text-info">
                                    <MapPinIcon size={16} />
                                </button>
                            </div>
                            <div className="quests-container ml-2 space-y-1">
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
