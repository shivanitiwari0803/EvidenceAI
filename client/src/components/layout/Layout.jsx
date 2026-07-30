import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import WorkflowHeader from './WorkflowHeader';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDE8D8] text-[#1F150C] flex font-sans">
      {/* Dark Sidebar Navigation (w-72) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto space-y-12">
          <WorkflowHeader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
