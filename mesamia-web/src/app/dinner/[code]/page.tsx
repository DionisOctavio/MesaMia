'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { auth } from '@/infrastructure/util/auth';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Utensils, ShieldCheck, Key, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { showConfirm, showPrompt } from '@/components/Modal';

export default function JoinDinner() {
  const { code } = useParams();
  const router = useRouter();
  const [dinner, setDinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    familyName: '',
    phone: '',
    people: [{ name: '' }]
  });

  const [registeredFamily, setRegisteredFamily] = useState<any>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  // Admin code flow
  const [adminDinner, setAdminDinner] = useState<any>(null);
  const [adminForm, setAdminForm] = useState({ phone: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminIsRegister, setAdminIsRegister] = useState(false);

  // Refreshes family data from the API to get up-to-date prices/orders
  const refreshFamily = async (familyId: string) => {
    setRefreshingPrices(true);
    try {
      const res = await api.get(`/families/${familyId}`);
      if (res && res.id) {
        setRegisteredFamily(res);
        localStorage.setItem(`dinner_${code}_family`, JSON.stringify(res));
      }
    } catch (e) {
      // silently fail, keep local data
    } finally {
      setRefreshingPrices(false);
    }
  };

  useEffect(() => {
    // Try normal code first, then admin code
    api.get(`/dinners/${code}`)
      .then(setDinner)
      .catch(() => {
        // Try as admin code
        api.get(`/dinners/admin/${code}`)
          .then(data => { setAdminDinner(data); })
          .catch(() => { }); // Not found at all
      })
      .finally(() => setLoading(false));

    // Recover saved group from this browser session
    const saved = localStorage.getItem(`dinner_${code}_family`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRegisteredFamily(parsed);
        setStep(3);
        // Always refresh from API to get latest order prices
        if (parsed?.id) {
          refreshFamily(parsed.id);
        }
      } catch (e) { }
    }
  }, [code]);

  const addPerson = () => {
    setFormData({ ...formData, people: [...formData.people, { name: '' }] });
  };

  const updatePerson = (index: number, field: string, value: string) => {
    const newPeople = [...formData.people];
    (newPeople[index] as any)[field] = value;
    setFormData({ ...formData, people: newPeople });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/dinners/join', {
        dinnerId: dinner.id,
        familyName: formData.familyName,
        phone: formData.phone,
        people: formData.people
      });
      setRegisteredFamily(res);
      localStorage.setItem(`dinner_${code}_family`, JSON.stringify(res));
      setStep(3);
      toast.success('¡Grupo registrado!');
    } catch (err: any) {
      toast.error(err.message || 'Error al unirse. Revisa el teléfono (no puede repetirse).');
    }
  };

  const handlePersonClickAndRefresh = async (person: any) => {
    // Refresh prices when user comes back and clicks a person
    if (registeredFamily?.id) {
      await refreshFamily(registeredFamily.id);
    }
    setVerifyingPhone(person.id);
    setPhoneInput('');
  };

  const handlePersonClick = (person: any) => {
    handlePersonClickAndRefresh(person);
  };

  const confirmPhone = async () => {
    const cleanRegistered = (registeredFamily.phone || '').replace(/\s+/g, '');
    const cleanInput = phoneInput.replace(/\s+/g, '');
    if (cleanRegistered === cleanInput) {
      router.push(`/dinner/${code}/order/${verifyingPhone}`);
    } else {
      toast.error('El número de teléfono del grupo no coincide.');
    }
  };

  const handleRecover = async () => {
    const phone = await showPrompt('Recuperar grupo', 'Ej: 612345678', 'Introduce tu número de teléfono para recuperar tu grupo.');
    if (!phone) return;
    try {
      const res = await api.get(`/families/recover?phone=${encodeURIComponent(phone)}`);
      setRegisteredFamily(res.family);
      localStorage.setItem(`dinner_${code}_family`, JSON.stringify(res.family));
      setStep(3);
      toast.success('¡Grupo recuperado!');
    } catch {
      toast.error('No se ha encontrado ningún grupo con ese teléfono.');
    }
  };

  const handleChangeGroup = async () => {
    const ok = await showConfirm('Salir del grupo', '¿Seguro que quieres salir de este grupo actual? Podrás unirte a otro o crear uno nuevo.', { danger: true, confirmText: 'Salir' });
    if (ok) {
      localStorage.removeItem(`dinner_${code}_family`);
      setRegisteredFamily(null);
      setVerifyingPhone(null);
      setStep(1);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      if (adminIsRegister) {
        await api.post('/auth/signup', adminForm);
        toast.success('¡Cuenta creada! Ahora inicia sesión.');
        setAdminIsRegister(false);
      } else {
        const res = await api.post('/auth/login', adminForm);
        auth.setToken(res.accessToken);
        auth.setOrganizerId(res.organizerId);
        // Join as co-organizer
        await api.post(`/dinners/${adminDinner.code}/add-organizer`, {});
        toast.success('¡Añadido como co-organizador!');
        router.push(`/admin/${adminDinner.code}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación');
    } finally {
      setAdminLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-brand text-white flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
    </div>
  );

  // ── ADMIN CODE FLOW ──────────────────────────────────────
  if (adminDinner) return (
    <div className="min-h-screen bg-brand flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-brand text-center">
          <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Acceso Organizador</h1>
          <p className="text-slate-500 text-sm mb-2">Has introducido un <strong>código de colaborador</strong>.</p>
          <p className="text-brand-light font-black text-[10px] uppercase tracking-widest mb-8">
            {adminDinner.name} · {adminDinner.restaurant}
          </p>

          <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input required type="tel" placeholder="Tu teléfono"
                  className="w-full pl-12 pr-5 py-4 bg-brand-ultra-light rounded-2xl outline-none font-bold focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                  value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input required type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-brand-ultra-light rounded-2xl outline-none font-bold focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                  value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} />
              </div>
            </div>

            <button disabled={adminLoading} type="submit"
              className="w-full py-5 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-xl uppercase tracking-widest text-sm disabled:opacity-50 mt-2">
              {adminLoading ? 'Cargando...' : adminIsRegister ? 'Crear cuenta y entrar' : 'Iniciar sesión y unirme'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button onClick={() => setAdminIsRegister(!adminIsRegister)}
              className="text-brand-light font-black uppercase tracking-widest text-[10px] hover:text-brand transition-colors">
              {adminIsRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!dinner) return (
    <div className="min-h-screen flex items-center justify-center font-bold px-6 text-center">
      No se ha encontrado la cena solicitada.
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 md:px-6 font-sans text-brand text-left">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-6 md:mb-10">
          <Image src="/logo-color.png" alt="Mesa Mía" width={140} height={40} style={{ height: 'auto' }} className="mx-auto mb-6" priority />
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3 leading-tight">{dinner.name}</h1>
          <div className="bg-brand text-white inline-block px-5 py-2 rounded-2xl shadow-lg">
            <p className="font-black text-[10px] md:text-xs tracking-[0.2em] uppercase">{dinner.restaurant} • {new Date(dinner.date).toLocaleDateString()}</p>
          </div>
        </header>
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand/5 p-8 md:p-14 border border-slate-100">

          {/* PASO 1: UNIRSE O CREAR GRUPO */}
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {showGroups ? (
                <>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Grupos ya unidos</h2>
                    <p className="text-slate-600 text-base md:text-lg font-bold mt-2">Busca el tuyo en la lista:</p>
                  </div>
                  <div className="grid gap-4">
                    {(dinner.families || []).map((f: any) => (
                      <button
                        key={f.id}
                        onClick={() => { setRegisteredFamily(f); setStep(3); }}
                        className="w-full p-6 md:p-8 bg-slate-50 hover:bg-brand hover:text-white rounded-3xl flex justify-between items-center transition-all border-2 border-slate-100 shadow-sm"
                      >
                        <span className="text-xl md:text-2xl font-black uppercase tracking-tight">{f.name}</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ))}
                    {(!dinner.families || dinner.families.length === 0) && (
                      <p className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Aún no ha entrado nadie.</p>
                    )}
                  </div>
                  <button onClick={() => setShowGroups(false)} className="w-full py-6 text-brand font-black uppercase tracking-widest text-xs bg-slate-100 rounded-2xl mt-4">
                    ← Volver atrás
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-black uppercase tracking-widest text-brand/30 block mb-2">Paso 1 de 2</span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">¿Quiénes sois?</h2>
                    <p className="text-slate-600 text-xl font-bold">Uníos con un nombre de grupo.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Escribid aquí vuestro nombre:</label>
                    <input
                      type="text"
                      placeholder="Ej: Familia García"
                      className="w-full px-8 py-7 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-brand/10 focus:border-brand transition-all outline-none text-2xl md:text-3xl font-black shadow-inner"
                      value={formData.familyName}
                      onChange={e => setFormData({ ...formData, familyName: e.target.value })}
                    />
                    <p className="text-xs font-bold text-slate-400 italic">Este nombre aparecerá en la pantalla principal para el camarero.</p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <button
                      disabled={!formData.familyName}
                      onClick={() => setStep(2)}
                      className="w-full py-7 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-xl flex items-center justify-center gap-4 text-xl uppercase tracking-widest disabled:opacity-20"
                    >
                      Siguiente Paso <ArrowRight className="w-8 h-8" />
                    </button>

                    <div className="pt-10 flex flex-col gap-4">
                      <button
                        onClick={() => setShowGroups(true)}
                        className="w-full py-6 bg-slate-50 text-brand border-2 border-slate-200 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                      >
                        Ya estamos en la lista →
                      </button>
                      <button
                        onClick={handleRecover}
                        className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-brand underline underline-offset-8 decoration-brand/20"
                      >
                        Recuperar mi grupo por teléfono
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 2: AÑADIR PERSONAS */}
          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-brand/30 block mb-2">Paso 2 de 2</span>
                <h2 className="text-4xl font-black uppercase tracking-tight">Casi listo...</h2>
                <div className="space-y-3 pt-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Teléfono o móvil del grupo (Solo uno):</label>
                  <input
                    type="tel"
                    placeholder="Ej: 612 345 678"
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-brand/10 focus:border-brand transition-all outline-none text-2xl font-black font-mono shadow-inner"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <p className="text-xs font-bold text-slate-400">Servirá para que solo vosotros podáis editar vuestro pedido.</p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">¿Quiénes venís a cenar?</label>
                <div className="space-y-4">
                  {formData.people.map((person, i) => (
                    <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6 border-2 border-slate-100 shadow-inner">
                      <div className="flex items-center gap-4">
                        <span className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-xl font-black italic shadow-lg">{i + 1}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-brand">Nombre de la Persona {i + 1}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Escribe el nombre aquí..."
                        className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand outline-none text-2xl font-black shadow-sm"
                        value={person.name}
                        onChange={e => updatePerson(i, 'name', e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={addPerson}
                  className="w-full py-6 text-brand font-black rounded-3xl border-4 border-dashed border-slate-200 hover:border-brand hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                >
                  + Añadir otra persona
                </button>
              </div>

              <div className="flex flex-col gap-6 pt-6">
                <button
                  onClick={handleSubmit}
                  className="w-full py-8 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-2xl flex items-center justify-center gap-4 text-2xl uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-10 h-10" /> ¡Entrar a la cena!
                </button>
                <button onClick={() => setStep(1)} className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-brand transition-colors text-center">
                  ← Volver al paso anterior
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: LISTA PERSONAS / VALIDACIÓN */}
          {step === 3 && registeredFamily && (
            <div className="space-y-12 animate-in zoom-in-95 duration-500">
              {verifyingPhone ? (
                <div className="space-y-8 py-4">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Seguridad</h2>
                    <p className="text-slate-600 font-bold text-base md:text-lg">Introduce el teléfono del grupo <strong>{registeredFamily.name}</strong> para entrar.</p>
                    <div className="bg-slate-100 py-3 px-6 rounded-2xl inline-block border-2 border-slate-200 shadow-inner">
                      <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">
                        {registeredFamily.phone
                          ? `Pista: Termina en ...${registeredFamily.phone.replace(/\s+/g, '').slice(-3)}`
                          : 'Escribe el teléfono que usaste al registrarte'}
                      </p>
                    </div>
                  </div>

                  <input
                    type="tel"
                    placeholder="Tu móvil..."
                    autoFocus
                    className="w-full px-8 py-6 md:py-8 bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] outline-none focus:border-brand font-mono font-black text-center text-3xl md:text-4xl shadow-2xl"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmPhone()}
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setVerifyingPhone(null)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl uppercase text-xs tracking-widest shadow-sm">
                      Atrás
                    </button>
                    <button onClick={confirmPhone} className="flex-[2] py-6 bg-brand text-white font-black rounded-3xl shadow-xl uppercase text-xs tracking-widest hover:bg-brand-light transition-all">
                      Confirmar y Entrar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 animate-bounce">
                      <CheckCircle2 className="w-14 h-14" />
                    </div>
                    <h2 className="text-5xl font-black uppercase tracking-tight mb-3">¡Oído Cocina!</h2>
                    <p className="text-slate-500 text-xl">Bienvenidos, grupo <strong>{registeredFamily.name}</strong></p>

                    <div className="mt-8 p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block mb-2 relative">Total de vuestra mesa</span>
                      {refreshingPrices ? (
                        <span className="text-2xl font-black text-slate-300 relative animate-pulse">Calculando...</span>
                      ) : (
                        <span className="text-5xl font-black text-brand relative">
                          {dinner.mode === 'MENU'
                            ? (parseFloat((dinner.menuPrice || '0').toString().replace(',', '.')) * (registeredFamily.people || []).length).toFixed(2)
                            : (() => {
                              let total = 0;
                              try {
                                const products = JSON.parse(dinner.cartaProducts || '[]');
                                const allProducts = products.flatMap((p: any) => p.products);
                                (registeredFamily.people || []).forEach((p: any) => {
                                  const rawItems = p.order?.cartaItems;
                                  if (!rawItems || rawItems === '[]') return;
                                  const items = JSON.parse(rawItems);
                                  items.forEach((item: any) => {
                                    const itemName = typeof item === 'string' ? item : item.name;
                                    const itemQty = typeof item === 'string' ? 1 : (item.quantity || 1);
                                    const prod = allProducts.find((ap: any) => ap.name === itemName);
                                    if (prod) total += (parseFloat((prod.price || '0').toString().replace(',', '.')) * itemQty);
                                  });
                                });
                              } catch (e) { }
                              return total.toFixed(2);
                            })()
                          }€
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-600 text-center">Pulsa en un nombre para pedir:</p>
                    <div className="grid gap-5">
                      {(registeredFamily.people || []).map((p: any) => {
                        let personTotal = '0.00';
                        let hasOrder = false;
                        if (dinner.mode === 'MENU') {
                          personTotal = parseFloat((dinner.menuPrice || '0').toString().replace(',', '.')).toFixed(2);
                          hasOrder = !!(p.order?.starter || p.order?.main);
                        } else {
                          try {
                            const products = JSON.parse(dinner.cartaProducts || '[]');
                            const allProducts = products.flatMap((cat: any) => cat.products);
                            const rawItems = p.order?.cartaItems;
                            if (rawItems && rawItems !== '[]') {
                              const items = JSON.parse(rawItems);
                              let t = 0;
                              items.forEach((item: any) => {
                                const itemName = typeof item === 'string' ? item : item.name;
                                const itemQty = typeof item === 'string' ? 1 : (item.quantity || 1);
                                const prod = allProducts.find((ap: any) => ap.name === itemName);
                                if (prod) t += (parseFloat((prod.price || '0').toString().replace(',', '.')) * itemQty);
                              });
                              personTotal = t.toFixed(2);
                              hasOrder = items.length > 0;
                            }
                          } catch (e) { }
                        }

                        return (
                          <button
                            key={p.id}
                            onClick={() => handlePersonClick(p)}
                            className={`w-full p-8 md:p-10 hover:bg-brand hover:text-white rounded-[2.5rem] flex justify-between items-center transition-all group border-2 shadow-sm ${hasOrder
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-slate-50 border-slate-100'
                              }`}
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-white text-brand flex items-center justify-center group-hover:bg-brand-light group-hover:text-white transition-all shadow-md group-hover:rotate-6">
                                <Utensils className="w-7 h-7" />
                              </div>
                              <div className="text-left">
                                <span className="text-2xl md:text-4xl font-black uppercase tracking-tight block leading-none mb-1">{p.name}</span>
                                <span className="text-xs font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest">
                                  {refreshingPrices ? '...' : (hasOrder ? `${personTotal}€` : 'Sin pedido aún')}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-3 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-12 border-t border-slate-100 flex flex-col items-center">
                    <button
                      onClick={handleChangeGroup}
                      className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs hover:text-red-500 transition-colors py-4 px-10 border-2 border-slate-100 rounded-full"
                    >
                      ← Salir de este grupo
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
