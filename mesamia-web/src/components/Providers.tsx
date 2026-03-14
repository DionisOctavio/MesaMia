'use client';

import { useModal, Modal } from '@/components/Modal';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { modal } = useModal();
  return (
    <>
      <Toaster position="top-center" richColors />
      <Modal {...modal} />
      {children}
    </>
  );
}
