import React from 'react';
import { Season } from '../../types';
import { DeleteIcon, ChevronUpIcon, ChevronDownIcon } from '../common/Icons';

export interface ManageOrderModalProps {
    isOpen: boolean;
    seasons: Season[];
    onSwap: (id1: string, id2: string) => void;
    onClose: () => void;
}

export const ManageOrderModal: React.FC<ManageOrderModalProps> = ({ isOpen, seasons, onSwap, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box bg-base-200 border border-base-300 shadow-xl max-h-[80vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-base-content">Arrange Seasons</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><DeleteIcon size={20}/></button>
                </div>
                <p className="text-base-content/70 text-sm mb-4">Move seasons up to make them appear newer (at the top of the selector).</p>
                
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {seasons.map((season, index) => (
                        <div key={season.id} className="flex items-center justify-between bg-base-300 p-2 rounded-md border border-base-100">
                            <span className="text-base-content font-medium truncate flex-grow mr-4 ml-2">{season.name}</span>
                            <div className="flex gap-1 flex-shrink-0">
                                <button 
                                    onClick={() => onSwap(season.id, seasons[index - 1].id)} 
                                    disabled={index === 0}
                                    title="Move Up"
                                    className="btn btn-circle btn-xs btn-ghost text-base-content/50 hover:text-primary"
                                >
                                    <ChevronUpIcon />
                                </button>
                                <button 
                                    onClick={() => onSwap(season.id, seasons[index + 1].id)} 
                                    disabled={index === seasons.length - 1}
                                    title="Move Down"
                                    className="btn btn-circle btn-xs btn-ghost text-base-content/50 hover:text-primary"
                                >
                                    <ChevronDownIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="modal-action mt-6 justify-end">
                    <button onClick={onClose} className="btn btn-primary px-8">Done</button>
                </div>
            </div>
        </div>
    );
};
