import { Metadata } from 'next';

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Cena ${code.toUpperCase()} | Mesa Mía`,
    description: `Únete a la cena con código ${code.toUpperCase()} y elige tus platos.`,
  };
}

export default function DinnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
