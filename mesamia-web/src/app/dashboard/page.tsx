'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/infrastructure/util/api';
import { auth } from '@/infrastructure/util/auth';
import { showConfirm } from '@/components/Modal';
import { toast } from 'sonner';
import {
  Plus, LogOut, Users, ArrowRight, Trash2,
  CalendarDays, UtensilsCrossed, Clock, CheckCircle2, Share2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [dinners, setDinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/login'); return; }
    fetchDinners();
  }, []);

  const fetchDinners = () => {
    api.get('/dinners')
      .then(setDinners)
      .catch(() => toast.error('Error al cargar tus cenas'))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => { auth.logout(); router.push('/'); };

  const handleDelete = async (dinner: any) => {
    const ok = await showConfirm(
      'Eliminar cena',
      `¿Seguro que quieres eliminar "${dinner.name}"? Se borrarán todos los grupos, pedidos y datos asociados. Esta acción no se puede deshacer.`,
      { danger: true, confirmText: 'Eliminar cena' }
    );
    if (!ok) return;
    setDeletingId(dinner.code);
    try {
      await api.delete(`/dinners/${dinner.code}`);
      toast.success('Cena eliminada');
      fetchDinners();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la cena');
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = async (dinner: any) => {
    const url = `${window.location.origin}/dinner/${dinner.code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mesa Mía', text: `Únete a "${dinner.name}"`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado');
      }
    } catch {
      try { await navigator.clipboard.writeText(url); toast.success('Enlace copiado'); } catch {}
    }
  };

  // Classify dinners
  const now = new Date();
  const upcoming = dinners.filter(d => new Date(d.date) >= now);
  const past = dinners.filter(d => new Date(d.date) < now);

  const totalPeople = (d: any) =>
    (d.families || []).reduce((acc: number, f: any) => acc + (f.people?.length || 0), 0);

  const totalOrders = (d: any) =>
    (d.families || []).reduce((acc: number, f: any) =>
      acc + (f.people || []).filter((p: any) => p.order).length, 0);

  const DinnerCard = ({ dinner, isPast }: { dinner: any; isPast?: boolean }) => {
    const people = totalPeople(dinner);
    const orders = totalOrders(dinner);
    const pct = people > 0 ? Math.round((orders / people) * 100) : 0;
    const dateObj = new Date(dinner.date);
    const isDeleting = deletingId === dinner.code;

    return (
      <div className={`group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
        {/* Color strip */}
        <div className={`h-1.5 w-full ${isPast ? 'bg-slate-200' : 'bg-brand'}`} />

        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!isPast && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />}
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {isPast ? 'Pasada' : 'En curso'} · {dinner.mode}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight text-brand truncate">
                {dinner.name}
              </h3>
              <p className="text-slate-500 font-bold text-sm mt-1 truncate">{dinner.restaurant}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-mono font-black text-brand text-xs bg-brand-ultra-light px-3 py-1.5 rounded-xl select-all">
                {dinner.code}
              </div>
            </div>
          </div>

          {/* Date and stats */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
              <CalendarDays className="w-3.5 h-3.5" />
              {dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              {people} {people === 1 ? 'comensal' : 'comensales'}
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              {orders}/{people} pedidos
            </div>
          </div>

          {/* Progress bar */}
          {people > 0 && (
            <div className="mb-6">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-emerald-500' : 'bg-brand'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                {pct === 100 ? '✓ Todos han pedido' : `${pct}% han pedido`}
              </p>
            </div>
          )}

          {/* Families summary */}
          {(dinner.families || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {(dinner.families || []).slice(0, 4).map((f: any) => (
                <span key={f.id} className="text-[10px] font-black uppercase tracking-tight bg-brand-ultra-light text-brand-light px-3 py-1 rounded-full">
                  {f.name} ({f.people?.length || 0})
                </span>
              ))}
              {(dinner.families || []).length > 4 && (
                <span className="text-[10px] font-black text-slate-400 px-3 py-1">
                  +{dinner.families.length - 4} más
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href={`/admin/${dinner.code}`}
              className="flex-1 py-3.5 bg-brand text-white font-black rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-brand-light transition-all shadow-lg shadow-brand/10"
            >
              Panel <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleShare(dinner)}
              className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl transition-all flex-shrink-0"
              title="Compartir enlace"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(dinner)}
              disabled={isDeleting}
              className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all flex-shrink-0 disabled:opacity-50"
              title="Eliminar cena"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-ultra-light font-sans text-brand text-left">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Image src="/logo-color.png" alt="Mesa Mía" width={130} height={36} style={{ height: 'auto' }} />
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-brand text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-light transition-all shadow-lg shadow-brand/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Cena</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-2">Mis Cenas</h1>
          <p className="text-slate-500 text-base md:text-lg font-medium">Gestiona todos tus eventos gastronómicos.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full" />
          </div>
        ) : dinners.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 px-6">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-10 h-10 text-slate-200" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-3">Aún no tienes cenas</h2>
            <p className="text-slate-500 mb-8 font-medium">Crea tu primera cena y comparte el código con tus invitados.</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-3 px-10 py-5 bg-brand text-white font-black rounded-full hover:bg-brand-light transition-all shadow-2xl shadow-brand/20 uppercase tracking-widest text-sm"
            >
              <Plus className="w-5 h-5" /> Crear mi primera cena
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active / upcoming */}
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand">En curso o próximas</h2>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-black text-slate-500">{upcoming.length}</span>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {upcoming.map(d => <DinnerCard key={d.id} dinner={d} />)}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Cenas pasadas</h2>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-black text-slate-500">{past.length}</span>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {past.map(d => <DinnerCard key={d.id} dinner={d} isPast />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
