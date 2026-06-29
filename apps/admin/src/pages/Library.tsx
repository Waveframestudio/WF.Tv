import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { Film, Upload, Plus, Trash2, Edit2, Play, X, Layers } from 'lucide-react';

interface VideoAsset {
  id: string;
  title: string;
  description?: string;
  publicUrl: string;
  status: string;
  fileSize: number;
  mimeType: string;
  overlayTemplates: any[];
}

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    try {
      const { data } = await api.get('/videos?limit=50');
      setVideos(data.data);
    } catch (e) {
      console.error('Error fetching videos', e);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setProgress(10);

    try {
      // 1. Obtener URL de subida prefirmada desde el Backend
      const { data: uploadInfo } = await api.post('/videos/upload-url', {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      setProgress(30);

      // 2. Subir directamente el binario a Supabase Storage con XMLHttpRequest para barra de progreso real
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadInfo.uploadUrl, true);
      // Para Supabase signed uploads requerimos el Authorization header si corresponde, pero el signedUrl ya tiene firma en URL
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 60) + 30; // escala 30% a 90%
          setProgress(percentage);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) resolve();
          else reject(new Error('Subida fallida a Supabase Storage'));
        };
        xhr.onerror = () => reject(new Error('Error de red al subir'));
        xhr.send(file);
      });

      setProgress(95);

      // 3. Confirmar subida al Backend NestJS para crear el registro en DB
      await api.post('/videos', {
        title: title || file.name,
        description: description,
        filePath: uploadInfo.filePath,
        uploadJobId: uploadInfo.uploadJobId,
        mimeType: file.type,
        fileSize: file.size,
      });

      setProgress(100);
      setTitle('');
      setDescription('');
      setShowUploadModal(false);
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al subir el archivo');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video y todos sus overlays asociados?')) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos(videos.filter((v) => v.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOverlay = async (video: VideoAsset) => {
    const name = prompt('Nombre de la plantilla de overlay (ej. Promo Precios Almuerzo):');
    if (!name) return;

    try {
      const { data } = await api.post(`/videos/${video.id}/overlay-templates`, { name });
      // Ir directo al editor
      navigate(`/library/${video.id}/overlay/${data.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Librería de Videos</h3>
          <p className="text-slate-400 text-sm">Gestiona tus videos y crea overlays sobre ellos.</p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-lg shadow-brand-500/20 transition-all duration-200"
        >
          <Upload className="h-4 w-4" />
          <span>Subir Video</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-slate-900 relative group flex items-center justify-center border-b border-slate-800">
                  {video.publicUrl ? (
                    <video src={video.publicUrl} className="w-full h-full object-cover" muted loop />
                  ) : (
                    <Film className="h-12 w-12 text-slate-700" />
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => window.open(video.publicUrl, '_blank')}
                      className="p-3 rounded-full bg-brand-500 text-white shadow-lg hover:scale-105 transition-transform"
                    >
                      <Play className="h-5 w-5 fill-white" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-white truncate text-base">{video.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 truncate">{video.description || 'Sin descripción'}</p>

                  <div className="mt-4 flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-500">MIME: {video.mimeType}</span>
                    <span className="text-[10px] text-slate-500">Peso: {(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>

                  {/* Overlays list for this video */}
                  <div className="mt-4 border-t border-slate-800/80 pt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <span>Overlays</span>
                      <button
                        onClick={() => handleCreateOverlay(video)}
                        className="flex items-center space-x-1 text-brand-400 hover:text-brand-300 font-bold"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Nuevo</span>
                      </button>
                    </div>

                    {video.overlayTemplates?.length === 0 ? (
                      <p className="text-xs text-slate-600 mt-2">No hay overlays creados</p>
                    ) : (
                      <div className="space-y-1 mt-2">
                        {video.overlayTemplates?.map((template: any) => (
                          <div key={template.id} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800 text-xs">
                            <span className="text-slate-300 font-medium truncate max-w-[120px]">{template.name}</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => navigate(`/library/${video.id}/overlay/${template.id}`)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('¿Eliminar overlay?')) {
                                    await api.delete(`/overlay-templates/${template.id}`);
                                    fetchVideos();
                                  }
                                }}
                                className="p-1 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(video.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-950 bg-rose-950/10 text-rose-400 hover:bg-rose-950/30 text-xs transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 className="text-lg font-bold text-white mb-4">Subir Nuevo Video</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  placeholder="ej. Hamburguesa Especial de la Casa"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 h-24 resize-none"
                  placeholder="ej. Video promocional con safe zones en los laterales..."
                />
              </div>

              <div className="pt-2">
                <input
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!uploading ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-2xl flex flex-col items-center justify-center space-y-2 bg-slate-900/30 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-slate-600" />
                    <span className="text-sm font-medium text-slate-300">Selecciona o arrastra el archivo de video</span>
                    <span className="text-xs text-slate-500">MP4, WebM o MOV de hasta 2GB</span>
                  </button>
                ) : (
                  <div className="w-full py-8 space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Subiendo archivo a Supabase Storage...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
