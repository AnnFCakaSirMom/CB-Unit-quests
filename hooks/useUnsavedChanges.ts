import { useEffect } from 'react';

export const useUnsavedChanges = (isDirty: boolean) => {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                // Modern browsers require returnValue to be set to trigger the default prompt
                e.returnValue = ''; 
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);
};
