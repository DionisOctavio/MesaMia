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
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 leading-none">Únete a una cena</h1>
          <p className="text-slate-500 mb-8 font-medium">Introduce el código que te han compartido.</p>

          <form onSubmit={handleJoin} className="space-y-6">
            <input 
              required
              type="text" 
              placeholder="CÓDIGO (Ej: ABCD)"
              className="w-full px-8 py-6 bg-brand-ultra-light border-transparent rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all outline-none text-3xl font-black text-center uppercase tracking-[0.2em] placeholder:text-slate-200"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            
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
