import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';

export const metadata: Metadata = { title: 'Connexion' };

export default function LoginPage() {
  return (
    <div className="flex justify-center">
      <SignIn
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
