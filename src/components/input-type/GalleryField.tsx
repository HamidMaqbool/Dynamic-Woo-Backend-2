
import React, { useState, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Upload, GripVertical, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface GalleryFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  readOnly?: boolean;
}

interface SortableItemProps {
  id: string;
  url: string;
  onRemove: (url: string) => void;
  readOnly?: boolean;
  isDragging?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, url, onRemove, readOnly, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all",
        !readOnly && "hover:border-indigo-400 hover:shadow-md"
      )}
    >
      <img 
        src={url} 
        alt="Gallery item" 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer" 
      />
      
      {!readOnly && (
        <>
          <div 
            {...attributes} 
            {...listeners}
            className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-600"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <button
            type="button"
            onClick={() => onRemove(url)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-600"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      
      {/* Index Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
        {parseInt(id.split('-')[1]) + 1}
      </div>
    </div>
  );
};

export const GalleryField: React.FC<GalleryFieldProps> = ({ 
  value = [], 
  onChange, 
  max = 10, 
  readOnly 
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id.toString().split('|')[1]);
      const newIndex = value.indexOf(over.id.toString().split('|')[1]);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(value, oldIndex, newIndex));
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max limit
    const remaining = max - value.length;
    const filesToUpload = files.slice(0, remaining);

    if (filesToUpload.length === 0) {
      alert(`Maximum ${max} images allowed.`);
      return;
    }

    setIsUploading(true);
    try {
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUrls = filesToUpload.map(file => URL.createObjectURL(file as File));
      onChange([...value, ...newUrls]);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter(url => url !== urlToRemove));
  };

  // Create unique IDs for sortable items that include the index to handle duplicate URLs if any
  const sortableItems = value.map((url, index) => ({
    id: `item-${index}|${url}`,
    url
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {value.length} / {max} Images
        </span>
        {!readOnly && value.length < max && (
          <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Add Images
            <input 
              type="file" 
              multiple 
              className="sr-only" 
              onChange={handleUpload} 
              disabled={isUploading} 
            />
          </label>
        )}
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <SortableContext 
            items={sortableItems.map(item => item.id)}
            strategy={rectSortingStrategy}
          >
            {sortableItems.map((item) => (
              <SortableItem 
                key={item.id} 
                id={item.id} 
                url={item.url} 
                onRemove={removeImage}
                readOnly={readOnly}
              />
            ))}
          </SortableContext>

          {!readOnly && value.length < max && (
            <label className={cn(
              "aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 group hover:border-indigo-300 transition-colors cursor-pointer",
              isUploading && "opacity-50 cursor-not-allowed"
            )}>
              <input 
                type="file" 
                multiple 
                className="sr-only" 
                onChange={handleUpload} 
                disabled={isUploading} 
              />
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload</span>
                </>
              )}
            </label>
          )}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="aspect-square rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl scale-105">
              <img 
                src={activeId.split('|')[1]} 
                alt="Dragging" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {value.length === 0 && !isUploading && (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
          <Upload className="w-10 h-10 mx-auto text-slate-200 mb-3" />
          <p className="text-sm text-slate-400 font-medium">No images uploaded yet</p>
          {!readOnly && (
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
              Click the button above to add images
            </p>
          )}
        </div>
      )}
    </div>
  );
};
