import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | Mesa Mía',
  description: '¿Has olvidado tu contraseña? Recupérala fácilmente con tu número de teléfono y el código de tu cena.',
};

export default function RecoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
