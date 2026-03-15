'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { Users, Utensils, CreditCard, Share2, Download, ListChecks, ArrowLeft, Trash2, ExternalLink, ShieldCheck, Copy, Check, Phone } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [editingFamily, setEditingFamily] = useState<any>(null); // For phone editing
  const [newPhone, setNewPhone] = useState('');
  const [summaryTab, setSummaryTab] = useState<'aggregated' | 'individual' | 'categories'>('aggregated');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

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

  const handleEditPhone = (family: any) => {
    setEditingFamily(family);
    setNewPhone(family.phone || '');
  };

  const saveNewPhone = async () => {
    try {
      await api.patch(`/families/${editingFamily.id}`, { phone: newPhone });
      toast.success('Teléfono actualizado');
      setEditingFamily(null);
      fetchDinner();
    } catch {
      toast.error('Error al actualizar el teléfono');
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

  const numericPrice = parseFloat((dinner.menuPrice || '0').toString().replace(',', '.')) || 0;

  // Calculate total for MENU mode
  const totalMenuMoney = people.length * numericPrice;

  // Calculate total for CARTA mode by summing all confirmed order items
  const totalCartaMoney = (() => {
    if (dinner.mode !== 'CARTA') return 0;
    let total = 0;
    try {
      const cartaProducts = JSON.parse(dinner.cartaProducts || '[]');
      const allProducts = cartaProducts.flatMap((cat: any) => cat.products || []);
      orders.forEach((o: any) => {
        try {
          const items = JSON.parse(o.cartaItems || '[]');
          items.forEach((item: any) => {
            const itemName = typeof item === 'string' ? item : item.name;
            const itemQty = typeof item === 'string' ? 1 : (item.quantity || 1);
            const prod = allProducts.find((ap: any) => ap.name === itemName);
            if (prod) total += parseFloat((prod.price || '0').toString().replace(',', '.')) * itemQty;
          });
        } catch { }
      });
    } catch { }
    return total;
  })();

  const totalMoney = dinner.mode === 'MENU' ? totalMenuMoney : totalCartaMoney;

  const counts: Record<string, number> = {};
  const individuals: any[] = [];
  const categoryCounts: Record<string, Record<string, number>> = {};

  const allProducts = (() => {
    try {
      const cartaProducts = JSON.parse(dinner.cartaProducts || '[]');
      return cartaProducts.flatMap((cat: any) => (cat.products || []).map((p: any) => ({ ...p, category: cat.name })));
    } catch { return [] as any[]; }
  })();

  const filteredFamilies = families.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.people || []).some((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  people.forEach((p: any) => {
    if (!p.order) return;
    const items: { name: string, qty: number, category?: string }[] = [];

    if (dinner.mode === 'MENU') {
      [
        { name: p.order.starter, cat: 'Entrantes' },
        { name: p.order.main, cat: 'Principales' },
        { name: p.order.dessert, cat: 'Postres' },
        { name: p.order.drink, cat: 'Bebidas' }
      ].filter(x => x.name).forEach(x => {
        items.push({ name: x.name, qty: 1, category: x.cat });
        counts[x.name] = (counts[x.name] || 0) + 1;
        if (!categoryCounts[x.cat]) categoryCounts[x.cat] = {};
        categoryCounts[x.cat][x.name] = (categoryCounts[x.cat][x.name] || 0) + 1;
      });
    } else {
      try {
        const cartaItems = JSON.parse(p.order.cartaItems || '[]');
        cartaItems.forEach((x: any) => {
          const name = typeof x === 'string' ? x : x.name;
          const qty = typeof x === 'string' ? 1 : (x.quantity || 1);
          const prodInfo = allProducts.find((ap: any) => ap.name === name);
          const cat = prodInfo?.category || 'Otros';

          items.push({ name, qty, category: cat });
          counts[name] = (counts[name] || 0) + qty;
          if (!categoryCounts[cat]) categoryCounts[cat] = {};
          categoryCounts[cat][name] = (categoryCounts[cat][name] || 0) + qty;
        });
      } catch { }
    }
    if (items.length > 0) {
      individuals.push({ personName: p.name, familyName: families.find((f: any) => f.id === p.familyId)?.name, items });
    }
  });

  const handleCopySummary = () => {
    let text = `RESUMEN PARA COCINA - ${dinner.name}\n\n`;
    if (summaryTab === 'aggregated') {
      text += Object.entries(counts).map(([name, count]) => `• ${count}x ${name}`).join('\n');
    } else if (summaryTab === 'categories') {
      Object.entries(categoryCounts).forEach(([cat, items]) => {
        text += `[${cat.toUpperCase()}]\n`;
        text += Object.entries(items).map(([name, count]) => `  - ${count}x ${name}`).join('\n');
        text += '\n';
      });
    } else {
      individuals.forEach(ind => {
        text += `${ind.personName} (${ind.familyName}):\n`;
        text += ind.items.map((i: any) => `  - ${i.qty > 1 ? i.qty + 'x ' : ''}${i.name}`).join('\n');
        text += '\n';
      });
    }
    copyToClipboard(text).then(() => toast.success('Resumen copiado para cocina'));
  };

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
            <div className="grid grid-cols-2 lg:flex gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
              <Link href={`/admin/${code}/edit`} className="px-3 sm:px-6 py-3 sm:py-4 bg-white text-brand border border-slate-100 rounded-2xl font-black flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:bg-slate-50 shadow-md">
                <Utensils className="w-4 h-4" /> <span>Carta</span>
              </Link>
              <button onClick={handleShare} className={`px-3 sm:px-6 py-3 sm:py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-[10px] sm:text-xs uppercase tracking-widest ${sharing ? 'bg-emerald-500 text-white' : 'bg-white text-brand border border-slate-100'}`}>
                <Share2 className="w-4 h-4" /> {sharing ? 'OK' : 'Invitar'}
              </button>
              <button onClick={handleShareAdmin} className="px-3 sm:px-6 py-3 sm:py-4 bg-white text-brand-light border border-slate-100 rounded-2xl font-black flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 shadow-md transition-all print:hidden">
                <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              </button>
              <button onClick={() => window.print()} className="px-3 sm:px-6 py-3 sm:py-4 bg-brand text-white rounded-2xl font-black flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-brand/20 print:hidden">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Organizadores:</span>
            <div className="flex -space-x-2">
              {(dinner.organizers || []).map((org: any, i: number) => (
                <div key={i} className="w-8 h-8 rounded-full bg-brand border-2 border-white flex items-center justify-center text-xs text-white font-black" title={org.phone}>
                  {org.phone.substring(0, 1)}
                </div>
              ))}
            </div>
          </div>
          {dinner.adminCode && (
            <button onClick={handleShareAdmin} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-light border border-dashed border-slate-200 rounded-xl px-3 py-2 hover:border-brand hover:text-brand transition-all" title="Copiar código de colaborador">
              <ShieldCheck className="w-3 h-3" /> Código colaborador: <span className="font-mono text-brand">{dinner.adminCode}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Top Section: Quick Stats and Kitchen Summary */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {[
                  { icon: Users, label: 'Personas', value: people.length },
                  { icon: Utensils, label: 'Pedidos', value: orders.length },
                  { icon: CreditCard, label: 'Importe', value: `${totalMoney.toFixed(1)}€` },
                ].map((stat, i) => (
                  <div key={i} className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-50 shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:scale-[1.02]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand text-white flex items-center justify-center flex-shrink-0"><stat.icon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <div className="text-left">
                      <div className="text-lg sm:text-2xl font-black leading-none text-brand">{stat.value}</div>
                      <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              {/* Kitchen summary */}
              <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-6 md:p-8 h-full text-left flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-brand flex items-center gap-3">
                    <ListChecks className="w-6 h-6 text-brand/30" /> Resumen Cocina
                  </h3>
                  <div className="flex flex-wrap items-center bg-brand-ultra-light p-1 rounded-2xl gap-1">
                    <button onClick={() => setSummaryTab('aggregated')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${summaryTab === 'aggregated' ? 'bg-brand text-white shadow-md' : 'text-brand/40 hover:text-brand'}`}>Cantidades</button>
                    <button onClick={() => setSummaryTab('individual')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${summaryTab === 'individual' ? 'bg-brand text-white shadow-md' : 'text-brand/40 hover:text-brand'}`}>Individual</button>
                    <button onClick={() => setSummaryTab('categories')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${summaryTab === 'categories' ? 'bg-brand text-white shadow-md' : 'text-brand/40 hover:text-brand'}`}>Categorías</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {summaryTab === 'aggregated' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                      {Object.entries(counts).map(([name, count]) => (
                        <div key={name} className="flex justify-between items-center p-4 bg-brand-ultra-light rounded-3xl group hover:bg-brand hover:text-white transition-all shadow-sm">
                          <span className="font-black uppercase tracking-tight text-[11px] leading-tight flex-1 break-words pr-4">{name}</span>
                          <span className="w-8 h-8 rounded-full bg-white text-brand border border-slate-50 flex items-center justify-center flex-shrink-0 text-xs font-black shadow-inner">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {summaryTab === 'individual' && (
                    <div className="space-y-4">
                      {individuals.map((ind, i) => (
                        <div key={i} className="bg-brand-ultra-light p-5 rounded-[2rem] border border-slate-100">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-brand uppercase text-xs tracking-tight">{ind.personName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ind.familyName}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ind.items.map((it: any, j: number) => (
                              <span key={j} className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-bold text-brand shadow-sm border border-slate-50">
                                {it.qty > 1 && <span className="text-brand-light mr-1">{it.qty}x</span>}{it.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {summaryTab === 'categories' && (
                    <div className="space-y-6">
                      {Object.entries(categoryCounts).map(([cat, itemCounts]) => (
                        <div key={cat}>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{cat}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(itemCounts).map(([name, count]) => (
                              <div key={name} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                <span className="font-black uppercase tracking-tight text-[11px] leading-tight flex-1 break-words pr-4">{name}</span>
                                <span className="w-8 h-8 rounded-full bg-brand-ultra-light text-brand flex items-center justify-center flex-shrink-0 text-xs font-black">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(counts).length === 0 && <div className="py-20 text-center text-slate-200 font-black uppercase tracking-[0.3em] text-[10px]">Sin pedidos todavía</div>}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50">
                  <button onClick={handleCopySummary} className="w-full py-4 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95">
                    <Copy className="w-4 h-4" /> Copiar comandas para cocina
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Families (Full Width Grid) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand/60 ml-2">Grupos Inscritos ({families.length})</h3>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === 'card' ? 'bg-white text-brand shadow-sm' : 'text-slate-400 hover:text-brand'}`}>Tarjetas</button>
                  <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === 'list' ? 'bg-white text-brand shadow-sm' : 'text-slate-400 hover:text-brand'}`}>Lista</button>
                </div>
              </div>
              <div className="relative w-full sm:w-auto min-w-[300px]">
                <input
                  type="text"
                  placeholder="Buscar grupo o persona..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand shadow-sm"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                />
                <ListChecks className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>

            {viewMode === 'card' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFamilies.map((family: any) => (
                  <div key={family.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm relative group/card flex flex-col">
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button onClick={() => handleEditPhone(family)} className="p-2 text-slate-300 hover:text-brand transition-colors" title="Editar teléfono">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteFamily(family.id, family.name)} className="p-2 text-red-100 hover:text-red-500 transition-colors" title="Expulsar grupo">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-base font-black uppercase tracking-tight leading-none mb-1 truncate pr-12">{family.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">
                        {family.phone || 'Sin teléfono'}
                      </p>
                    </div>

                    <div className="space-y-2 flex-1">
                      {family.people?.map((p: any) => {
                        const hasOrder = dinner.mode === 'MENU' ? p.order?.starter : (p.order?.cartaItems && p.order.cartaItems !== '[]');
                        return (
                          <div key={p.id} className="flex justify-between items-center p-3 bg-brand-ultra-light/40 rounded-xl group transition-all hover:bg-brand hover:text-white">
                            <span className="font-black uppercase text-[10px] block truncate leading-none">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <Link href={`/dinner/${code}/order/${p.id}`} className="p-1 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all text-white"><ExternalLink className="w-3 h-3" /></Link>
                              <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm ${hasOrder ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {hasOrder ? 'OK' : '...'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-brand/40 tracking-widest">{family.people?.length || 0} PERSONAS</span>
                      <Link href={`/dinner/${code}`} className="text-[10px] font-black uppercase text-brand flex items-center gap-1 hover:underline">
                        Invitado <ArrowLeft className="w-3 h-3 rotate-180" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand text-white">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Grupo</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Teléfono</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Comensales</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Estado</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFamilies.map((family: any) => {
                        const totalPeople = family.people?.length || 0;
                        const readyPeople = family.people?.filter((p: any) => dinner.mode === 'MENU' ? p.order?.starter : (p.order?.cartaItems && p.order.cartaItems !== '[]')).length || 0;
                        return (
                          <tr key={family.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-6 font-black uppercase tracking-tight text-sm">{family.name}</td>
                            <td className="p-6 font-mono text-[10px] font-bold text-slate-500">{family.phone || '---'}</td>
                            <td className="p-6">
                              <div className="flex flex-wrap gap-1">
                                {family.people?.map((p: any) => (
                                  <span key={p.id} className="inline-block px-2 py-1 bg-brand-ultra-light rounded-lg text-[9px] font-black uppercase">{p.name}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${readyPeople === totalPeople ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-100 text-amber-600'}`}>
                                {readyPeople}/{totalPeople} Listos
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditPhone(family)} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-brand hover:text-white transition-all"><Phone className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteFamily(family.id, family.name)} className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Edit Phone Modal ─────────────────────────── */}
        {editingFamily && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingFamily(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black uppercase tracking-tight text-brand mb-1">Editar Teléfono</h3>
              <p className="text-slate-500 text-sm mb-6">Modifica el teléfono de «{editingFamily.name}»</p>

              <input
                type="tel"
                className="w-full px-6 py-4 bg-brand-ultra-light rounded-2xl outline-none border-transparent focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand font-bold mb-6"
                value={newPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhone(e.target.value)}
              />

              <div className="flex gap-3">
                <button onClick={() => setEditingFamily(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">
                  Cancelar
                </button>
                <button onClick={saveNewPhone} className="flex-[2] py-4 bg-brand text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

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
