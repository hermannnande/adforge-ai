import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

export const metadata: Metadata = { title: 'Créer un compte' };

export default function RegisterPage() {
  return (
    <div className="flex justify-center">
      <SignUp
        forceRedirectUrl="/app"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-none border border-border rounded-xl',
          },
        }}
      />
    </div>
  );
}
