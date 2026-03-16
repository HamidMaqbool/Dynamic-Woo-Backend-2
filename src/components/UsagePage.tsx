
import React, { useState, useEffect } from 'react';
import { useCRMStore } from '../store/useStore';
import { Info, Code, Layout, CheckCircle2, HelpCircle } from 'lucide-react';
import { FormSkeleton } from './Skeleton';
import { motion } from 'motion/react';

const FIELD_TYPE_DOCS = {
    text: {
        description: "Standard single-line text input for names, titles, and short descriptions.",
        options: ["placeholder", "valid (required)", "tooltip"]
    },
    number: {
        description: "Numeric input field for prices, quantities, and measurements.",
        options: ["placeholder", "valid (required)", "tooltip"]
    },
    select: {
        description: "Dropdown menu for selecting a single value from a predefined list.",
        options: ["options (label/value pairs)", "valid (required)", "tooltip"]
    },
    textarea: {
        description: "Multi-line text area for long descriptions and notes.",
        options: ["placeholder", "valid (required)", "tooltip", "rows"]
    },
    checkbox: {
        description: "Toggle switch or checkbox for boolean values (true/false).",
        options: ["valid (required)", "tooltip"]
    },
    date: {
        description: "Date picker for selecting specific dates from a calendar.",
        options: ["valid (required)", "tooltip"]
    }
};

export const UsagePage: React.FC = () => {
    const { schema } = useCRMStore();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const load = async () => {
            if (!schema) return;
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsLoading(false);
        };
        load();
    }, [schema]);

    if (!schema || isLoading) {
        return (
            <div className="flex flex-col h-full bg-[#F8F9FA] text-[#1A1A1A] font-sans">
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Input Usage Guide</h1>
                </div>
                <div className="flex-1 overflow-auto p-8">
                    <FormSkeleton />
                </div>
            </div>
        );
    }

    const formConfig = schema.form["auroparts-product"];

    // Extract all unique field types and their configurations
    const fieldUsages: any[] = [];
    formConfig.forEach((section: any) => {
        section.fields.forEach((field: any) => {
            fieldUsages.push({
                ...field,
                section: section.title
            });
        });
    });

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] text-[#1A1A1A] font-sans">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Input Usage Guide</h1>
                <p className="text-sm text-slate-500 mt-1">A comprehensive overview of all dynamic form inputs defined in the schema.</p>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* Field Type Documentation Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-xl font-bold text-slate-900">Available Field Types</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(FIELD_TYPE_DOCS).map(([type, doc], idx) => (
                                <motion.div 
                                    key={type}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                            {type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{doc.description}</p>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supported Options</p>
                                        <div className="flex flex-wrap gap-2">
                                            {doc.options.map(opt => (
                                                <span key={opt} className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-[10px] font-medium border border-slate-100">
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fields</p>
                            <p className="text-3xl font-bold text-indigo-600">{fieldUsages.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sections</p>
                            <p className="text-3xl font-bold text-emerald-600">{formConfig.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unique Types</p>
                            <p className="text-3xl font-bold text-amber-600">{new Set(fieldUsages.map(f => f.type)).size}</p>
                        </div>
                    </div>

                    {/* Usage Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Title</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Section</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Validation</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Config</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fieldUsages.map((field, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 text-sm">{field.title || field.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{field.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wide border border-indigo-100">
                                                {field.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {field.section}
                                        </td>
                                        <td className="px-6 py-4">
                                            {field.valid === 'required' ? (
                                                <span className="inline-flex items-center gap-1 text-rose-500 text-[10px] font-bold uppercase">
                                                    <CheckCircle2 className="w-3 h-3" /> Required
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] font-bold uppercase italic">Optional</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {field.tooltip && <Info className="w-4 h-4 text-slate-400" title={field.tooltip} />}
                                                {field.options && <Layout className="w-4 h-4 text-slate-400" title="Has Options" />}
                                                <Code className="w-4 h-4 text-slate-400" title="Custom Attributes" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Schema Preview */}
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white font-bold text-lg">Raw Schema Definition</h2>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">JSON Format</span>
                        </div>
                        <pre className="text-indigo-300 font-mono text-xs overflow-auto max-h-[400px] custom-scrollbar">
                            {JSON.stringify(schema.form["auroparts-product"], null, 2)}
                        </pre>
                    </div>

                </div>
            </div>
        </div>
    );
};
