
import React from 'react';
import { Icon } from '../Icon';
import { cn } from '../../utils/cn';

interface TablePaginationProps {
    itemsPerPage: number;
    onItemsPerPageChange: (num: number) => void;
    paginationList: number[];
    currentPage: number;
    onPageChange: (page: number) => void;
    totalProducts: number;
    totalPages: number;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
    itemsPerPage,
    onItemsPerPageChange,
    paginationList,
    currentPage,
    onPageChange,
    totalProducts,
    totalPages
}) => {
    return (
        <div className="bg-white border-t border-slate-200 px-4 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select 
                        className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    >
                        {paginationList.map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                    <span>entries</span>
                </div>
                <span className="hidden sm:inline opacity-30">|</span>
                <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts}</span>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
                >
                    <Icon name="chevron-left" className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={cn(
                                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                currentPage === i + 1 
                                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" 
                                    : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
                >
                    <Icon name="chevron-right" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
