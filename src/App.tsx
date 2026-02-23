import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Upload, Search, FileText, BarChart3, FileSpreadsheet } from 'lucide-react';
import ImportPage from './pages/ImportPage';
import ConsultPage from './pages/ConsultPage';
import ReportPage from './pages/ReportPage';

const navItems = [
  { to: '/importar', label: 'Importar XMLs', icon: Upload },
  { to: '/consultar', label: 'Consultar CPF', icon: Search },
  { to: '/relatorios', label: 'Relatórios e PDFs', icon: FileText },
];

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#003366] text-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">eSocial S-5002</h1>
                  <p className="text-[10px] text-blue-200 leading-none mt-0.5">Informe de Rendimentos • IRRF</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-[#003366] shadow-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/importar" replace />} />
            <Route path="/importar" element={<ImportPage />} />
            <Route path="/consultar" element={<ConsultPage />} />
            <Route path="/relatorios" element={<ReportPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-slate-400 py-4 text-center text-xs">
          <div className="flex items-center justify-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Sistema de Informe de Rendimentos — eSocial S-5002 — 100% Offline
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
