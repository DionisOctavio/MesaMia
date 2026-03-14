'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { Utensils, Send, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
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
        } catch(e) {}

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
        starters: dinner.starters.split(',').map((s: string) => s.trim()),
        mains: dinner.mains.split(',').map((s: string) => s.trim()),
        desserts: dinner.desserts.split(',').map((s: string) => s.trim()),
        drinks: dinner.drinks.split(',').map((s: string) => s.trim()),
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
    setOrder(prev => {
      const existing = prev.cartaItems.find(i => i.name === name);
      let newItems = [...prev.cartaItems];
      if (existing) {
        newItems = newItems.map(i => i.name === name ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
                           .filter(i => i.quantity > 0);
      } else if (delta > 0) {
        newItems.push({ name, quantity: delta });
      }
      return { ...prev, cartaItems: newItems };
    });
  };

  return (
    <div className="min-h-screen bg-brand-ultra-light py-8 px-4 font-sans text-brand text-left">
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <Image src="/logo-color.png" alt="Mesa Mía" width={140} height={38} style={{ height: 'auto' }} className="mb-4 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 leading-none">{dinner.name}</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-6 sm:mb-8">{dinner.restaurant}</p>
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
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-brand/5 pb-2 ml-2">{section.label}</h3>
                <div className="grid gap-3">
                  {section.items.map((item: string) => (
                    <button key={item} onClick={() => setOrder({...order, [section.key]: item})} className={`p-6 rounded-[2rem] text-left transition-all border-2 flex justify-between items-center ${order[section.key as keyof typeof order] === item ? 'bg-brand text-white border-brand shadow-xl scale-[1.02]' : 'bg-white text-slate-600 border-slate-50 hover:border-brand/20'}`}>
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
            {options.cartaCategories.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand border-b border-brand/10 pb-2 ml-2">{cat.name}</h3>
                <div className="grid gap-3">
                  {cat.products.map((item: any, pIdx: number) => {
                    const quantity = order.cartaItems.find(i => i.name === item.name)?.quantity || 0;
                    return (
                      <div key={pIdx} className={`p-6 rounded-[2rem] text-left transition-all border-2 flex flex-col gap-3 ${quantity > 0 ? 'bg-brand/5 border-brand/50 shadow-xl' : 'bg-white text-brand border-slate-50'}`}>
                        <div className="flex justify-between items-center w-full">
                          <span className={`${quantity > 0 ? 'font-black text-brand' : 'font-extrabold'} text-sm md:text-base flex-1 pr-4`}>{item.name}</span>
                          <span className="font-black opacity-60 text-xs md:text-sm whitespace-nowrap mr-4">{item.price}€</span>
                          <div className="flex items-center gap-3 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                            <button onClick={(e) => { e.stopPropagation(); updateCartaItemQuantity(item.name, -1); }} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-full transition-colors">-</button>
                            <span className="w-4 text-center font-black text-brand">{quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateCartaItemQuantity(item.name, 1); }} className="w-8 h-8 flex items-center justify-center bg-brand text-white font-bold rounded-full transition-colors hover:bg-brand-light">+</button>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {item.allergens?.map((allId: string) => (
                            <span key={allId} title={ALLERGENS.find(a => a.id === allId)?.name} className="w-6 h-6 flex items-center justify-center bg-brand-ultra-light/20 rounded-lg text-sm grayscale-0">
                              {ALLERGENS.find(a => a.id === allId)?.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-brand-ultra-light via-brand-ultra-light to-transparent pb-6 sm:pb-8">
        <div className="max-w-2xl mx-auto">
          <button disabled={submitting} onClick={handleSubmit} className="w-full py-5 sm:py-6 bg-brand text-white font-black rounded-[2rem] sm:rounded-[2.5rem] hover:bg-brand-light transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 text-base sm:text-lg uppercase tracking-widest leading-none">
            {submitting ? 'Enviando...' : <><Send className="w-5 h-5 sm:w-6 sm:h-6" /> Confirmar Selección</>}
          </button>
        </div>
      </div>
    </div>
  );
}
