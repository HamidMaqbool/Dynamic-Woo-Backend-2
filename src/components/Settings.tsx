import React, { useEffect } from 'react';
import { useCRMStore } from '../store/useStore';
import { Skeleton } from './Skeleton';
import { Icon } from './Icon';

export const Settings: React.FC = () => {
    const { settingsData, fetchSettings } = useCRMStore();

    useEffect(() => {
        if (!settingsData) {
            fetchSettings();
        }
    }, [settingsData, fetchSettings]);

    if (!settingsData) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 overflow-auto h-full custom-scrollbar">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                <p className="text-slate-500">Manage your application configuration and preferences.</p>
            </header>

            <div className="space-y-6">
                {/* General Settings */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Icon name="settings" className="w-4 h-4 text-indigo-600" />
                            General Configuration
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Site Name</label>
                                <input 
                                    type="text" 
                                    defaultValue={settingsData.general.siteName}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Contact Email</label>
                                <input 
                                    type="email" 
                                    defaultValue={settingsData.general.contactEmail}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Site Description</label>
                            <textarea 
                                rows={3}
                                defaultValue={settingsData.general.siteDescription}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div>
                                <p className="text-sm font-bold text-amber-900">Maintenance Mode</p>
                                <p className="text-xs text-amber-700">Disable the public site for maintenance.</p>
                            </div>
                            <input 
                                type="checkbox" 
                                defaultChecked={settingsData.general.maintenanceMode}
                                className="w-10 h-5 bg-slate-200 rounded-full appearance-none checked:bg-amber-500 transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Appearance Settings */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Icon name="layout" className="w-4 h-4 text-indigo-600" />
                            Appearance & UI
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Default Theme</label>
                                <select 
                                    value={useCRMStore.getState().theme}
                                    onChange={(e) => useCRMStore.getState().setTheme(e.target.value as any)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                >
                                    <option value="light">Light Mode</option>
                                    <option value="dark">Dark Mode</option>
                                    <option value="red">Red Mode</option>
                                    <option value="green">Green Mode</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Primary Brand Color</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="color" 
                                        defaultValue={settingsData.appearance.primaryColor}
                                        className="w-10 h-10 rounded-lg border-none p-0 overflow-hidden cursor-pointer"
                                    />
                                    <input 
                                        type="text" 
                                        defaultValue={settingsData.appearance.primaryColor}
                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-3 pt-4">
                    <button className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        Reset to Defaults
                    </button>
                    <button className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};
