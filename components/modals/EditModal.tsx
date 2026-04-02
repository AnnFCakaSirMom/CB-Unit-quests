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
        <div className="modal modal-open">
            <div className="modal-box bg-base-200 border border-base-300 shadow-xl">
                <h3 className="font-bold text-lg text-base-content mb-4">{title}</h3>
                <input type="text" value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKeyDown} autoFocus
                    className="input input-bordered w-full bg-base-300 focus:border-info outline-none" />
                <div className="modal-action justify-end gap-2 mt-4">
                    <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleSave} className="btn btn-success">Save</button>
                </div>
            </div>
        </div>
    );
};
