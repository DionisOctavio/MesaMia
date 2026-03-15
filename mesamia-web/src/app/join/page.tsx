'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JoinByCode() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length > 0) {
      router.push(`/dinner/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand text-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Inicio
        </Link>
        
        <div className="bg-white text-brand rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl">
          <Image src="/logo-color.png" alt="Mesa Mía" width={160} height={45} style={{ height: 'auto' }} className="mb-8" />
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2 leading-none">Únete a una cena</h1>
          <p className="text-slate-600 mb-8 font-bold text-lg">Introduce el código de la cena que te han dado.</p>

          <form onSubmit={handleJoin} className="space-y-6">
            <input 
              required
              type="text" 
              placeholder="CÓDIGO"
              autoFocus
              className="w-full px-8 py-6 md:py-8 bg-brand-ultra-light border-2 border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-brand/10 focus:border-brand transition-all outline-none text-4xl md:text-5xl font-black text-center uppercase tracking-[0.3em] placeholder:text-slate-300 mb-2"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-6 italic">Ejemplo: ABCD o 1234AB</p>
            
            <button 
              type="submit"
              className="w-full py-6 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-xl flex items-center justify-center gap-3 text-xl uppercase tracking-widest"
            >
              Entrar <ArrowRight className="w-6 h-6" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">¿No tienes código?</p>
            <Link href="/create" className="text-brand font-black uppercase tracking-tight hover:underline">
              Crea tu propia cena →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
