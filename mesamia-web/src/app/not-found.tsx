'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand text-white flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <Image 
          src="/logo-white.png" 
          alt="Mesa Mía" 
          width={220} 
          height={60} 
          className="mx-auto mb-10 drop-shadow-lg"
          priority
        />
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-10 md:p-14 shadow-2xl skew-y-1">
          <div className="skew-y-[-1deg]">
            <h1 className="text-8xl md:text-9xl font-black mb-4 tracking-tighter text-white opacity-20">404</h1>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">¡Te has pasado de mesa!</h2>
            <p className="text-white/70 text-lg font-bold mb-10 leading-relaxed">
              La página que buscas no existe o ha cambiado de sitio. Es hora de volver al inicio.
            </p>
            
            <Link 
              href="/" 
              className="w-full py-6 bg-white text-brand font-black rounded-full hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <Home className="w-5 h-5" /> Volver al Inicio
            </Link>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">
            Mesa Mía · Gestión inteligente de cenas
          </p>
        </div>
      </div>
    </div>
  );
}
