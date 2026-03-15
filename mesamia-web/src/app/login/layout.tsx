import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceso Organizadores | Mesa Mía',
  description: 'Inicia sesión para gestionar tus cenas, menús y grupos de invitados.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
