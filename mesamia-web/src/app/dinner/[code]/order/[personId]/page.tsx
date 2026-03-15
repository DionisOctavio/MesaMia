'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { Utensils, Send, ArrowLeft, Info, CheckCircle2, Search, ArrowUp } from 'lucide-react';
import Image from 'next/image';

const ALLERGENS = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'crustaceos', name: 'Crustáceos', icon: '🦀' },
  { id: 'huevos', name: 'Huevos', icon: '🥚' },
  { id: 'pescado', name: 'Pescado', icon: '🐟' },
  { id: 'cacahuetes', name: 'Cacahuetes', icon: '🥜' },
  { id: 'soja', name: 'Soja', icon: '🫘' },
  { id: 'lacteos', name: 'Lácteos', icon: '🥛' },
  { id: 'frutos-secos', name: 'Frutos Secos', icon: '🌰' },
  { id: 'apio', name: 'Apio', icon: '🌿' },
  { id: 'mostaza', name: 'Mostaza', icon: '🧴' },
  { id: 'sesamo', name: 'Sésamo', icon: '⚪' },
  { id: 'sulfitos', name: 'Sulfitos', icon: '🍷' },
  { id: 'moluscos', name: 'Moluscos', icon: '🐚' },
  { id: 'altramuces', name: 'Altramuces', icon: '🟡' },
];

import { toast } from 'sonner';

