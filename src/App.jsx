import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import OverviewPage from './pages/OverviewPage';
import InvoicesPage from './pages/InvoicesPage';
import CustomersPage from './pages/CustomersPage';
import FollowUpsPage from './pages/FollowUpsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="follow-ups" element={<FollowUpsPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="activity-history" element={<ActivityHistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>

      {/* Global Toast Notification System */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
            padding: '12px 16px'
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#FFFFFF'
            }
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FFFFFF'
            }
          }
        }}
      />
    </AppProvider>
  );
}
