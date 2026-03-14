'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { auth } from '@/infrastructure/util/auth';
import { ArrowLeft, Save, Plus, Trash2, LogOut, ChevronDown, ChevronUp, Info } from 'lucide-react';
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

export default function CreateDinner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'MENU' | 'CARTA'>('MENU');
  
  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    date: '',
    menuPrice: '30',
    starters: 'Croquetas, Ensalada de la Casa, Jamón y Queso',
    mains: 'Cochinillo Asado, Bacalao al Horno, Arroz Meloso de Boletus',
    desserts: 'Tarta de Queso, Fruta del Tiempo, Flan Casero',
    drinks: 'Vino Tinto, Cerveza, Refresco, Agua',
  });

  const [categories, setCategories] = useState<Category[]>([
    { name: 'PARA ABRIR BOCA', products: [{ name: 'Torrezno de Ólvega', price: '4.50', allergens: ['gluten'] }] }
  ]);

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
    setLoading(true);
    try {
      await api.post('/dinners', {
        ...formData,
        mode,
        cartaProducts: mode === 'CARTA' ? JSON.stringify(categories) : '[]',
        date: new Date(formData.date),
      });
      const res = await api.get(`/dinners/join`); // This is not correct, I need the code from the response
      // Wait, the create response should have the code
    } catch (err: any) {
      // Re-doing the post to capture the result properly
    } finally {
      // Logic fix:
    }
  };

  // Fixed handleSubmit
  const handleSubmitFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/dinners', {
        ...formData,
        mode,
        cartaProducts: mode === 'CARTA' ? JSON.stringify(categories) : '[]',
        date: new Date(formData.date),
      });
      toast.success('¡Cena creada con éxito!');
      router.push(`/admin/${res.code}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la cena');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

  if (typeof window !== 'undefined' && !auth.isLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-brand-ultra-light py-8 md:py-12 px-4 md:px-6 text-brand font-sans text-left">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-light hover:text-brand transition-colors font-bold text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Mis Cenas
          </Link>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition-colors font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
            Cerrar Sesión <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand/5 p-6 md:p-12 border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-black mb-2 text-brand uppercase tracking-tight">Nueva Cena</h1>
              <p className="text-slate-500 font-medium">Define el festín y organiza el grupo.</p>
            </div>
            <Image src="/logo-color.png" alt="Mesa Mía" width={130} height={36} style={{ height: 'auto' }} />
          </div>

          <form onSubmit={handleSubmitFixed} className="space-y-16">
            {/* Step 1: Info */}
            <div className="space-y-10">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-3">1. Información del Evento</h2>
              <div className="grid gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Nombre de la Cena</label>
                  <input required type="text" placeholder="Ej: Cena de Empresa" className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-brand-ultra-light border-transparent rounded-2xl sm:rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all outline-none text-lg sm:text-xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Restaurante</label>
                    <input required type="text" placeholder="¿Dónde vamos?" className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-brand-ultra-light border-transparent rounded-2xl sm:rounded-3xl focus:bg-white outline-none text-lg sm:text-xl font-bold" value={formData.restaurant} onChange={e => setFormData({...formData, restaurant: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand ml-1 uppercase tracking-widest">Fecha</label>
                    <input required type="date" className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-brand-ultra-light border-transparent rounded-2xl sm:rounded-3xl focus:bg-white outline-none text-lg sm:text-xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Mode */}
            <div className="space-y-10">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-3">2. Modalidad de Pedido</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {['MENU', 'CARTA'].map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m as any)} className={`p-8 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden ${mode === m ? 'bg-brand text-white border-brand shadow-2xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-brand/20'}`}>
                    <span className="text-2xl font-black uppercase tracking-tight block mb-2">{m === 'MENU' ? 'Menú Cerrado' : 'Carta Gastronómica'}</span>
                    <span className="text-xs font-bold opacity-70 uppercase tracking-widest leading-relaxed">
                      {m === 'MENU' ? 'Varios platos a elegir por un precio fijo.' : 'Múltiples platos agrupados por categorías.'}
                    </span>
                    {mode === m && <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Content */}
            <div className="space-y-10 animate-in fade-in duration-700">
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-3">3. Configuración Gastronómica</h2>
               
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
                          <textarea rows={3} className="w-full p-6 bg-brand-ultra-light rounded-[2rem] font-bold text-base outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" value={(formData as any)[field.key]} onChange={e => setFormData({...formData, [field.key]: e.target.value})} placeholder="Separar platos con comas..." />
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

            <div className="pt-12 border-t border-slate-100">
              <button disabled={loading} type="submit" className="w-full py-6 sm:py-8 bg-brand text-white font-black rounded-[2rem] sm:rounded-[2.5rem] hover:bg-brand-light transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 text-lg sm:text-xl md:text-2xl uppercase tracking-[0.2em] leading-none">
                {loading ? 'Creando...' : <><Save className="w-6 h-6 sm:w-8 sm:h-8" /> Publicar Cena de Gala</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
