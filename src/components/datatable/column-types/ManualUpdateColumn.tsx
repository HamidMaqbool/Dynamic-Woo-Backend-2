
import React from 'react';
import { cn } from '../../../utils/cn';

interface ManualUpdateColumnProps {
    hasChanges: boolean;
    isNew: boolean;
    onUpdate: () => void;
}

export const ManualUpdateColumn: React.FC<ManualUpdateColumnProps> = ({ hasChanges, isNew, onUpdate }) => {
    return (
        <button 
            disabled={!hasChanges}
            onClick={onUpdate}
            className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                hasChanges 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
        >
            {isNew ? 'Save' : 'Update'}
        </button>
    );
};
