import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth';

// Icons
import {
  LayoutDashboard,
  Film,
  MonitorPlay,
  Layers,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

// Pages placeholder / lazy loading
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import OverlayEditor from './pages/OverlayEditor';
import Playlists from './pages/Playlists';
import Devices from './pages/Devices';

// Protect routes
function ProtectedRoute() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return user ? <Layout /> : <Navigate to="/login" replace />;
}

// Main Dashboard Layout
function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Librería', path: '/library', icon: Film },
    { name: 'Playlists', path: '/playlists', icon: Layers },
    { name: 'Pantallas', path: '/devices', icon: MonitorPlay },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              FS
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">FoodScreen</h1>
              <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Manager</span>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/80 mb-6">
              <p className="text-xs text-slate-400">Local activo</p>
              <h4 className="text-sm font-semibold text-white flex items-center justify-between mt-0.5">
                {user?.organization.name}
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </h4>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500 font-medium'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-900">
          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">
            {location.pathname === '/' ? 'Resumen general' : location.pathname.split('/')[1]}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-brand-400">
              {user?.name?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Page content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="library" element={<Library />} />
          <Route path="library/:videoId/overlay/:overlayId" element={<OverlayEditor />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="devices" element={<Devices />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
