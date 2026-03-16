
import React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  isUploading?: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export const ImageField: React.FC<ImageFieldProps> = ({
  value,
  onChange,
  isUploading,
  onUpload,
  readOnly
}) => {
  return (
    <div className="space-y-3">
      <label className={cn(
        "block aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group hover:border-indigo-300 transition-colors cursor-pointer relative",
        readOnly && "cursor-not-allowed opacity-70 hover:border-slate-200"
      )}>
        <input 
          type="file" 
          className="sr-only" 
          onChange={onUpload} 
          disabled={isUploading || readOnly} 
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Uploading...</span>
          </div>
        ) : value ? (
          <img src={value} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Image Selected</span>
          </div>
        )}
      </label>
      {!readOnly && (
        <button 
          type="button"
          className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          Change Image
        </button>
      )}
    </div>
  );
};
