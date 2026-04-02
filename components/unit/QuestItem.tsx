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
    
    const questClasses = `quest-item flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-gray-700 ${quest.completed ? 'completed-quest' : ''}`;
    const labelClasses = `flex-grow cursor-pointer ${quest.completed ? 'line-through text-gray-500' : ''}`;

    return (
        <div className={questClasses}>
            <input type="checkbox" checked={quest.completed} onChange={e => handleToggleQuest(e.target.checked)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-yellow-500 focus:ring-yellow-600 cursor-pointer flex-shrink-0" />
            <label onClick={() => handleToggleQuest(!quest.completed)} className={labelClasses}>{quest.description}</label>
            <div className="flex items-center gap-1">
                {onNavigate && (
                    <button onClick={() => onNavigate(seasonId, unitId)} title="Go to unit" className="action-icon text-gray-500 hover:text-blue-400 transition-colors p-1 rounded-full">
                        <MapPinIcon size={14} />
                    </button>
                )}
                <button onClick={handleEditQuest} className="action-icon text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded-full"><EditIcon size={14} /></button>
                <button onClick={handleDeleteQuest} className="action-icon text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"><DeleteIcon size={18}/></button>
            </div>
        </div>
    );
};
