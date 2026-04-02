import React, { useMemo } from 'react';
import { Unit } from '../../types';
import { MapPinIcon, EditIcon, DeleteIcon } from '../common/Icons';
import { useSeasons } from '../../context/SeasonContext';
import { QuestItem } from './QuestItem';

export interface UnitCardProps {
    seasonId: string;
    unit: Unit;
    showEditModal: (title: string, initialValue: string, onSave: (value: string) => void) => void;
    showConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
    seasonName?: string | null;
    onNavigate?: (seasonId: string, unitId: string) => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ seasonId, unit, showEditModal, showConfirmModal, seasonName = null, onNavigate }) => {
    
    const { editUnit, deleteUnit, addQuest } = useSeasons();

    const handleEditUnit = () => {
        showEditModal('Edit Unit', unit.name, newName => {
            if(newName) {
                editUnit(seasonId, unit.id, newName);
            }
        });
    };

    const handleDeleteUnit = () => {
        showConfirmModal('Delete Unit?', `Are you sure you want to delete '${unit.name}' and all of its quests?`, () => {
            deleteUnit(seasonId, unit.id);
        });
    };

    const handleAddQuestSubmit = (e: React.FormEvent<HTMLFormElement & { questDesc: HTMLInputElement }>) => {
        e.preventDefault();
        const questDesc = e.currentTarget.questDesc.value;
        if (questDesc) {
            addQuest(seasonId, unit.id, questDesc);
        }
        e.currentTarget.reset();
    };
    
    const sortedQuests = useMemo(() => [...unit.quests].sort((a,b) => a.description.localeCompare(b.description)), [unit.quests]);

    return (
        <div id={unit.id} className="unit-container bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500 transition-all duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex-grow">
                    <h4 className="text-xl font-semibold text-gray-100">{unit.name}</h4>
                    {seasonName && <p className="text-sm text-yellow-500 -mt-1">{seasonName}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {onNavigate && (
                        <button onClick={() => onNavigate(seasonId, unit.id)} title="Go to unit" className="bg-gray-700/50 hover:bg-gray-700 text-blue-400 font-bold p-1.5 rounded-md transition duration-300">
                            <MapPinIcon size={16} />
                        </button>
                    )}
                    <button onClick={handleEditUnit} className="action-icon text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded-full"><EditIcon size={16} /></button>
                    <button onClick={handleDeleteUnit} className="action-icon text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"><DeleteIcon size={20} /></button>
                </div>
            </div>

            {/* Quests List */}
            <div className="quests-container ml-4 space-y-2">
                {sortedQuests.length > 0 
                    ? sortedQuests.map(q => <QuestItem key={q.id} quest={q} seasonId={seasonId} unitId={unit.id} showEditModal={showEditModal} showConfirmModal={showConfirmModal} onNavigate={onNavigate} />)
                    : <p className="text-xs text-gray-500">No quests added.</p>
                }
            </div>

            {/* Add Quest Form */}
            <div className="mt-4 ml-4 border-t border-gray-600 pt-3">
                 <form onSubmit={handleAddQuestSubmit} className="flex flex-col sm:flex-row gap-2 items-center">
                    <input name="questDesc" type="text" placeholder="Description of new quest..." required className="flex-grow w-full sm:w-auto bg-gray-600 text-white placeholder-gray-400 p-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-300 w-full sm:w-auto">Add Quest</button>
                </form>
            </div>
        </div>
    );
};
