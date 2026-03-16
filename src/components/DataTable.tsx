
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore, Product } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { Icon } from './Icon';
import { TableSkeleton } from './Skeleton';
import { ConfirmationModal } from './ConfirmationModal';

export const DataTable: React.FC = () => {
    const navigate = useNavigate();
    const { 
        products, 
        isLoading,
        schema,
        routes,
        fetchProducts,
        currentPage, 
        itemsPerPage, 
        totalProducts,
        totalPages,
        searchQuery, 
        filters,
        setCurrentPage, 
        setItemsPerPage, 
        setSearchQuery,
        setFilters,
        deleteProduct,
        bulkDeleteProducts,
        selectedProductIds,
        setSelectedProductIds
    } = useCRMStore();

    const listRoute = routes?.find(r => r.view === 'list');
    const basePath = listRoute?.path || '/products';

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; isBulk: boolean }>({
        isOpen: false,
        id: null,
        isBulk: false
    });

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!schema) {
        return <TableSkeleton />;
    }

    const tableConfig = schema.table["auroparts-product"].table;
    const cols = tableConfig.cols;

    // Get filter options from schema
    const statusOptions = (schema.form["auroparts-product"][0].fields.find((f: any) => f.name === 'status') as any)?.options || [];
    // Parent ID options could be fetched or derived, for now we'll keep it simple or use a fixed list if needed
    // In a real app, this might be another API call
    const parentIdOptions = ['P001', 'P002', 'P003']; 

    const toggleSelectAll = () => {
        if (selectedProductIds.length === products.length && products.length > 0) {
            setSelectedProductIds([]);
        } else {
            setSelectedProductIds(products.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(selectedProductIds.filter(i => i !== id));
        } else {
            setSelectedProductIds([...selectedProductIds, id]);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteModal({ isOpen: true, id, isBulk: false });
    };

    const handleBulkDelete = () => {
        setDeleteModal({ isOpen: true, id: null, isBulk: true });
    };

    const confirmDelete = () => {
        if (deleteModal.isBulk) {
            bulkDeleteProducts(selectedProductIds);
        } else if (deleteModal.id) {
            deleteProduct(deleteModal.id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] text-[#1A1A1A] font-sans">
            {/* Header Controls */}
            <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-8 sm:py-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            {schema.table["auroparts-product"].label.pulular}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Manage and monitor your product inventory
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => navigate(`${basePath}/add`)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] text-sm font-semibold w-full sm:w-auto"
                        >
                            <Icon name="plus" className="w-4 h-4" />
                            <span>Add {schema.table["auroparts-product"].label.singular}</span>
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by ID, Title, or Identifier..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                            <select 
                                value={filters.status}
                                onChange={(e) => setFilters({ status: e.target.value })}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="all">All Status</option>
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent ID:</span>
                            <select 
                                value={filters.parentId}
                                onChange={(e) => setFilters({ parentId: e.target.value })}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="all">All Parents</option>
                                {parentIdOptions.map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                        </div>

                        {(filters.status !== 'all' || filters.parentId !== 'all' || searchQuery) && (
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilters({ status: 'all', parentId: 'all' });
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedProductIds.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-indigo-600 px-8 py-3 flex items-center justify-between text-white overflow-hidden"
                    >
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-bold">{selectedProductIds.length} items selected</span>
                            <div className="h-4 w-px bg-indigo-400" />
                            <button 
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 text-xs font-bold hover:text-rose-200 transition-colors"
                            >
                                <Icon name="trash-2" className="w-4 h-4" />
                                Delete Selected
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedProductIds([])}
                            className="text-xs font-bold hover:underline"
                        >
                            Clear Selection
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table Container */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 relative">
                {/* Loading Overlay */}
                <AnimatePresence>
                    {isLoading && products.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex items-center justify-center"
                        >
                            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Updating Data...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={cn(
                    "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300",
                    isLoading && products.length > 0 && "opacity-50 grayscale-[0.5]"
                )}>
                    <div className="overflow-x-auto">
                        {isLoading && products.length === 0 ? (
                            <TableSkeleton />
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200">
                                        <th className="pl-8 pr-4 py-4 w-10">
                                            <label className="relative flex items-center justify-center cursor-pointer group select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedProductIds.length === products.length && products.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="peer sr-only"
                                                />
                                                <div className={cn(
                                                    "w-5 h-5 border-2 rounded-md transition-all duration-200 ease-in-out",
                                                    "border-slate-300 bg-white",
                                                    "peer-checked:bg-indigo-600 peer-checked:border-indigo-600",
                                                    "group-hover:border-indigo-400"
                                                )}></div>
                                                <svg 
                                                    className={cn(
                                                        "absolute w-3.5 h-3.5 text-white transition-all duration-200 ease-in-out transform",
                                                        "opacity-0 scale-50",
                                                        "peer-checked:opacity-100 peer-checked:scale-100"
                                                    )} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </label>
                                        </th>
                                        {cols.map((col: any) => (
                                            <th 
                                                key={col.name} 
                                                className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                                                style={{ width: col.width }}
                                            >
                                                {col.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={product.id}
                                            className={cn(
                                                "hover:bg-slate-50/80 transition-colors group",
                                                selectedProductIds.includes(product.id) && "bg-indigo-50/50"
                                            )}
                                        >
                                            <td className="pl-8 pr-4 py-4">
                                                <label className="relative flex items-center justify-center cursor-pointer group select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedProductIds.includes(product.id)}
                                                        onChange={() => toggleSelect(product.id)}
                                                        className="peer sr-only"
                                                    />
                                                    <div className={cn(
                                                        "w-5 h-5 border-2 rounded-md transition-all duration-200 ease-in-out",
                                                        "border-slate-300 bg-white",
                                                        "peer-checked:bg-indigo-600 peer-checked:border-indigo-600",
                                                        "group-hover:border-indigo-400"
                                                    )}></div>
                                                    <svg 
                                                        className={cn(
                                                            "absolute w-3.5 h-3.5 text-white transition-all duration-200 ease-in-out transform",
                                                            "opacity-0 scale-50",
                                                            "peer-checked:opacity-100 peer-checked:scale-100"
                                                        )} 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </label>
                                            </td>
                                            {cols.map((col: any) => (
                                                <td key={col.name} className="px-6 py-4 text-sm text-slate-600">
                                                    {renderCell(col, product, navigate, handleDelete, basePath)}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={cols.length + 1} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <Icon name="info" className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">No products found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="bg-white border-t border-slate-200 px-4 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                        <span>Show</span>
                        <select 
                            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            {tableConfig.paginationList.map(num => (
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
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
                    >
                        <Icon name="chevron-left" className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
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
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
                    >
                        <Icon name="chevron-right" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={deleteModal.isBulk ? 'Bulk Delete Products' : 'Delete Product'}
                message={deleteModal.isBulk 
                    ? `Are you sure you want to delete ${selectedProductIds.length} selected products? This action cannot be undone.`
                    : 'Are you sure you want to delete this product? This action cannot be undone.'
                }
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

function renderCell(col: any, product: Product, navigate: any, handleDelete: any, basePath: string) {
    const value = product[col.col as keyof Product];

    if (col.type === 'image') {
        return (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <img 
                    src={value as string} 
                    alt="Product" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
            </div>
        );
    }

    if (col.type === 'action') {
        return (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => navigate(`${basePath}/edit/${product.id}`)}
                    className="p-2 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit"
                >
                    <Icon name="edit" className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete"
                >
                    <Icon name="trash-2" className="w-4 h-4" />
                </button>
            </div>
        );
    }

    if (col.type === 'badge') {
        return (
            <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                value === 'variation' 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                    : "bg-slate-50 text-slate-600 border-slate-100"
            )}>
                {value as string}
            </span>
        );
    }

    if (col.col === 'status') {
        return (
            <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                value === 'publish' 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border border-amber-100"
            )}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", value === 'publish' ? "bg-emerald-500" : "bg-amber-500")}></span>
                {value as string}
            </span>
        );
    }

    if (col.col === 'id' || col.col === 'identifier') {
        return <span className="font-mono text-xs font-semibold text-slate-400">{value as string}</span>;
    }

    return <span className="font-medium text-slate-700">{value as string}</span>;
}
