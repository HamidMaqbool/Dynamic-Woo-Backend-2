
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, Image as ImageIcon, Search, X, Check, Trash2, Info, FileText, Loader2, Grid, List, Calendar, ChevronLeft, ChevronRight, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { mediaService, MediaItem } from '../../services/mediaService';

interface MediaManagerProps {
  onSelect?: (items: MediaItem[]) => void;
  multiSelect?: boolean;
  selectedIds?: string[];
  onClose?: () => void;
  isModal?: boolean;
}

type ViewMode = 'grid' | 'list';
type DateFilter = 'all' | 'today' | 'this-month' | 'this-year';

export const MediaManager: React.FC<MediaManagerProps> = ({
  onSelect,
  multiSelect = false,
  selectedIds = [],
  onClose,
  isModal = false
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  
  // Pagination & Load More
  const [itemsToShow, setItemsToShow] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mediaService.getMedia();
      setMedia(data);
    } catch (error) {
      console.error('Failed to fetch media', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    if (selectedIds.length > 0 && media.length > 0) {
      const initialSelected = media.filter(m => selectedIds.includes(m.id));
      setSelectedItems(initialSelected);
    }
  }, [selectedIds, media]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newUploads = files.map(f => ({ name: f.name, progress: 0 }));
    setUploadingFiles(prev => [...prev, ...newUploads]);

    for (const file of files) {
      try {
        const uploaded = await mediaService.uploadMedia(file);
        setMedia(prev => [uploaded, ...prev]);
        setUploadingFiles(prev => prev.filter(u => u.name !== file.name));
        setActiveTab('library');
        if (!multiSelect) {
          setSelectedItems([uploaded]);
          setPreviewItem(uploaded);
        }
      } catch (error) {
        console.error('Upload failed', error);
        setUploadingFiles(prev => prev.filter(u => u.name !== file.name));
      }
    }
  };

  const toggleSelect = (item: MediaItem) => {
    if (multiSelect) {
      setSelectedItems(prev => {
        const isSelected = prev.some(m => m.id === item.id);
        if (isSelected) {
          return prev.filter(m => m.id !== item.id);
        } else {
          return [...prev, item];
        }
      });
    } else {
      setSelectedItems([item]);
    }
    setPreviewItem(item);
    setIsEditing(false);
    setEditName(item.name);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    try {
      await mediaService.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      setSelectedItems(prev => prev.filter(m => m.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleUpdate = async () => {
    if (!previewItem || !editName.trim()) return;
    setIsUpdating(true);
    try {
      const updated = await mediaService.updateMedia(previewItem.id, { name: editName });
      setMedia(prev => prev.map(m => m.id === updated.id ? updated : m));
      setPreviewItem(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setItemsToShow(12);
  }, [searchQuery, dateFilter]);

  const filteredMedia = useMemo(() => {
    return media.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (dateFilter === 'all') return true;

      const date = new Date(m.created_at);
      const now = new Date();
      
      if (dateFilter === 'today') {
        return date.toDateString() === now.toDateString();
      }
      if (dateFilter === 'this-month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'this-year') {
        return date.getFullYear() === now.getFullYear();
      }
      
      return true;
    });
  }, [media, searchQuery, dateFilter]);

  const paginatedMedia = useMemo(() => {
    if (viewMode === 'grid') {
      return filteredMedia.slice(0, itemsToShow);
    } else {
      const start = (currentPage - 1) * itemsPerPage;
      return filteredMedia.slice(start, start + itemsPerPage);
    }
  }, [filteredMedia, viewMode, itemsToShow, currentPage]);

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn(
      "flex flex-col bg-white overflow-hidden transition-all duration-300",
      isModal 
        ? "h-[85vh] w-full max-w-6xl rounded-2xl shadow-2xl" 
        : "h-[calc(100vh-180px)] min-h-[600px] rounded-3xl border border-slate-200/60 shadow-sm"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-6 py-5 border-b border-slate-100",
        !isModal && "bg-slate-50/30"
      )}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Media Library</h2>
            {!isModal && (
              <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and organize your media assets</p>
            )}
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                activeTab === 'upload' ? "bg-white text-accent shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                activeTab === 'library' ? "bg-white text-accent shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Library
            </button>
          </div>
        </div>
        {isModal && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-100">
          {activeTab === 'upload' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <label className="w-full max-w-md aspect-video border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group">
                <input type="file" multiple className="sr-only" onChange={handleUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-accent transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">Drop files to upload</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
                </div>
              </label>

              {uploadingFiles.length > 0 && (
                <div className="mt-8 w-full max-w-md space-y-3">
                  {uploadingFiles.map((file, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                        <div className="h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-accent animate-pulse w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewMode === 'grid' ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewMode === 'list' ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="this-month">This Month</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {filteredMedia.length} Items
                </span>
              </div>

              {/* Grid/List Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No media found</p>
                    <p className="text-xs text-slate-400 mt-1">Try a different search or upload new files</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {paginatedMedia.map((item) => {
                        const isSelected = selectedItems.some(m => m.id === item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleSelect(item)}
                            className={cn(
                              "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                              isSelected ? "border-accent ring-4 ring-accent/10" : "border-transparent hover:border-slate-200"
                            )}
                          >
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            
                            <div className={cn(
                              "absolute inset-0 bg-accent/10 transition-opacity",
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )} />

                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-accent text-white rounded-lg flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                                <Check className="w-4 h-4" />
                              </div>
                            )}

                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] text-white font-bold truncate">{item.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {itemsToShow < filteredMedia.length && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => setItemsToShow(prev => prev + 12)}
                          className="px-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedMedia.map((item) => {
                            const isSelected = selectedItems.some(m => m.id === item.id);
                            return (
                              <tr 
                                key={item.id}
                                onClick={() => toggleSelect(item)}
                                className={cn(
                                  "hover:bg-slate-50 transition-colors cursor-pointer group",
                                  isSelected && "bg-accent/5"
                                )}
                              >
                                <td className="px-4 py-2">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{item.name}</p>
                                </td>
                                <td className="px-4 py-2">
                                  <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="px-4 py-2">
                                  <p className="text-xs text-slate-500">{formatSize(item.size)}</p>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-accent disabled:opacity-50 transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-slate-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-accent disabled:opacity-50 transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar / Preview */}
        <div className="w-80 bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col">
          {previewItem ? (
            <div className="p-6 space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <img
                  src={previewItem.url}
                  alt={previewItem.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm font-bold bg-white border border-accent rounded-lg outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdate}
                          disabled={isUpdating}
                          className="p-1 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setIsEditing(false); setEditName(previewItem.name); }}
                          className="p-1 bg-slate-200 text-slate-500 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h3 className="text-sm font-bold text-slate-800 break-words">{previewItem.name}</h3>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 text-slate-400 hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {new Date(previewItem.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Size</p>
                    <p className="text-xs font-bold text-slate-700">{formatSize(previewItem.size)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dimensions</p>
                    <p className="text-xs font-bold text-slate-700">{previewItem.dimensions}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">File URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={previewItem.url}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] focus:outline-none"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(previewItem.url)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(previewItem.id, e)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Info className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an item to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer (only for modal) */}
      {isModal && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <span className="text-xs font-bold text-slate-500">
                {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={selectedItems.length === 0}
              onClick={() => onSelect?.(selectedItems)}
              className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
