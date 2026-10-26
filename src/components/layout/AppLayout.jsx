import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import InvoiceFormModal from '../invoices/InvoiceFormModal';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Persistent Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onAddInvoiceClick={() => setIsAddInvoiceOpen(true)}
        />

        <main className="page-content">
          <Outlet context={{ openAddInvoice: () => setIsAddInvoiceOpen(true) }} />
        </main>
      </div>

      {/* Global Add Invoice Modal */}
      <InvoiceFormModal
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
      />
    </div>
  );
}
