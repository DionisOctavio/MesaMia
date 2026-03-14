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
    people: [{ name: '', phone: '' }]
  });

  const [registeredFamily, setRegisteredFamily] = useState<any>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  // Admin code flow
  const [adminDinner, setAdminDinner] = useState<any>(null);
  const [adminForm, setAdminForm] = useState({ phone: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminIsRegister, setAdminIsRegister] = useState(false);

  useEffect(() => {
    // Try normal code first, then admin code
    api.get(`/dinners/${code}`)
      .then(setDinner)
      .catch(() => {
        // Try as admin code
        api.get(`/dinners/admin/${code}`)
          .then(data => { setAdminDinner(data); })
          .catch(() => {}); // Not found at all
      })
      .finally(() => setLoading(false));

    // Recover saved group from this browser session
    const saved = localStorage.getItem(`dinner_${code}_family`);
    if (saved) {
      try {
        setRegisteredFamily(JSON.parse(saved));
        setStep(3);
      } catch (e) {}
    }
  }, [code]);

  const addPerson = () => {
    setFormData({ ...formData, people: [...formData.people, { name: '', phone: '' }] });
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

  const handlePersonClick = (person: any) => {
    setVerifyingPhone(person.id);
    setPhoneInput('');
  };

  const confirmPhone = async () => {
    const person = registeredFamily.people.find((p: any) => p.id === verifyingPhone);
    if (!person) return toast.error('Persona no encontrada.');
    if (person.phone === phoneInput) {
      router.push(`/dinner/${code}/order/${verifyingPhone}`);
    } else {
      toast.error('El número de teléfono no coincide.');
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
    <div className="min-h-screen bg-brand-ultra-light py-6 md:py-10 px-4 md:px-6 font-sans text-brand text-left">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-8 md:mb-10">
          <Image src="/logo-color.png" alt="Mesa Mía" width={160} height={45} style={{ height: 'auto' }} className="mx-auto mb-6" priority />
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 leading-none">{dinner.name}</h1>
          <p className="text-brand-light font-bold text-[10px] md:text-xs tracking-widest uppercase">{dinner.restaurant} • {new Date(dinner.date).toLocaleDateString()}</p>
        </header>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-brand/5 p-6 md:p-12 border border-slate-100">

          {/* STEP 1: Create or find group */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {showGroups ? (
                <>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Grupos Registrados</h2>
                    <p className="text-slate-500 text-sm md:text-base mt-2">Selecciona tu grupo para ver los integrantes.</p>
                  </div>
                  <div className="grid gap-3">
                    {(dinner.families || []).map((f: any) => (
                      <button
                        key={f.id}
                        onClick={() => { setRegisteredFamily(f); setStep(3); }}
                        className="w-full p-6 bg-brand-ultra-light hover:bg-brand hover:text-white rounded-2xl flex justify-between items-center transition-all font-bold uppercase tracking-tight"
                      >
                        {f.name}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ))}
                    {(!dinner.families || dinner.families.length === 0) && (
                      <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Aún no hay grupos registrados.</p>
                    )}
                  </div>
                  <button onClick={() => setShowGroups(false)} className="w-full py-4 text-brand-light font-black uppercase tracking-widest text-[10px]">
                    ← Volver atrás
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Paso 1 de 2</span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">¿Cómo se llama vuestro grupo?</h2>
                    <p className="text-slate-500 text-sm md:text-base mt-2">Introduce un nombre para vuestro grupo de hoy.</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Ej: Los García, Amigos Almería..."
                    className="w-full px-6 py-5 md:py-6 bg-brand-ultra-light border-transparent rounded-2xl md:rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all outline-none text-xl md:text-2xl font-bold"
                    value={formData.familyName}
                    onChange={e => setFormData({ ...formData, familyName: e.target.value })}
                  />

                  <div className="space-y-4">
                    <button
                      disabled={!formData.familyName}
                      onClick={() => setStep(2)}
                      className="w-full py-5 md:py-6 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-lg flex items-center justify-center gap-3 text-lg md:text-xl uppercase tracking-widest disabled:opacity-30"
                    >
                      Nuevo Grupo <ArrowRight className="w-6 h-6" />
                    </button>

                    <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                      <button
                        onClick={() => setShowGroups(true)}
                        className="w-full py-4 bg-white text-brand-light border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                      >
                        Ver grupos ya creados
                      </button>
                      <button
                        onClick={handleRecover}
                        className="w-full py-4 text-brand-light font-black text-[10px] uppercase tracking-widest hover:text-brand"
                      >
                        Recuperar mi grupo por teléfono
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: Add people */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Paso 2 de 2</span>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-sans">Datos de registro</h2>
                <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">Nombre y teléfono de cada invitado.</p>
              </div>

              <div className="space-y-4">
                {formData.people.map((person, i) => (
                  <div key={i} className="p-5 md:p-6 bg-brand-ultra-light rounded-[2rem] space-y-4 border border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-black italic">{i + 1}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-light">Persona {i + 1}</span>
                    </div>
                    <div className="grid gap-3">
                      <input
                        type="text"
                        placeholder="Nombre Completo"
                        className="w-full px-5 py-4 bg-white border border-slate-100 rounded-xl focus:border-brand outline-none text-base md:text-lg font-bold"
                        value={person.name}
                        onChange={e => updatePerson(i, 'name', e.target.value)}
                      />
                      <input
                        type="tel"
                        placeholder="Nº de Teléfono"
                        className="w-full px-5 py-4 bg-white border border-slate-100 rounded-xl focus:border-brand outline-none text-base md:text-lg font-mono font-bold"
                        value={person.phone}
                        onChange={e => updatePerson(i, 'phone', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addPerson}
                className="w-full py-4 text-brand-light font-black rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                + Añadir otra persona al grupo
              </button>

              <div className="flex flex-col gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full py-5 md:py-6 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-xl flex items-center justify-center gap-3 text-lg md:text-xl uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> Unirse a la cena
                </button>
                <button onClick={() => setStep(1)} className="text-brand-light font-bold uppercase tracking-widest text-[10px] hover:text-brand">Atrás</button>
              </div>
            </div>
          )}

          {/* STEP 3: Group members list / Phone verification */}
          {step === 3 && registeredFamily && (
            <div className="space-y-8 animate-in zoom-in duration-500">
              {verifyingPhone ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Verifica tu identidad</h2>
                    <p className="text-slate-500 text-sm mt-2">Por seguridad, introduce tu número de teléfono para editar tu selección.</p>
                  </div>
                  <input
                    type="tel"
                    placeholder="Tu teléfono..."
                    className="w-full px-6 py-5 bg-brand-ultra-light rounded-2xl outline-none border-2 border-transparent focus:border-brand font-mono font-bold text-center text-xl"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmPhone()}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setVerifyingPhone(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest">
                      Cancelar
                    </button>
                    <button onClick={confirmPhone} className="flex-[2] py-4 bg-brand text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">
                      Verificar y Entrar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">¡Bienvenidos!</h2>
                    <p className="text-slate-500 text-lg">Grupo: <strong>{registeredFamily.name}</strong></p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Pulsa tu nombre para elegir o editar tu menú:</p>
                    <div className="space-y-3">
                      {(registeredFamily.people || []).map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => handlePersonClick(p)}
                          className="w-full p-6 md:p-8 bg-brand-ultra-light hover:bg-brand hover:text-white rounded-[2rem] flex justify-between items-center transition-all group border border-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white text-brand flex items-center justify-center group-hover:bg-brand-light group-hover:text-white transition-colors">
                              <Utensils className="w-5 h-5" />
                            </div>
                            <span className="text-xl md:text-2xl font-black uppercase tracking-tight">{p.name}</span>
                          </div>
                          <ArrowRight className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex flex-col gap-3 items-center">
                    <button
                      onClick={handleChangeGroup}
                      className="text-brand-light font-black uppercase tracking-[0.2em] text-[9px] hover:text-red-500 transition-colors"
                    >
                      ← Salir del grupo / Cambiar grupo
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
