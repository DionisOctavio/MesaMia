'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { ArrowLeft, Key, Phone, Hash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    phone: '', 
    dinnerCode: '', 
    newPassword: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', formData);
      toast.success('¡Contraseña actualizada!', { description: 'Ya puedes iniciar sesión con tu nueva contraseña.' });
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Error al recuperar contraseña. Revisa los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-ultra-light flex items-center justify-center p-6 text-brand font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-brand/10 p-8 md:p-12 border border-slate-50 text-center">
        <Image src="/logo-color.png" alt="Mesa Mía" width={180} height={50} style={{ height: 'auto' }} className="mx-auto mb-8" priority />
        
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none">Recuperar acceso a Mesa Mía</h1>
        <p className="text-slate-500 text-xs mb-8 font-medium">
          Valida tu identidad introduciendo tu teléfono y el código de una de tus cenas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tu Teléfono</label>
               <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required 
                    type="tel" 
                    placeholder="Ej: 612345678"
                    className="w-full pl-12 pr-6 py-4 bg-brand-ultra-light border-transparent rounded-[1.2rem] focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none font-bold text-base" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
               </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Código de CENA (Seguridad)</label>
               <div className="relative">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Ej: ABCD"
                    className="w-full pl-12 pr-6 py-4 bg-brand-ultra-light border-transparent rounded-[1.2rem] focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none font-black text-base uppercase" 
                    value={formData.dinnerCode} 
                    onChange={e => setFormData({...formData, dinnerCode: e.target.value.toUpperCase()})} 
                  />
               </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Debes introducir el código de cualquier cena que hayas creado.</p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nueva Contraseña</label>
               <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required 
                    type="password" 
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-6 py-4 bg-brand-ultra-light border-transparent rounded-[1.2rem] focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none font-bold text-base" 
                    value={formData.newPassword} 
                    onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                  />
               </div>
            </div>
          </div>

           <button disabled={loading} type="submit" className="w-full py-5 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-xl uppercase tracking-widest text-xs disabled:opacity-50 mt-4">
            {loading ? 'Validando...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
             <Link href="/login" className="inline-flex items-center gap-2 text-brand-light hover:text-brand text-xs font-black uppercase tracking-widest transition-colors">
               <ArrowLeft className="w-3 h-3" /> Volver al Login
             </Link>
        </div>
      </div>
    </main>
  );
}
