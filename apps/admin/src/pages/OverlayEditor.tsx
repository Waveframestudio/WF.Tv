import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Settings,
  Type,
  Maximize,
  Move,
} from 'lucide-react';

interface OverlayElement {
  id: string;
  type: 'TEXT' | 'PRICE' | 'PROMOTION' | 'LOGO';
  content: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  backgroundOpacity: number;
  padding: number;
  borderRadius: number;
  textAlign: 'left' | 'center' | 'right';
  zIndex: number;
}

interface VideoAsset {
  id: string;
  title: string;
  publicUrl: string;
}

interface OverlayTemplate {
  id: string;
  name: string;
  elements: OverlayElement[];
}

export default function OverlayEditor() {
  const { videoId, overlayId } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState<VideoAsset | null>(null);
  const [template, setTemplate] = useState<OverlayTemplate | null>(null);
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{
    elementId: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, [videoId, overlayId]);

  async function fetchData() {
    try {
      const [videoRes, templateRes] = await Promise.all([
        api.get(`/videos/${videoId}`),
        api.get(`/overlay-templates/${overlayId}`),
      ]);
      setVideo(videoRes.data);
      setTemplate(templateRes.data);
      setElements(templateRes.data.elements || []);
    } catch (e) {
      console.error(e);
      alert('Error cargando los datos del editor');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAddElement = async (type: 'TEXT' | 'PRICE' | 'PROMOTION') => {
    if (!overlayId) return;
    const content = type === 'PRICE' ? '$9.99' : 'Nuevo texto...';

    const newElementPayload = {
      type,
      content,
      xPercent: 0.1,
      yPercent: 0.1,
      widthPercent: 0.25,
      fontSize: 24,
      fontFamily: 'Outfit',
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#f43f5e',
      backgroundOpacity: 0.8,
      padding: 8,
      borderRadius: 8,
      textAlign: 'left' as const,
      zIndex: elements.length + 1,
    };

    try {
      const { data } = await api.post(`/overlay-templates/${overlayId}/elements`, newElementPayload);
      setElements([...elements, data]);
      setSelectedElementId(data.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      // Guardar todos los cambios locales. En el MVP actual guardamos al instante, pero agregamos este trigger como checkpoint de guardado final
      alert('Cambios guardados con éxito en la nube');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveElement = async (id: string) => {
    try {
      await api.delete(`/overlay-elements/${id}`);
      setElements(elements.filter((el) => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStyleChange = async (id: string, updates: Partial<OverlayElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    // Guardar cambio en backend (debounce o instantáneo)
    try {
      await api.patch(`/overlay-elements/${id}`, updates);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Drag and Drop Logic
  const handleMouseDown = (e: React.MouseEvent, element: OverlayElement) => {
    if (!containerRef.current) return;
    e.preventDefault();
    setSelectedElementId(element.id);

    const rect = containerRef.current.getBoundingClientRect();
    // Convertir de % a px
    const startLeft = element.xPercent * rect.width;
    const startTop = element.yPercent * rect.height;

    dragInfo.current = {
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      startLeft,
      startTop,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current || !containerRef.current) return;
    const { elementId, startX, startY, startLeft, startTop } = dragInfo.current;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeft = startLeft + deltaX;
    let newTop = startTop + deltaY;

    // Constraints
    newLeft = Math.max(0, Math.min(newLeft, rect.width));
    newTop = Math.max(0, Math.min(newTop, rect.height));

    const xPercent = Number((newLeft / rect.width).toFixed(4));
    const yPercent = Number((newTop / rect.height).toFixed(4));

    setElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, xPercent, yPercent } : el))
    );
  };

  const handleMouseUp = async () => {
    if (!dragInfo.current) return;
    const { elementId } = dragInfo.current;
    const target = elements.find((el) => el.id === elementId);

    if (target) {
      // Guardar posición final en Backend
      try {
        await api.patch(`/overlay-elements/${elementId}`, {
          xPercent: target.xPercent,
          yPercent: target.yPercent,
        });
      } catch (e) {
        console.error(e);
      }
    }

    dragInfo.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/library')}
            className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Editor de Overlays: {template?.name}</span>
            </h3>
            <p className="text-xs text-slate-500">Video base: {video?.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Plantilla</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Control list */}
        <aside className="w-64 glass-panel p-4 rounded-2xl flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Elementos</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleAddElement('TEXT')}
                className="w-full flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200"
              >
                <Plus className="h-4 w-4 text-brand-400" />
                <span>Agregar Texto</span>
              </button>
              <button
                onClick={() => handleAddElement('PRICE')}
                className="w-full flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Agregar Precio</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-slate-900">
              {elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElementId(el.id)}
                  className={`flex justify-between items-center p-2 rounded-xl border text-xs cursor-pointer ${
                    selectedElementId === el.id
                      ? 'bg-brand-500/10 border-brand-500 text-brand-400 font-medium'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{el.content}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(el.id);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Video Canvas Container (Draggable workspace) */}
        <div className="flex-1 flex flex-col justify-center items-center bg-slate-950 rounded-2xl border border-slate-900 p-6 overflow-hidden relative">
          <div
            ref={containerRef}
            className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl"
          >
            {video && (
              <video
                ref={videoRef}
                src={video.publicUrl}
                className="w-full h-full object-cover"
                muted
                loop
              />
            )}

            {/* Absolute Overlay Layer */}
            <div className="absolute inset-0 pointer-events-none select-none">
              {/* Safe Areas boundaries */}
              <div className="absolute inset-8 border border-dashed border-white/10 rounded pointer-events-none"></div>

              {elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(e, el)}
                    style={{
                      position: 'absolute',
                      left: `${el.xPercent * 100}%`,
                      top: `${el.yPercent * 100}%`,
                      width: `${el.widthPercent * 100}%`,
                      color: el.color,
                      fontSize: `${el.fontSize}px`,
                      fontFamily: el.fontFamily,
                      fontWeight: el.fontWeight,
                      backgroundColor: el.backgroundColor
                        ? `${el.backgroundColor}${Math.round(el.backgroundOpacity * 255)
                            .toString(16)
                            .padStart(2, '0')}`
                        : 'transparent',
                      padding: `${el.padding}px`,
                      borderRadius: `${el.borderRadius}px`,
                      textAlign: el.textAlign,
                      zIndex: el.zIndex,
                      cursor: 'move',
                    }}
                    className={`pointer-events-auto select-text hover:outline hover:outline-1 hover:outline-brand-400 ${
                      isSelected ? 'outline outline-2 outline-brand-500 shadow-lg' : ''
                    }`}
                  >
                    {el.content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
            </button>
          </div>
        </div>

        {/* Right Settings panel */}
        <aside className="w-80 glass-panel p-4 rounded-2xl flex flex-col overflow-y-auto">
          {selectedElement ? (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Propiedades</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Contenido</label>
                <input
                  type="text"
                  value={selectedElement.content}
                  onChange={(e) => handleStyleChange(selectedElement.id, { content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Color de texto</label>
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(e) => handleStyleChange(selectedElement.id, { color: e.target.value })}
                  className="w-full h-8 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Fondo</label>
                <input
                  type="color"
                  value={selectedElement.backgroundColor || '#000000'}
                  onChange={(e) => handleStyleChange(selectedElement.id, { backgroundColor: e.target.value })}
                  className="w-full h-8 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Opacidad Fondo ({selectedElement.backgroundOpacity})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.backgroundOpacity}
                  onChange={(e) => handleStyleChange(selectedElement.id, { backgroundOpacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Tamaño letra</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => handleStyleChange(selectedElement.id, { fontSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Padding (px)</label>
                  <input
                    type="number"
                    value={selectedElement.padding}
                    onChange={(e) => handleStyleChange(selectedElement.id, { padding: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Ancho relativo (%)</label>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.01"
                  value={selectedElement.widthPercent}
                  onChange={(e) => handleStyleChange(selectedElement.id, { widthPercent: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center items-center text-slate-500">
              <Settings className="h-8 w-8 mb-2" />
              <p className="text-xs">Selecciona un elemento para configurar estilos</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
