import React from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Chatbot } from '../chatbot/Chatbot';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="app-main-shell">
          <div className="app-page-container">
            <Outlet />
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
};
