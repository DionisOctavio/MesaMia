'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Utensils, Users, TrendingUp, CreditCard, ChevronRight, LogIn } from 'lucide-react';
import { auth } from '@/infrastructure/util/auth';

export default function Home() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(auth.isLoggedIn());
  }, []);

  return (
    <main className="min-h-screen bg-white text-brand font-sans text-left">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-brand text-white px-4">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-4xl w-full px-4 sm:px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-6 sm:mb-8 flex justify-center">
            <Image src="/logo-white.png" alt="Mesa Mía" width={280} height={70} className="drop-shadow-lg w-44 sm:w-56 md:w-72 h-auto" priority />
          </div>
          <p className="text-base sm:text-xl md:text-2xl text-slate-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            La forma más inteligente de organizar cenas grupales. Sin caos, sin listas interminables, solo buenos momentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isLogged ? "/dashboard" : "/login"} className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-brand font-black rounded-full hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              {isLogged ? 'Mis Cenas' : 'Organizar una cena'} <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/join" className="px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              Unirse con código
            </Link>
          </div>
          {!isLogged && (
            <div className="mt-6 sm:mt-8">
               <Link href="/login" className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <LogIn className="w-4 h-4" /> Acceso Organizadores
               </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 tracking-tight uppercase">Menos gestión, más sabor</h2>
          <div className="w-20 h-1.5 bg-brand mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Utensils, title: "Menú Claro", text: "Tus invitados eligen entre platos configurados previamente." },
            { icon: Users, title: "Por Familias", text: "Grupos autogestionados que reducen el ruido del organizador." },
            { icon: TrendingUp, title: "Conteo Real", text: "Sabes exactamente cuántas croquetas pedir al restaurante." },
            { icon: CreditCard, title: "Control Total", text: "Cálculo automático de precios por persona y por familia." }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-ultra-light text-brand rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mental Model section */}
      <section className="bg-brand-ultra-light text-brand py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <h2 className="text-4xl font-black mb-8 leading-tight uppercase">Organización Inteligente</h2>
            <div className="space-y-6">
              {[
                { n: 1, t: "Crea el evento", d: "Configura restaurante, platos y precio base." },
                { n: 2, t: "Comparte el enlace", d: "Tus amigos entran, crean su grupo y añaden a su gente." },
                { n: 3, t: "Relájate", d: "Descarga el PDF para el restaurante y olvídate del lío." }
              ].map(s => (
                <div key={s.n} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0 font-bold">{s.n}</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{s.t}</h4>
                    <p className="text-slate-600">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100">
               <div className="space-y-4">
                  <div className="p-4 bg-brand-ultra-light rounded-2xl border border-slate-100">
                    <span className="text-brand-light text-xs font-bold tracking-widest uppercase mb-1 block">Familia Álvarez</span>
                    <div className="flex justify-between items-center text-left">
                      <span className="font-bold">Ana García</span>
                      <span className="text-brand font-black">33€</span>
                    </div>
                  </div>
                  <div className="p-4 bg-brand text-white rounded-2xl text-left">
                    <span className="text-slate-300 text-xs font-bold tracking-widest uppercase mb-1 block">Conteo Restaurante</span>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Croquetas</span>
                      <span className="font-mono bg-white/20 px-3 py-1 rounded-full text-xs">18</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        &copy; 2026 Mesa Mía - Perfeccionando tus cenas.
      </footer>
    </main>
  );
}
