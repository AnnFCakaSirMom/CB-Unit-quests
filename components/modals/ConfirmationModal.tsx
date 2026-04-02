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
        <div className="modal modal-open">
            <div className="modal-box bg-base-200 border border-base-300 shadow-xl">
                <h3 className="font-bold text-lg mb-4 text-base-content">{title}</h3>
                <p className="text-base-content/80 mb-6">{message}</p>
                <div className="modal-action justify-end gap-2 mt-0">
                    <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleConfirm} className="btn btn-error">Confirm</button>
                </div>
            </div>
        </div>
    );
};
