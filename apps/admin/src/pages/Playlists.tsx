import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Layers, Plus, Trash2, Video, ArrowUp, ArrowDown, Send, FileCode } from 'lucide-react';

interface PlaylistItem {
  id: string;
  order: number;
  videoAsset: {
    id: string;
    title: string;
  };
  overlayTemplate?: {
    id: string;
    name: string;
  };
  durationOverride?: number;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  items: PlaylistItem[];
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [locations, setLocations] = useState<any[]>([]);

  // Item addition
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedOverlayId, setSelectedOverlayId] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [locationsRes, videosRes] = await Promise.all([
        api.get('/locations'),
        api.get('/videos'),
      ]);
      setLocations(locationsRes.data);
      setVideos(videosRes.data.data);

      if (locationsRes.data.length > 0) {
        setSelectedLocationId(locationsRes.data[0].id);
        fetchPlaylists(locationsRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPlaylists(locationId: string) {
    setLoading(true);
    try {
      const { data } = await api.get(`/playlists?locationId=${locationId}`);
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylistId) {
        setSelectedPlaylistId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName || !selectedLocationId) return;

    try {
      const { data } = await api.post('/playlists', {
        name: playlistName,
        description: playlistDesc,
        locationId: selectedLocationId,
      });
      setPlaylists([data, ...playlists]);
      setSelectedPlaylistId(data.id);
      setShowCreateModal(false);
      setPlaylistName('');
      setPlaylistDesc('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async () => {
    if (!selectedPlaylistId || !selectedVideoId) return;

    const playlist = playlists.find(p => p.id === selectedPlaylistId);
    if (!playlist) return;

    const order = playlist.items.length + 1;

    try {
      await api.post(`/playlists/${selectedPlaylistId}/items`, {
        videoAssetId: selectedVideoId,
        overlayTemplateId: selectedOverlayId || undefined,
        order,
      });

      // Refrescar playlist activa
      const { data } = await api.get(`/playlists/${selectedPlaylistId}`);
      setPlaylists(playlists.map(p => p.id === selectedPlaylistId ? data : p));
      setSelectedVideoId('');
      setSelectedOverlayId('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedPlaylistId) return;
    try {
      await api.delete(`/playlists/${selectedPlaylistId}/items/${itemId}`);
      const { data } = await api.get(`/playlists/${selectedPlaylistId}`);
      setPlaylists(playlists.map(p => p.id === selectedPlaylistId ? data : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (playlist: Playlist) => {
    try {
      const { data } = await api.patch(`/playlists/${playlist.id}`, {
        isActive: !playlist.isActive,
      });
      setPlaylists(playlists.map(p => p.id === playlist.id ? { ...p, isActive: data.isActive } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = async (playlistId: string) => {
    const note = prompt('Nota de publicación / Versión (ej. Menú Almuerzo v1.1):');
    if (note === null) return;

    try {
      await api.post(`/playlists/${playlistId}/publish`, { note });
      alert('¡Playlist publicada y empaquetada! Todos los TV Boxes sincronizarán los cambios en la próxima llamada.');
    } catch (e) {
      console.error(e);
    }
  };

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Playlists list */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-white">Playlists</h4>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-xl"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => setSelectedPlaylistId(playlist.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedPlaylistId === playlist.id
                    ? 'bg-slate-900 border-brand-500 text-white'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-sm truncate max-w-[140px]">{playlist.name}</h5>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(playlist);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      playlist.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {playlist.isActive ? 'Activa' : 'Pausada'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">{playlist.description || 'Sin descripción'}</p>
                <span className="text-[10px] text-slate-600 block mt-3 font-semibold uppercase">{playlist.items?.length || 0} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playlist Details & Items builder */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between overflow-y-auto">
        {activePlaylist ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white text-lg">{activePlaylist.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{activePlaylist.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePublish(activePlaylist.id)}
                  className="flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Publicar a Pantalla</span>
                </button>
              </div>
            </div>

            {/* Builder elements */}
            <div className="space-y-4 pt-4 border-t border-slate-900">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Videos en la Playlist</h5>

              {/* Items List */}
              <div className="space-y-2">
                {activePlaylist.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900 border border-slate-850 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded bg-slate-950/60 flex items-center justify-center font-bold text-slate-400">
                        {item.order}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{item.videoAsset.title}</p>
                        <span className="text-[10px] text-slate-500">
                          {item.overlayTemplate ? `Overlay: ${item.overlayTemplate.name}` : 'Sin overlay'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item interface */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Video</label>
                  <select
                    value={selectedVideoId}
                    onChange={(e) => {
                      setSelectedVideoId(e.target.value);
                      setSelectedOverlayId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="">Selecciona video...</option>
                    {videos.map(v => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Overlay asociado</label>
                  <select
                    value={selectedOverlayId}
                    onChange={(e) => setSelectedOverlayId(e.target.value)}
                    disabled={!selectedVideoId}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white disabled:opacity-50"
                  >
                    <option value="">Ninguno</option>
                    {selectedVideo?.overlayTemplates?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddItem}
                    disabled={!selectedVideoId}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-brand-400 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Añadir a playlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center items-center text-slate-500">
            <Layers className="h-8 w-8 mb-2" />
            <p className="text-xs">Selecciona o crea una playlist para empezar</p>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl relative shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-4">Nueva Playlist</h4>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  placeholder="ej. Menú Hamburguesas Noche"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descripción</label>
                <textarea
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none h-20 resize-none"
                  placeholder="ej. Playlist rotativa con precios actualizados para pantallas..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-900 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