export default function OrderSelection() {
  const { code, personId } = useParams();
  const router = useRouter();
  const [dinner, setDinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const [order, setOrder] = useState({
    starter: '',
    main: '',
    dessert: '',
    drink: '',
    cartaItems: [] as { name: string, quantity: number }[]
  });

  useEffect(() => {
    Promise.all([
      api.get(`/dinners/${code}`),
      api.get(`/orders/${personId}`)
    ]).then(([dinnerData, orderData]) => {
      setDinner(dinnerData);
      if (orderData) {
        let parsedCarta = [];
        try {
          const parsed = JSON.parse(orderData.cartaItems || '[]');
          if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'string') {
              // Legacy support
              parsedCarta = parsed.map(n => ({ name: n, quantity: 1 }));
            } else {
              parsedCarta = parsed;
            }
          }
        } catch (e) { }

        setOrder({
          starter: orderData.starter || '',
          main: orderData.main || '',
          dessert: orderData.dessert || '',
          drink: orderData.drink || '',
          cartaItems: parsedCarta
        });
      }
    }).finally(() => setLoading(false));
  }, [code, personId]);

  const options = useMemo(() => {
    if (!dinner) return { starters: [], mains: [], desserts: [], drinks: [], cartaCategories: [] };
    if (dinner.mode === 'MENU') {
      return {
        starters: (dinner.starters || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        mains: (dinner.mains || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        desserts: (dinner.desserts || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        drinks: (dinner.drinks || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        cartaCategories: []
      };
    } else {
      try {
        const cats = JSON.parse(dinner.cartaProducts || '[]');
        return { starters: [], mains: [], desserts: [], drinks: [], cartaCategories: cats };
      } catch (e) {
        return { starters: [], mains: [], desserts: [], drinks: [], cartaCategories: [] };
      }
    }
  }, [dinner]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.patch('/orders', {
        personId,
        ...order,
        cartaItems: JSON.stringify(order.cartaItems)
      });
      toast.success('¡Pedido enviado!', { description: 'Tu selección ha sido registrada.' });
      router.push(`/dinner/${code}`);
    } catch {
      toast.error('Error enviando el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-brand text-white flex items-center justify-center font-black uppercase tracking-widest px-6 text-center">Cargando Menú...</div>;

  const updateCartaItemQuantity = (name: string, delta: number) => {
    setOrder((prev: any) => {
      const existing = prev.cartaItems.find((i: any) => i.name === name);
      let newItems = [...prev.cartaItems];
      if (existing) {
        newItems = newItems.map((i: any) => i.name === name ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter((i: any) => i.quantity > 0);
      } else if (delta > 0) {
        newItems.push({ name, quantity: delta });
      }
      return { ...prev, cartaItems: newItems };
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140; // Space for the sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-ultra-light py-8 px-4 font-sans text-brand text-left">
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8 flex flex-col items-center">
        <Image src="/logo-color.png" alt="Mesa Mía" width={140} height={38} style={{ height: 'auto' }} className="mb-4 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 leading-none text-center">{dinner.name}</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-4 sm:mb-6 text-center">{dinner.restaurant}</p>

        {dinner.mode === 'CARTA' && (
          <div className="w-full space-y-4 sticky top-4 z-30">
            {/* Search Bar */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar plato o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none font-bold text-sm transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-brand/5 text-brand flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Category Navigation */}
            {options.cartaCategories.length > 0 && !searchQuery && (
              <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-lg flex gap-2 overflow-x-auto no-scrollbar py-3 px-4">
                {options.cartaCategories.map((cat: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(`category-${idx}`)}
                    className="whitespace-nowrap px-4 py-2 bg-brand-ultra-light hover:bg-brand text-brand hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto space-y-8 sm:space-y-12 pb-32">
        {dinner.mode === 'MENU' ? (
          <>
            {[
              { label: 'Entrante', key: 'starter', items: options.starters },
              { label: 'Plato Principal', key: 'main', items: options.mains },
              { label: 'Postre', key: 'dessert', items: options.desserts },
              { label: 'Bebida', key: 'drink', items: options.drinks },
            ].map(section => (
              <div key={section.key} className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-brand/10 pb-2 ml-2">{section.label}</h3>
                <div className="grid gap-3">
                  {section.items.map((item: string) => (
                    <button key={item} onClick={() => setOrder({ ...order, [section.key]: item })} className={`p-6 rounded-[2rem] text-left transition-all border-2 flex justify-between items-center ${order[section.key as keyof typeof order] === item ? 'bg-brand text-white border-brand shadow-xl scale-[1.02]' : 'bg-white text-slate-600 border-slate-50 hover:border-brand/20'}`}>
                      <span className="font-bold text-sm md:text-base">{item}</span>
                      {order[section.key as keyof typeof order] === item && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="space-y-12">
            {options.cartaCategories.map((cat: any, idx: number) => {
              const filteredProducts = cat.products.filter((p: any) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredProducts.length === 0) return null;

              return (
                <div key={idx} id={`category-${idx}`} className="space-y-6 scroll-mt-48">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand border-b-2 border-brand/10 pb-2 ml-2 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-brand" /> {cat.name}
                  </h3>
                  <div className="grid gap-3">
                    {filteredProducts.map((item: any, pIdx: number) => {
                      const quantity = order.cartaItems.find((i: any) => i.name === item.name)?.quantity || 0;
                      return (
                        <div key={pIdx} className={`p-5 sm:p-6 rounded-[2rem] text-left transition-all border-2 flex flex-col gap-3 ${quantity > 0 ? 'bg-brand/5 border-brand/50 shadow-xl' : 'bg-white text-brand border-slate-50'}`}>
                          <div className="flex justify-between items-center w-full">
                            <span className={`${quantity > 0 ? 'font-black text-brand' : 'font-extrabold'} text-sm sm:text-base flex-1 pr-4`}>{item.name}</span>
                            <span className="font-black opacity-60 text-xs sm:text-sm whitespace-nowrap mr-4">{item.price}€</span>
                            <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                              <button onClick={(e) => { e.stopPropagation(); updateCartaItemQuantity(item.name, -1); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-full transition-colors">-</button>
                              <span className="w-4 text-center font-black text-brand text-sm sm:text-base">{quantity}</span>
                              <button onClick={(e) => { e.stopPropagation(); updateCartaItemQuantity(item.name, 1); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-brand text-white font-bold rounded-full transition-colors hover:bg-brand-light">+</button>
                            </div>
                          </div>
                          {item.allergens?.length > 0 && (
                            <div className="flex gap-1">
                              {item.allergens.map((allId: string) => (
                                <span key={allId} title={ALLERGENS.find(a => a.id === allId)?.name} className="w-6 h-6 flex items-center justify-center bg-brand-ultra-light/20 rounded-lg text-sm">
                                  {ALLERGENS.find(a => a.id === allId)?.icon}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {searchQuery && !options.cartaCategories.some((c: any) => c.products.some((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="py-20 text-center space-y-4">
                <div className="text-4xl">🔎</div>
                <p className="font-black uppercase tracking-widest text-slate-400 text-xs text-center px-10">No hemos encontrado ningún plato que coincida con "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-6 pb-6 sm:pb-8 pt-10 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto space-y-4">
          {/* Active Order Summary (floating) */}
          {order.cartaItems.length > 0 && (
            <div className="transform animate-in slide-in-from-bottom-4 transition-all">
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-2xl p-4 flex items-center justify-between">
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-brand/40 uppercase tracking-widest mb-1">Tu selección:</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                    {order.cartaItems.map((it, i) => (
                      <span key={i} className="whitespace-nowrap px-3 py-1.5 bg-brand/5 text-brand text-[10px] font-bold rounded-full border border-brand/10">
                        {it.quantity}x {it.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pl-4 ml-4 border-l border-slate-100 text-right">
                  <p className="text-[10px] font-black text-brand/40 uppercase tracking-widest mb-1">Total:</p>
                  <p className="font-black text-brand text-lg">
                    {order.cartaItems.reduce((acc: number, it: any) => {
                      const product = options.cartaCategories.flatMap((c: any) => c.products).find((p: any) => p.name === it.name);
                      return acc + (parseFloat(product?.price || '0') * it.quantity);
                    }, 0).toFixed(1)}€
                  </p>
                </div>
              </div>
            </div>
          )}

          <button disabled={submitting} onClick={handleSubmit} className="w-full py-5 sm:py-6 bg-brand text-white font-black rounded-[2rem] sm:rounded-[2.5rem] hover:bg-brand-light transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 text-base sm:text-lg uppercase tracking-widest leading-none">
            {submitting ? 'Enviando...' : <><Send className="w-5 h-5 sm:w-6 sm:h-6" /> Confirmar Selección</>}
          </button>
        </div>
      </div>
    </div>
  );
}
