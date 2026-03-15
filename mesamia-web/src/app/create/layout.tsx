import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Nueva Cena | Mesa Mía',
  description: 'Organiza tu próximo evento gastronómico en pocos clics. Configura el restaurante, la carta y los precios.',
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
