/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Forced refresh comment
import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { useCRMStore } from './store/useStore';
import { IconSprite } from './components/Icon';
import { cn } from './utils/cn';
import { AppRoutes } from './routes/AppRoutes';
import { Notification } from './components/Notification';

export default function App() {
  const { isAuthenticated, theme, fetchSchema, fetchSidebar, fetchRoutes } = useCRMStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchema();
      fetchSidebar();
      fetchRoutes();
    }
  }, [isAuthenticated, fetchSchema, fetchSidebar, fetchRoutes]);

  if (!isAuthenticated) {
    return (
      <div className={cn("h-screen w-full", theme)}>
        <IconSprite />
        <LoginPage />
        <Notification />
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen w-full bg-[#F8F9FA] overflow-hidden", theme)}>
      <IconSprite />
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AppRoutes />
      </main>
      <Notification />
    </div>
  );
}
