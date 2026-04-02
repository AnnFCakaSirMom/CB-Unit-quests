import React from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Partial<ConfirmationModalProps>> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen || !onConfirm || !onCancel) return null;

    const handleConfirm = () => {
        onConfirm();
        onCancel();
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="modal-container bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                    <button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Confirm</button>
                </div>
            </div>
        </div>
    );
};
