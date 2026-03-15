import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unirse a una Cena | Mesa Mía',
  description: 'Introduce el código de tu cena para elegir tu menú y unirte a tu grupo.',
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
