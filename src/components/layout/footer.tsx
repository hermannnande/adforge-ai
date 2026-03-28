import Link from 'next/link';
import { Logo } from './logo';

const FOOTER_LINKS = {
  product: {
    title: 'Produit',
    links: [
      { href: '/pricing', label: 'Tarifs' },
      { href: '/examples', label: 'Exemples' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  resources: {
    title: 'Ressources',
    links: [
      { href: '#', label: 'Documentation' },
      { href: '#', label: 'Blog' },
      { href: '#', label: 'Changelog' },
    ],
  },
  legal: {
    title: 'Légal',
    links: [
      { href: '#', label: 'Conditions d\'utilisation' },
      { href: '#', label: 'Politique de confidentialité' },
      { href: '#', label: 'Mentions légales' },
    ],
  },
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Créez des visuels marketing professionnels avec l&apos;intelligence artificielle.
            </p>
          </div>

          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border/50 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AdForge AI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
