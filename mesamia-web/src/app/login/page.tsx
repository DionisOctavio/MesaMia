'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { auth } from '@/infrastructure/util/auth';
import { ArrowLeft, Key, Phone, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/signup', formData);
        toast.success('¡Cuenta creada!', { description: 'Ahora puedes iniciar sesión.' });
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', formData);
        auth.setToken(res.accessToken);
        auth.setOrganizerId(res.organizerId);
        toast.success('¡Bienvenido!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-ultra-light flex items-center justify-center p-6 text-brand font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-brand/10 p-8 md:p-12 border border-slate-50 text-center">
        <Image src="/logo-color.png" alt="Mesa Mía" width={200} height={55} style={{ height: 'auto' }} className="mx-auto mb-8" priority />
        
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
          {isRegister ? 'Crear cuenta en Mesa Mía' : 'Acceso para Organizadores'}
        </h1>
        <p className="text-slate-500 text-sm mb-10 font-medium">
          {isRegister ? 'Regístrate para gestionar tus cenas.' : 'Inicia sesión para crear una nueva cena.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
               <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input required type="tel" className="w-full pl-14 pr-6 py-5 bg-brand-ultra-light border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none font-bold text-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
               <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-5 bg-brand-ultra-light border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none font-bold text-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
               {!isRegister && (
                 <Link href="/recover-password" title="¿Has olvidado tu contraseña?" className="text-xs font-bold text-brand-light hover:text-brand uppercase tracking-widest ml-1 inline-block mt-2">
                   ¿Has olvidado tu contraseña?
                 </Link>
               )}
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-6 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-xl shadow-brand/10 uppercase tracking-widest text-sm disabled:opacity-50">
            {loading ? 'Cargando...' : isRegister ? 'Crear Cuenta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
          <button onClick={() => setIsRegister(!isRegister)} className="text-brand-light font-black uppercase tracking-widest text-xs hover:text-brand transition-colors">
            {isRegister ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate'}
          </button>
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-brand text-xs font-bold uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
