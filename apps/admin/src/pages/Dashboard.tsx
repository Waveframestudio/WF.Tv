import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Film, MonitorPlay, Layers, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    videosCount: 0,
    screensCount: 0,
    activePlaylists: 0,
    onlineScreens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [videosRes, screensRes, playlistsRes] = await Promise.all([
          api.get('/videos'),
          api.get('/screens'),
          api.get('/playlists'),
        ]);

        const screens = screensRes.data;
        setStats({
          videosCount: videosRes.data.total || 0,
          screensCount: screens.length || 0,
          activePlaylists: playlistsRes.data.filter((p: any) => p.isActive).length || 0,
          onlineScreens: screens.filter((s: any) => s.status === 'ONLINE').length || 0,
        });
      } catch (e) {
        console.error('Error fetching dashboard stats', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { name: 'Videos cargados', value: stats.videosCount, icon: Film, color: 'from-blue-500/20 to-indigo-500/5' },
    { name: 'Pantallas totales', value: stats.screensCount, icon: MonitorPlay, color: 'from-amber-500/20 to-orange-500/5' },
    { name: 'Playlists activas', value: stats.activePlaylists, icon: Layers, color: 'from-emerald-500/20 to-teal-500/5' },
    { name: 'Pantallas en línea', value: `${stats.onlineScreens}/${stats.screensCount}`, icon: Activity, color: 'from-brand-500/20 to-rose-500/5' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border border-slate-800/80">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none"></div>
        <h3 className="text-xl font-bold text-white mb-2">¡Hola administrador!</h3>
        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
          Desde aquí puedes subir nuevo contenido promocional, configurar overlays de precios en tiempo real y publicarlos directamente a todas tus televisiones.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-between`}>
              <div>
                <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">{card.name}</span>
                <h4 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{card.value}</h4>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <Icon className="h-6 w-6 text-brand-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recents view / Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h4 className="font-semibold text-white mb-4">Actividad Reciente</h4>
          <p className="text-sm text-slate-500">No hay logs de reproducción recientes disponibles.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="font-semibold text-white mb-4">Estado del sistema</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Supabase API</span>
              <span className="text-emerald-400 font-medium">Operativo</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Servicios Backend</span>
              <span className="text-emerald-400 font-medium">Operativo</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Latencia promedio</span>
              <span className="text-slate-300">45ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
