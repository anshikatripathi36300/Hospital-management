/**
 * AppLayout.jsx
 *
 * The authenticated shell layout — Sidebar + Navbar + page content area.
 * Used by all protected role-based pages.
 *
 * Props:
 *   title: string — page title shown in the Navbar
 *   children: React nodes — the page content
 */
import { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';

export default function AppLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
