
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore, Product } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { Icon } from './Icon';
import { TableSkeleton } from './Skeleton';
import { ConfirmationModal } from './ConfirmationModal';
import { TableHeader } from './TableHeader';
import { TableFilters } from './TableFilters';
import { TablePagination } from './TablePagination';

// Column Types
import { TextColumn } from './column-types/TextColumn';
import { SelectColumn } from './column-types/SelectColumn';
import { ImageColumn } from './column-types/ImageColumn';
import { BadgeColumn } from './column-types/BadgeColumn';
import { StatusColumn } from './column-types/StatusColumn';
import { ActionColumn } from './column-types/ActionColumn';
import { ManualUpdateColumn } from './column-types/ManualUpdateColumn';

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
        addProduct,
        updateProduct,
        deleteProduct,
        bulkDeleteProducts,
        selectedProductIds,
        setSelectedProductIds
    } = useCRMStore();

    const [localChanges, setLocalChanges] = useState<Record<string, Partial<Product>>>({});
    const [newRows, setNewRows] = useState<Product[]>([]);

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
    const updateMode = tableConfig.updateMode || 'auto';
    const cols = [...tableConfig.cols];

    // Add manual update column if needed
    if (updateMode === 'manual') {
        cols.push({ name: "Update", col: "manual_update", type: "manual_update", width: "100px" });
    }

    // Get filter options from schema
    const statusOptions = (schema.form["auroparts-product"][0].fields.find((f: any) => f.name === 'status') as any)?.options || [];

    const handleAddRow = () => {
        const newRow: Product = {
            id: `NEW-${Date.now()}`,
            image: 'https://picsum.photos/seed/new/100/100',
            identifier: `AURO-${Math.floor(Math.random() * 10000)}`,
            parent_id: '-',
            title: '',
            product_type: 'simple',
            status: 'draft',
            created_at: new Date().toISOString().split('T')[0]
        };
        setNewRows(prev => [newRow, ...prev]);
        setLocalChanges(prev => ({
            ...prev,
            [newRow.id]: { ...newRow }
        }));
    };

    const handleLocalChange = (productId: string, field: string, value: any, autoUpdate?: boolean) => {
        const isNew = productId.startsWith('NEW-');
        
        // If column has autoUpdate attribute, it triggers update on change regardless of global updateMode
        // (unless it's a new row which hasn't been saved yet)
        if ((autoUpdate || updateMode === 'auto') && !isNew) {
            updateProduct(productId, { [field]: value });
        } else {
            setLocalChanges(prev => ({
                ...prev,
                [productId]: {
                    ...(prev[productId] || {}),
                    [field]: value
                }
            }));
        }
    };

    const handleManualUpdate = async (productId: string) => {
        const changes = localChanges[productId];
        if (changes) {
            if (productId.startsWith('NEW-')) {
                const { id, ...productData } = changes as Product;
                await addProduct(productData as Product);
                setNewRows(prev => prev.filter(r => r.id !== productId));
            } else {
                await updateProduct(productId, changes);
            }
            
            setLocalChanges(prev => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

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
        if (id.startsWith('NEW-')) {
            setNewRows(prev => prev.filter(r => r.id !== id));
            setLocalChanges(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            return;
        }
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

    const renderCell = (col: any, product: Product) => {
        const productId = product.id;
        const fieldName = col.col as string;
        const originalValue = product[fieldName as keyof Product];
        const localValue = localChanges[productId]?.[fieldName];
        const value = localValue !== undefined ? localValue : originalValue;

        // Default to simple text if columnType is not given but it's an editable field
        // We assume fields with col name like 'title' or 'status' might be editable if columnType is missing
        // but for now let's stick to explicit columnType or default to span for non-editable
        
        const columnType = col.columnType || (['title', 'status'].includes(fieldName) ? 'text' : undefined);

        if (columnType === 'text') {
            return (
                <TextColumn 
                    value={value as string}
                    onChange={(val) => handleLocalChange(productId, fieldName, val, col.autoUpdate)}
                    placeholder={`Enter ${col.name}...`}
                />
            );
        }

        if (columnType === 'select') {
            return (
                <SelectColumn 
                    value={value as string}
                    onChange={(val) => handleLocalChange(productId, fieldName, val, col.autoUpdate)}
                    options={statusOptions}
                />
            );
        }

        if (col.type === 'manual_update') {
            return (
                <ManualUpdateColumn 
                    hasChanges={!!localChanges[productId]}
                    isNew={productId.startsWith('NEW-')}
                    onUpdate={() => handleManualUpdate(productId)}
                />
            );
        }

        if (col.type === 'image') {
            return <ImageColumn src={value as string} />;
        }

        if (col.type === 'action') {
            const isNew = productId.startsWith('NEW-');
            if (isNew) {
                return (
                    <button 
                        onClick={() => handleDelete(productId)}
                        className="p-2 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Row"
                    >
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                );
            }
            return (
                <ActionColumn 
                    onEdit={() => navigate(`${basePath}/edit/${product.id}`)}
                    onDelete={() => handleDelete(product.id)}
                />
            );
        }

        if (col.type === 'badge') {
            return <BadgeColumn value={value as string} type={value === 'variation' ? 'indigo' : 'slate'} />;
        }

        if (col.col === 'status') {
            return <StatusColumn status={value as string} />;
        }

        if (col.col === 'id' || col.col === 'identifier') {
            return <span className="font-mono text-xs font-semibold text-slate-400">{value as string}</span>;
        }

        return <span className="font-medium text-slate-700">{value as string}</span>;
    };

    const allRows = [...newRows, ...products];

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] text-[#1A1A1A] font-sans">
            {/* Header Controls */}
            <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-8 sm:py-6 flex flex-col gap-6">
                <TableHeader 
                    title={schema.table["auroparts-product"].label.pulular}
                    description="Manage and monitor your product inventory"
                    onAddRow={handleAddRow}
                    onAddProduct={() => navigate(`${basePath}/add`)}
                    addProductLabel={schema.table["auroparts-product"].label.singular}
                />

                <TableFilters 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    status={filters.status}
                    onStatusChange={(status) => setFilters({ status })}
                    statusOptions={statusOptions}
                    parentId={filters.parentId}
                    onParentIdChange={(parentId) => setFilters({ parentId })}
                    onReset={() => {
                        setSearchQuery('');
                        setFilters({ status: 'all', parentId: 'all' });
                    }}
                    showReset={filters.status !== 'all' || filters.parentId !== 'all' || !!searchQuery}
                />
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
                                    {allRows.map((product) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={product.id}
                                            className={cn(
                                                "hover:bg-slate-50/80 transition-colors group",
                                                selectedProductIds.includes(product.id) && "bg-indigo-50/50",
                                                product.id.startsWith('NEW-') && "bg-indigo-50/30"
                                            )}
                                        >
                                            <td className="pl-8 pr-4 py-4">
                                                <label className="relative flex items-center justify-center cursor-pointer group select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedProductIds.includes(product.id)}
                                                        onChange={() => toggleSelect(product.id)}
                                                        className="peer sr-only"
                                                        disabled={product.id.startsWith('NEW-')}
                                                    />
                                                    <div className={cn(
                                                        "w-5 h-5 border-2 rounded-md transition-all duration-200 ease-in-out",
                                                        "border-slate-300 bg-white",
                                                        "peer-checked:bg-indigo-600 peer-checked:border-indigo-600",
                                                        "group-hover:border-indigo-400",
                                                        product.id.startsWith('NEW-') && "opacity-30 cursor-not-allowed"
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
                                                    {renderCell(col, product)}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                    {allRows.length === 0 && (
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

            <TablePagination 
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                paginationList={tableConfig.paginationList}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
            />

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
