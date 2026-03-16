
import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RepeaterFieldProps {
  value: any[];
  onChange: (value: any[]) => void;
  fields: any[];
  renderField: (field: any, value: any, onChange: (val: any) => void) => React.ReactNode;
  readOnly?: boolean;
}

export const RepeaterField: React.FC<RepeaterFieldProps> = ({
  value = [],
  onChange,
  fields,
  renderField,
  readOnly
}) => {
  const addItem = () => {
    const newItem: any = {};
    fields.forEach(f => {
      newItem[f.name] = f.value ?? '';
    });
    onChange([...value, newItem]);
  };

  const removeItem = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const updateItem = (index: number, fieldName: string, fieldValue: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [fieldName]: fieldValue };
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {value.map((item, index) => (
          <div 
            key={index} 
            className="group relative bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 transition-all hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 text-slate-300 group-hover:text-indigo-400 transition-colors cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Item #{index + 1}
                </span>
              </div>
              {!readOnly && (
                <button 
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field, fIdx) => (
                <div 
                  key={fIdx} 
                  className={field.class === 'full' ? 'sm:col-span-2' : 'sm:col-span-1'}
                >
                  {field.title && (
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      {field.title}
                    </label>
                  )}
                  {renderField(
                    field, 
                    item[field.name], 
                    (val) => updateItem(index, field.name, val)
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <button 
          type="button"
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Add New Item</span>
        </button>
      )}

      {value.length === 0 && !readOnly && (
        <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-400 font-medium italic">No items added yet</p>
        </div>
      )}
    </div>
  );
};
