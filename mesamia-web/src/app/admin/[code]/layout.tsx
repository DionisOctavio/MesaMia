import { Metadata } from 'next';

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Panel Admin ${code.toUpperCase()} | Mesa Mía`,
    description: `Gestión y resumen de cocina para la cena ${code.toUpperCase()}.`,
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
