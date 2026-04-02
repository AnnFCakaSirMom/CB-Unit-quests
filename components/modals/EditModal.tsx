import React, { useState, useEffect } from 'react';

export interface EditModalProps {
  isOpen: boolean;
  title: string;
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export const EditModal: React.FC<Partial<EditModalProps>> = ({ isOpen, title, initialValue = '', onSave, onCancel }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setValue(initialValue);
    }, [isOpen, initialValue]);
    
    if (!isOpen || !onSave || !onCancel) return null;

    const handleSave = () => {
        if (value.trim()) {
            onSave(value.trim());
            onCancel(); 
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') onCancel();
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="modal-container bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <input type="text" value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKeyDown} autoFocus
                    className="w-full bg-gray-700 text-white placeholder-gray-400 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Save</button>
                </div>
            </div>
        </div>
    );
};
