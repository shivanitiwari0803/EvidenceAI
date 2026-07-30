import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ResearchProvider } from './context/ResearchContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NewResearch from './pages/NewResearch';
import ResearchDetails from './pages/ResearchDetails';
import History from './pages/History';
import EvidenceViewer from './pages/EvidenceViewer';
import Documents from './pages/Documents';
import ResearchBrief from './pages/ResearchBrief';
import Chat from './pages/Chat';
import GlobalSearch from './pages/GlobalSearch';
import SettingsPage from './pages/SettingsPage';

export function App() {
  return (
    <ToastProvider>
      <ResearchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="new" element={<NewResearch />} />
              <Route path="details/:id" element={<ResearchDetails />} />
              <Route path="brief" element={<ResearchBrief />} />
              <Route path="brief/:researchId" element={<ResearchBrief />} />
              <Route path="chat" element={<Chat />} />
              <Route path="chat/:researchId" element={<Chat />} />
              <Route path="search" element={<GlobalSearch />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="history" element={<History />} />
              <Route path="evidence" element={<EvidenceViewer />} />
              <Route path="evidence/:researchId" element={<EvidenceViewer />} />
              <Route path="documents" element={<Documents />} />
              <Route path="documents/:researchId" element={<Documents />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ResearchProvider>
    </ToastProvider>
  );
}

export default App;
