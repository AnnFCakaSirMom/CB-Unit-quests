import React from 'react';
import { Quest } from '../../types';
import { MapPinIcon, EditIcon, DeleteIcon } from '../common/Icons';
import { useSeasons } from '../../context/SeasonContext';

export interface QuestItemProps {
    quest: Quest;
    seasonId: string;
    unitId: string;
    showEditModal: (title: string, initialValue: string, onSave: (value: string) => void) => void;
    showConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
    onNavigate?: (seasonId: string, unitId: string) => void;
}

export const QuestItem: React.FC<QuestItemProps> = ({ quest, seasonId, unitId, showEditModal, showConfirmModal, onNavigate }) => {
    
    const { toggleQuest, editQuest, deleteQuest } = useSeasons();

    const handleToggleQuest = (completed: boolean) => {
        toggleQuest(seasonId, unitId, quest.id, completed);
    };

    const handleEditQuest = () => {
        showEditModal('Edit Quest', quest.description, newDesc => {
            if (newDesc) {
                editQuest(seasonId, unitId, quest.id, newDesc);
            }
        });
    };

    const handleDeleteQuest = () => {
        showConfirmModal('Delete Quest?', 'Are you sure you want to delete this quest?', () => {
             deleteQuest(seasonId, unitId, quest.id);
        });
    };
    
    const questClasses = `flex items-center gap-3 p-1.5 rounded-md transition-colors ${quest.completed ? 'opacity-50' : 'hover:bg-base-300'}`;
    const labelClasses = `flex-grow cursor-pointer text-sm font-medium transition-all ${quest.completed ? 'line-through text-base-content/50' : 'text-base-content'}`;

    return (
        <div className={questClasses}>
            <input type="checkbox" checked={quest.completed} onChange={e => handleToggleQuest(e.target.checked)} className="checkbox checkbox-sm checkbox-info rounded-sm" />
            <label onClick={() => handleToggleQuest(!quest.completed)} className={labelClasses}>{quest.description}</label>
            <div className="flex items-center gap-0.5">
                {onNavigate && (
                    <button onClick={() => onNavigate(seasonId, unitId)} title="Go to unit" className="btn btn-ghost btn-xs btn-circle text-info">
                        <MapPinIcon size={14} />
                    </button>
                )}
                <button onClick={handleEditQuest} title="Edit Quest Description" className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-primary"><EditIcon size={14} /></button>
                <button onClick={handleDeleteQuest} title="Delete Quest" className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error"><DeleteIcon size={16}/></button>
            </div>
        </div>
    );
};
