'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { Users, Utensils, CreditCard, Share2, Download, ListChecks, ArrowLeft, Trash2, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { showConfirm } from '@/components/Modal';
import { copyToClipboard } from '@/infrastructure/util/clipboard';

export default function AdminPage() {
  const { code } = useParams();
  const [dinner, setDinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [adminCodeModal, setAdminCodeModal] = useState(false); // show admin code popup
  const [adminCopied, setAdminCopied] = useState(false);

  const fetchDinner = () => {
    api.get(`/dinners/${code}`).then(setDinner).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDinner();
    const timer = setInterval(fetchDinner, 30000);
    return () => clearInterval(timer);
  }, [code]);

  const handleShare = async () => {
    const url = `${window.location.origin}/dinner/${code}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setSharing(true);
      toast.success('Enlace de invitado copiado');
      setTimeout(() => setSharing(false), 2000);
    } else {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleShareAdmin = async () => {
    const adminCode = dinner?.adminCode;
    if (!adminCode) {
      toast.error('Esta cena no tiene código de colaborador.');
      return;
    }
    const url = `${window.location.origin}/dinner/${adminCode}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setAdminCopied(true);
      toast.success('Enlace de colaborador copiado');
      setTimeout(() => setAdminCopied(false), 3000);
    }
    setAdminCodeModal(true);
  };

  const handleDeleteFamily = async (id: string, name: string) => {
    const ok = await showConfirm(
      'Expulsar grupo',
      `¿Seguro que quieres expulsar al grupo «${name}»? Se borrarán todos sus integrantes y pedidos permanentemente.`,
      { danger: true, confirmText: 'Expulsar' }
    );
    if (!ok) return;
    try {
      await api.delete(`/families/${id}`);
      toast.success('Grupo eliminado');
      fetchDinner();
    } catch {
      toast.error('Error al eliminar el grupo');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-brand text-white flex items-center justify-center font-black uppercase text-xs tracking-[0.2em] px-6 text-center">
      Cargando Panel...
    </div>
  );
  
  if (!dinner) return <div className="min-h-screen flex items-center justify-center font-bold">Cena no encontrada.</div>;

  const families = dinner.families || [];
  const people = families.flatMap((f: any) => f.people || []);
  const orders = people.map((p: any) => p.order).filter(Boolean);
  
  const numericPrice = parseFloat(dinner.menuPrice.replace(',', '.')) || 0;
  const totalMoney = people.length * numericPrice;
  
  const counts: Record<string, number> = {};
  if (dinner.mode === 'MENU') {
    orders.forEach((o: any) => {
      [o.starter, o.main, o.dessert, o.drink].filter(Boolean).forEach(x => counts[x] = (counts[x] || 0) + 1);
    });
  } else {
    orders.forEach((o: any) => {
      try {
        const items = JSON.parse(o.cartaItems || '[]');
        items.forEach((x: any) => {
          if (typeof x === 'string') {
            counts[x] = (counts[x] || 0) + 1;
          } else if (x && x.name && x.quantity) {
            counts[x.name] = (counts[x.name] || 0) + x.quantity;
          }
        });
      } catch { }
    });
  }

  return (
    <div className="min-h-screen bg-brand-ultra-light py-6 md:py-10 px-4 md:px-6 font-sans text-brand text-left">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-light font-black mb-0 text-[10px] uppercase tracking-widest hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mis Cenas
          </Link>
          <Image src="/logo-color.png" alt="Mesa Mía" width={100} height={30} style={{ height: 'auto' }} className="opacity-70" priority />
        </div>

        <header className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-brand-light font-black tracking-widest uppercase text-[9px] mb-2 leading-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Panel de Control ({dinner.mode})
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-brand uppercase tracking-tight leading-none mb-2 truncate">{dinner.name}</h1>
              <p className="text-slate-600 font-bold text-sm tracking-tight">{dinner.restaurant} • <span className="text-brand select-all font-mono bg-brand-ultra-light px-2 py-1 rounded-lg ml-1">{dinner.code}</span></p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
              <Link href={`/admin/${code}/edit`} className="px-4 sm:px-6 py-3 sm:py-4 bg-white text-brand border border-slate-100 rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all hover:bg-slate-50 shadow-md">
                <Utensils className="w-4 h-4" /> <span className="hidden sm:inline">Editar</span> Carta
              </Link>
              <button onClick={handleShare} className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-widest ${sharing ? 'bg-emerald-500 text-white' : 'bg-white text-brand border border-slate-100'}`}>
                <Share2 className="w-4 h-4" /> {sharing ? 'Copiado' : 'Invitar'}
              </button>
               <button onClick={handleShareAdmin} className="px-4 sm:px-6 py-3 sm:py-4 bg-white text-brand-light border border-slate-100 rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-slate-50 shadow-md transition-all print:hidden">
                <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Colaborador</span>
              </button>
              <button onClick={() => window.print()} className="px-4 sm:px-6 py-3 sm:py-4 bg-brand text-white rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-xl shadow-brand/20 print:hidden">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span> PDF
              </button>
            </div>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Organizadores:</span>
             <div className="flex -space-x-2">
               {(dinner.organizers || []).map((org: any, i: number) => (
                 <div key={i} className="w-8 h-8 rounded-full bg-brand border-2 border-white flex items-center justify-center text-[10px] text-white font-black" title={org.phone}>
                   {org.phone.substring(0, 1)}
                 </div>
               ))}
             </div>
           </div>
           {dinner.adminCode && (
             <button onClick={handleShareAdmin} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-light border border-dashed border-slate-200 rounded-xl px-3 py-2 hover:border-brand hover:text-brand transition-all" title="Copiar código de colaborador">
               <ShieldCheck className="w-3 h-3" /> Código colaborador: <span className="font-mono text-brand">{dinner.adminCode}</span>
             </button>
           )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8 text-left">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: Users, label: 'Personas', value: people.length },
                { icon: Utensils, label: 'Selecciones', value: orders.length },
                { icon: CreditCard, label: 'Recaudado (est)', value: dinner.mode === 'MENU' ? `${totalMoney.toFixed(2)}€` : 'Variable' },
              ].map((stat, i) => (
                <div key={i} className="p-6 md:p-8 bg-white rounded-[2rem] border border-slate-50 shadow-sm flex flex-row sm:flex-col items-center sm:items-start gap-4 transition-all hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center flex-shrink-0"><stat.icon className="w-5 h-5" /></div>
                  <div className="text-left">
                    <div className="text-2xl md:text-3xl font-black leading-none text-brand">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kitchen summary */}
            <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-6 md:p-10 text-left">
               <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-brand flex items-center gap-3">
                 <ListChecks className="w-6 h-6 text-brand/30" /> Resumen para Cocina
               </h3>
               <div className="grid sm:grid-cols-2 gap-3 text-left">
                  {Object.entries(counts).map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center p-5 bg-brand-ultra-light rounded-3xl group hover:bg-brand hover:text-white transition-all shadow-sm">
                      <span className="font-black uppercase tracking-tight text-xs md:text-sm truncate pr-2 leading-none">{name}</span>
                      <span className="w-8 h-8 rounded-full bg-white text-brand border border-slate-50 flex items-center justify-center flex-shrink-0 text-xs font-black shadow-inner">{count}</span>
                    </div>
                  ))}
                  {Object.keys(counts).length === 0 && <div className="col-span-2 py-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Esperando primer pedido...</div>}
               </div>
            </div>
          </div>

          {/* Families */}
          <div className="space-y-6 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand/60 ml-2">Grupos Inscritos</h3>
            {families.map((family: any) => (
              <div key={family.id} className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-50 shadow-sm relative group/card">
                <button 
                  onClick={() => handleDeleteFamily(family.id, family.name)}
                  className="absolute top-6 right-6 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover/card:opacity-100 p-2"
                  title="Expulsar grupo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex justify-between items-center mb-6 pr-8">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none truncate pr-4">{family.name}</h4>
                  <span className="bg-brand-ultra-light text-brand px-3 py-1 rounded-full text-[9px] font-black uppercase flex-shrink-0">{family.people?.length || 0} P.</span>
                </div>
                <div className="space-y-3">
                  {family.people?.map((p: any) => {
                    const hasOrder = dinner.mode === 'MENU' ? p.order?.starter : (p.order?.cartaItems && p.order.cartaItems !== '[]');
                    return (
                      <div key={p.id} className="flex justify-between items-center p-4 bg-brand-ultra-light/40 rounded-2xl group transition-all hover:bg-brand hover:text-white relative">
                        <div className="truncate pr-2">
                          <span className="font-black uppercase text-xs block truncate leading-none mb-1">{p.name}</span>
                          <span className="text-[9px] font-bold text-slate-500 group-hover:text-white/60">Pulsa para elegir menú</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/dinner/${code}/order/${p.id}`}
                            className="p-2 text-slate-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar selección"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <div className={`text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0 uppercase tracking-tighter shadow-sm ${hasOrder ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {hasOrder ? 'LIQUIdO' : 'PdTE'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Admin Code Modal ─────────────────────────────── */}
      {adminCodeModal && dinner?.adminCode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAdminCodeModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-200 text-left">
            <div className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-brand mb-1">Código de Colaborador</h3>
            <p className="text-slate-500 text-sm mb-6">Comparte este enlace con quien quieras que te ayude a administrar la cena.</p>

            <div className="bg-brand-ultra-light rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Código</p>
              <p className="font-mono font-black text-brand text-2xl tracking-widest select-all">{dinner.adminCode}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Enlace completo</p>
              <p className="font-mono text-xs text-brand-light break-all select-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/dinner/{dinner.adminCode}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAdminCodeModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">
                Cerrar
              </button>
               <button
                onClick={async () => {
                  const url = `${window.location.origin}/dinner/${dinner.adminCode}`;
                  const ok = await copyToClipboard(url);
                  if (ok) {
                    setAdminCopied(true);
                    toast.success('Enlace copiado');
                    setTimeout(() => setAdminCopied(false), 3000);
                  } else {
                    toast.error('No se pudo copiar');
                  }
                }}
                className={`flex-[2] py-4 font-black rounded-2xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${adminCopied ? 'bg-emerald-500 text-white' : 'bg-brand text-white'}`}
              >
                {adminCopied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Enlace</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-6xl { max-width: 100% !important; }
          button, nav, a[href="/dashboard"] { display: none !important; }
          .shadow-sm, .shadow-md, .shadow-xl { shadow: none !important; border: 1px solid #eee !important; }
          .bg-brand-ultra-light { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .bg-brand { background-color: #0f172a !important; -webkit-print-color-adjust: exact; }
          .text-brand { color: #0f172a !important; }
        }
      `}</style>
    </div>
  );
}
