import { useState } from 'react';
import { toast } from 'sonner';

interface SaveStrategyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
}

export function SaveStrategyDialog({ isOpen, onClose, onSave }: SaveStrategyDialogProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Use native prompt for now as a workaround
    if (isOpen && !isSaving) {
        setTimeout(async () => {
            const name = window.prompt('Enter strategy name:');
            if (name && name.trim()) {
                try {
                    setIsSaving(true);
                    await onSave(name);
                    toast.success('Strategy saved successfully!');
                } catch (e) {
                    toast.error('Failed to save strategy. Please try again.');
                } finally {
                    setIsSaving(false);
                }
            }
            onClose();
        }, 100);
    }

    return null;
}
