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
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="modal-container bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Arrange Seasons</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><DeleteIcon size={24}/></button>
                </div>
                <p className="text-gray-400 text-sm mb-4">Move seasons up to make them appear newer (at the top of the selector).</p>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {seasons.map((season, index) => (
                        <div key={season.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md border border-gray-600">
                            <span className="text-white font-medium truncate flex-grow mr-4">{season.name}</span>
                            <div className="flex gap-1 flex-shrink-0">
                                <button 
                                    onClick={() => onSwap(season.id, seasons[index - 1].id)} 
                                    disabled={index === 0}
                                    title="Move Up"
                                    className="p-1 text-gray-400 hover:text-yellow-500 disabled:opacity-20 disabled:hover:text-gray-400 transition-colors"
                                >
                                    <ChevronUpIcon />
                                </button>
                                <button 
                                    onClick={() => onSwap(season.id, seasons[index + 1].id)} 
                                    disabled={index === seasons.length - 1}
                                    title="Move Down"
                                    className="p-1 text-gray-400 hover:text-yellow-500 disabled:opacity-20 disabled:hover:text-gray-400 transition-colors"
                                >
                                    <ChevronDownIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-md transition duration-300">Done</button>
                </div>
            </div>
        </div>
    );
};
