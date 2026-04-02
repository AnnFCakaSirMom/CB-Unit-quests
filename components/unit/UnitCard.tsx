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
        <div id={unit.id} className="card bg-base-200 shadow-sm border-l-4 border-secondary p-4 transition-all duration-500 mb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex-grow">
                    <h4 className="text-xl font-bold text-base-content m-0 leading-tight">{unit.name}</h4>
                    {seasonName && <p className="text-sm text-primary m-0 mt-1 font-semibold">{seasonName}</p>}
                </div>
                <div className="flex items-center gap-1">
                    {onNavigate && (
                        <button onClick={() => onNavigate(seasonId, unit.id)} title="Go to unit" className="btn btn-ghost btn-sm btn-circle text-info">
                            <MapPinIcon size={16} />
                        </button>
                    )}
                    <button onClick={handleEditUnit} title="Edit Unit Name" className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary"><EditIcon size={18} /></button>
                    <button onClick={handleDeleteUnit} title="Delete Unit" className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-error"><DeleteIcon size={20} /></button>
                </div>
            </div>

            {/* Quests List */}
            <div className="quests-container ml-2 space-y-1">
                {sortedQuests.length > 0 
                    ? sortedQuests.map(q => <QuestItem key={q.id} quest={q} seasonId={seasonId} unitId={unit.id} showEditModal={showEditModal} showConfirmModal={showConfirmModal} onNavigate={onNavigate} />)
                    : <p className="text-sm text-base-content/50 italic py-2 pl-2">No quests added.</p>
                }
            </div>

            {/* Add Quest Form */}
            <div className="mt-4 pt-3 border-t border-base-300">
                 <form onSubmit={handleAddQuestSubmit} className="flex flex-col sm:flex-row gap-2 items-center join">
                    <input name="questDesc" type="text" placeholder="Description of new quest..." required className="input input-sm input-bordered join-item flex-grow w-full bg-base-300" />
                    <button type="submit" className="btn btn-sm btn-success join-item w-full sm:w-auto text-white">Add Quest</button>
                </form>
            </div>
        </div>
    );
};
