import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const { user, login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 p-4">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-rose-500/5 blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center font-bold text-white shadow-xl shadow-brand-500/25 text-xl">
            FS
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
          <p className="mt-1 text-sm text-slate-400">Accede al panel de control de FoodScreen</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="ejemplo@milocall.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium shadow-lg shadow-brand-500/20 transition-all duration-200"
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
