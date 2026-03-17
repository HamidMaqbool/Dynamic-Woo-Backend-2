
import React from 'react';
import { Icon } from './Icon';

interface TableFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    status: string;
    onStatusChange: (status: string) => void;
    statusOptions: { value: string; label: string }[];
    parentId: string;
    onParentIdChange: (id: string) => void;
    onReset: () => void;
    showReset: boolean;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
    searchQuery,
    onSearchChange,
    status,
    onStatusChange,
    statusOptions,
    parentId,
    onParentIdChange,
    onReset,
    showReset
}) => {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by ID, Title, or Identifier..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                    <select 
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">All Status</option>
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent ID:</span>
                    <select 
                        value={parentId}
                        onChange={(e) => onParentIdChange(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">All Parents</option>
                        {['P001', 'P002', 'P003'].map(id => (
                            <option key={id} value={id}>{id}</option>
                        ))}
                    </select>
                </div>

                {showReset && (
                    <button 
                        onClick={onReset}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                    >
                        Reset Filters
                    </button>
                )}
            </div>
        </div>
    );
};
