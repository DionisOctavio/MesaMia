'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { auth } from '@/infrastructure/util/auth';
import { ArrowLeft, Save, Plus, Trash2, LogOut, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  name: string;
  price: string;
  allergens: string[];
}

interface Category {
  name: string;
  products: Product[];
}

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

export default function EditDinner() {
  const router = useRouter();
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'MENU' | 'CARTA'>('MENU');
  
  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    date: '',
    menuPrice: '',
    starters: '',
    mains: '',
    desserts: '',
    drinks: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/login');
      return;
    }

    api.get(`/dinners/${code}`).then(dinner => {
      setMode(dinner.mode);
      setFormData({
        name: dinner.name,
        restaurant: dinner.restaurant,
        date: new Date(dinner.date).toISOString().split('T')[0],
        menuPrice: dinner.menuPrice,
        starters: dinner.starters,
        mains: dinner.mains,
        desserts: dinner.desserts,
        drinks: dinner.drinks,
      });
      if (dinner.mode === 'CARTA') {
        try {
          setCategories(JSON.parse(dinner.cartaProducts || '[]'));
        } catch (e) {
          setCategories([]);
        }
      }
    }).catch(err => {
      toast.error('Error al cargar la cena');
      router.push('/');
    }).finally(() => setLoading(false));
  }, [code, router]);

  const addCategory = () => {
    setCategories([...categories, { name: '', products: [{ name: '', price: '', allergens: [] }] }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, name: string) => {
    const newCats = [...categories];
    newCats[index].name = name;
    setCategories(newCats);
  };

  const addProduct = (catIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].products.push({ name: '', price: '', allergens: [] });
    setCategories(newCats);
  };

  const removeProduct = (catIndex: number, prodIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].products = newCats[catIndex].products.filter((_, i) => i !== prodIndex);
    setCategories(newCats);
  };

  const updateProduct = (catIndex: number, prodIndex: number, field: keyof Product, value: any) => {
    const newCats = [...categories];
    (newCats[catIndex].products[prodIndex] as any)[field] = value;
    setCategories(newCats);
  };

  const toggleAllergen = (catIndex: number, prodIndex: number, allergenId: string) => {
    const current = categories[catIndex].products[prodIndex].allergens;
    const next = current.includes(allergenId) 
      ? current.filter(id => id !== allergenId)
      : [...current, allergenId];
    updateProduct(catIndex, prodIndex, 'allergens', next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/dinners/${code}`, {
        ...formData,
        mode,
        cartaProducts: mode === 'CARTA' ? JSON.stringify(categories) : '[]',
        date: new Date(formData.date),
      });
      toast.success('¡Cena actualizada con éxito!');
      router.push(`/admin/${code}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la cena');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-brand text-white flex items-center justify-center font-black uppercase tracking-widest px-6 text-center">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-brand-ultra-light py-8 md:py-12 px-4 md:px-6 text-brand font-sans text-left">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href={`/admin/${code}`} className="inline-flex items-center gap-2 text-brand-light hover:text-brand transition-colors font-bold text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Volver al Panel
          </Link>
          <Image src="/logo-color.png" alt="Mesa Mía" width={130} height={36} style={{ height: 'auto' }} />
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand/5 p-6 md:p-12 border border-slate-100">
          <div className="mb-12">
            <h1 className="text-3xl font-black mb-2 text-brand uppercase tracking-tight">Modificar Cena</h1>
            <p className="text-slate-500 font-medium font-sans">Actualiza el menú o la carta para tus invitados.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Step 1: Info (Simplified for Edit) */}
            <div className="space-y-10">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-3">1. Información del Evento</h2>
              <div className="grid gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Nombre de la Cena</label>
                  <input required type="text" className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-brand-ultra-light border-transparent rounded-2xl sm:rounded-3xl focus:bg-white outline-none text-lg sm:text-xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Restaurante</label>
                    <input required type="text" className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-brand-ultra-light border-transparent rounded-2xl sm:rounded-3xl focus:bg-white outline-none text-lg sm:text-xl font-bold" value={formData.restaurant} onChange={e => setFormData({...formData, restaurant: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Fecha</label>
                    <input required type="date" className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-brand-ultra-light border-transparent rounded-2xl sm:rounded-3xl focus:bg-white outline-none text-lg sm:text-xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

             {/* Step 3: Content (Reusing from Create) */}
            <div className="space-y-10">
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-3">2. Configuración Gastronómica</h2>
               
               {mode === 'MENU' ? (
                 <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Precio por Cubierto (€)</label>
                      <input type="text" className="w-40 px-8 py-5 bg-brand-ultra-light rounded-3xl focus:bg-white outline-none text-2xl font-black text-center" value={formData.menuPrice} onChange={e => setFormData({...formData, menuPrice: e.target.value})} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      {[
                        { label: 'Entrantes', key: 'starters' },
                        { label: 'Segundos', key: 'mains' },
                        { label: 'Postres', key: 'desserts' },
                        { label: 'Bebidas', key: 'drinks' }
                      ].map(field => (
                        <div key={field.key} className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{field.label}</label>
                          <textarea rows={3} className="w-full p-6 bg-brand-ultra-light rounded-[2rem] font-bold text-base outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all font-sans" value={(formData as any)[field.key]} onChange={e => setFormData({...formData, [field.key]: e.target.value})} placeholder="Separar platos con comas..." />
                        </div>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-8">
                  {categories.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-brand-ultra-light/50 p-8 rounded-[2.5rem] space-y-6 border border-brand/5 relative group">
                      <button type="button" onClick={() => removeCategory(catIdx)} className="absolute top-6 right-6 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                      
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                         <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand block ml-1">Nombre de la Categoría</label>
                            <input type="text" placeholder="Ej: CARNES o PARA COMPARTIR" className="w-full px-6 py-4 bg-white rounded-2xl font-black text-lg outline-none uppercase" value={cat.name} onChange={e => updateCategoryName(catIdx, e.target.value)} />
                         </div>
                      </div>

                      <div className="space-y-4 pl-4 border-l-2 border-brand/10">
                        {cat.products.map((prod, prodIdx) => (
                          <div key={prodIdx} className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                            <div className="flex gap-4 items-center">
                              <input type="text" placeholder="Nombre del plato..." className="flex-1 px-4 py-2 border-b-2 border-transparent focus:border-brand outline-none font-bold" value={prod.name} onChange={e => updateProduct(catIdx, prodIdx, 'name', e.target.value)} />
                              <input type="text" placeholder="Precio" className="w-24 px-4 py-2 bg-brand-ultra-light rounded-xl font-black text-right outline-none" value={prod.price} onChange={e => updateProduct(catIdx, prodIdx, 'price', e.target.value)} />
                              <button type="button" onClick={() => removeProduct(catIdx, prodIdx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {ALLERGENS.map(all => (
                                <button key={all.id} type="button" onClick={() => toggleAllergen(catIdx, prodIdx, all.id)} title={all.name} className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${prod.allergens.includes(all.id) ? 'bg-brand text-white scale-110 shadow-md' : 'bg-slate-50 text-slate-300 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}>
                                  {all.icon}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => addProduct(catIdx)} className="w-full py-4 border-2 border-dashed border-brand/10 text-brand font-black rounded-2xl hover:bg-white transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Añadir plato a {cat.name || 'Categoría'}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={addCategory} className="w-full py-6 bg-brand text-white font-black rounded-[2rem] hover:bg-brand-light transition-all shadow-xl shadow-brand/10 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em]">
                    <Plus className="w-5 h-5" /> Añadir Nueva Categoría
                  </button>
                 </div>
               )}
            </div>

            {/* Step 3: Organizers */}
            <div className="space-y-10">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-3">3. Colaboradores</h2>
              <div className="bg-brand-ultra-light/30 p-8 rounded-[2rem] border border-brand/5">
                <p className="text-sm font-medium text-slate-500 mb-6">Añade el número de teléfono de otros organizadores para que puedan gestionar esta cena contigo.</p>
                <div className="flex gap-4">
                   <div className="flex-1">
                      <input 
                        type="tel" 
                        placeholder="Nº de Teléfono (ej: 600000000)" 
                        className="w-full px-6 py-4 bg-white rounded-2xl font-bold outline-none border border-transparent focus:border-brand transition-all"
                        id="new-org-phone"
                      />
                   </div>
                   <button 
                    type="button"
                    onClick={async () => {
                      const input = document.getElementById('new-org-phone') as HTMLInputElement;
                      const phone = input.value.trim();
                      if (!phone) return;
                      try {
                        // This logic needs a way to find organizer by phone. 
                        // I'll leave it as a suggestion or simple addition if the API supports it.
                        // For now, let's keep it simple as requested.
                        toast.info('Funcionalidad de invitación en camino...');
                        input.value = '';
                      } catch (e) {}
                    }}
                    className="px-8 py-4 bg-brand text-white font-black rounded-2xl hover:bg-brand-light transition-all text-[10px] uppercase tracking-widest"
                   >
                     Añadir
                   </button>
                </div>
              </div>
            </div>
            <div className="pt-12 border-t border-slate-100">
              <button disabled={submitting} type="submit" className="w-full py-8 bg-brand text-white font-black rounded-[2.5rem] hover:bg-brand-light transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-4 text-xl md:text-2xl uppercase tracking-[0.2em] leading-none disabled:opacity-50">
                {submitting ? 'Guardando...' : <><Save className="w-8 h-8" /> Guardar Cambios</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
