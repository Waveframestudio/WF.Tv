import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { MonitorPlay, CheckCircle2, AlertCircle, RefreshCw, Plus } from 'lucide-react';

interface Screen {
  id: string;
  name: string;
  deviceId: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR';
  lastSeenAt?: string;
  currentVersion?: string;
  resolution?: string;
  location?: {
    name: string;
  };
}

export default function Devices() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreens();
  }, []);

  async function fetchScreens() {
    setLoading(true);
    try {
      const { data } = await api.get('/screens');
      setScreens(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleManualPairing = () => {
    alert('Ingresa el código de emparejamiento desde la TV Box (función para fase posterior)');
  };

  const getStatusBadge = (status: Screen['status']) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>En línea</span>
          </span>
        );
      case 'SYNCING':
        return (
          <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Sync</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400">
            <AlertCircle className="h-3 w-3" />
            <span>Error</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800 text-slate-500">
            <span>Desconectada</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Pantallas / TV Boxes</h3>
          <p className="text-slate-400 text-sm">Monitorea y gestiona tus pantallas activas en tiempo real.</p>
        </div>
        <button
          onClick={handleManualPairing}
          className="flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Vincular Pantalla</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <div key={screen.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <MonitorPlay className="h-6 w-6 text-brand-400" />
                  </div>
                  {getStatusBadge(screen.status)}
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-white text-base">{screen.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">Ubicación: {screen.location?.name || 'No asignada'}</p>
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-900 pt-4 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>ID Dispositivo:</span>
                    <span className="font-mono text-slate-300">{screen.deviceId.slice(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última conexión:</span>
                    <span className="text-slate-300">
                      {screen.lastSeenAt ? new Date(screen.lastSeenAt).toLocaleTimeString() : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versión Playlist:</span>
                    <span className="text-slate-300 font-semibold">{screen.currentVersion || '—'}</span>
                  </div>
                  {screen.resolution && (
                    <div className="flex justify-between">
                      <span>Resolución:</span>
                      <span className="text-slate-300">{screen.resolution}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
