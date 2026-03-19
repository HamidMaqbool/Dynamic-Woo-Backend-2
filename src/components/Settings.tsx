import React, { useEffect, useState } from 'react';
import { useCRMStore } from '../store/useStore';
import { Skeleton } from './Skeleton';
import { Icon } from './Icon';
import { cn } from '../utils/cn';

// Reuse input components for consistency
import { TextField } from './input-type/TextField';
import { TextAreaField } from './input-type/TextAreaField';
import { SelectField } from './input-type/SelectField';
import { CheckboxField } from './input-type/CheckboxField';
import { ColorField } from './input-type/ColorField';

export const Settings: React.FC = () => {
    const { settingsData, fetchSettings, updateSettings, theme, setTheme } = useCRMStore();
    const [activeTab, setActiveTab] = useState<string>('');
    const [localSettings, setLocalSettings] = useState<any>({});

    useEffect(() => {
        if (!settingsData) {
            fetchSettings();
        } else if (settingsData.tabs && settingsData.tabs.length > 0) {
            if (!activeTab) setActiveTab(settingsData.tabs[0].id);
            
            // Initialize local settings from the JSON structure
            const initialSettings: any = {};
            settingsData.tabs.forEach((tab: any) => {
                tab.sections.forEach((section: any) => {
                    section.fields.forEach((field: any) => {
                        initialSettings[field.name] = field.value;
                    });
                });
            });
            setLocalSettings(initialSettings);
        }
    }, [settingsData, fetchSettings, activeTab]);

    if (!settingsData || !settingsData.tabs) {
        return (
            <div className="p-8 space-y-8 h-full overflow-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    const currentTab = settingsData.tabs.find((t: any) => t.id === activeTab) || settingsData.tabs[0];

    const handleFieldChange = (name: string, value: any) => {
        setLocalSettings((prev: any) => ({ ...prev, [name]: value }));
        
        // Special case for theme
        if (name === 'theme') {
            setTheme(value);
        }
    };

    const handleSave = async () => {
        // Map local settings back to the tabs structure
        const updatedTabs = settingsData.tabs.map((tab: any) => ({
            ...tab,
            sections: tab.sections.map((section: any) => ({
                ...section,
                fields: section.fields.map((field: any) => ({
                    ...field,
                    value: localSettings[field.name] ?? field.value
                }))
            }))
        }));

        await updateSettings({ tabs: updatedTabs });
    };

    const renderField = (field: any) => {
        const value = localSettings[field.name];
        const onChange = (val: any) => handleFieldChange(field.name, val);

        switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'number':
                return <TextField type={field.type} value={value ?? ''} onChange={onChange} />;
            case 'textarea':
                return <TextAreaField value={value ?? ''} onChange={onChange} />;
            case 'select':
                return <SelectField value={value ?? ''} onChange={onChange} options={field.options} />;
            case 'checkbox':
                return <CheckboxField value={!!value} onChange={onChange} title={field.label} />;
            case 'color':
                return <ColorField value={value ?? ''} onChange={onChange} />;
            default:
                return <div className="text-xs text-rose-500 italic">Unsupported field type: {field.type}</div>;
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your application configuration and preferences.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            Reset
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-8 py-2.5 text-sm font-bold text-white bg-accent hover:opacity-90 rounded-xl shadow-lg shadow-accent/20 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </header>

            {/* Horizontal Tabs */}
            <div className="bg-white border-b border-slate-200 px-8">
                <div className="max-w-6xl mx-auto flex overflow-x-auto no-scrollbar">
                    {settingsData.tabs.map((tab: any) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-accent text-accent"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                            )}
                        >
                            <Icon name={tab.icon || 'settings'} className={cn("w-4 h-4", activeTab === tab.id ? "text-accent" : "text-slate-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-8">
                    {currentTab.sections.map((section: any, sIdx: number) => (
                        <section key={sIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {section.fields.map((field: any, fIdx: number) => (
                                        <div key={fIdx} className={cn(field.type === 'textarea' ? 'md:col-span-2' : '')}>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                                {field.label}
                                            </label>
                                            {renderField(field)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};
