import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudioShell } from '@/components/studio/studio-shell';

export const metadata: Metadata = { title: 'Studio' };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/projects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Retour aux projets
        </Link>
      </div>

      <StudioShell
        projectId={projectId}
        projectName="Campagne Sneakers Pro"
        platform="Facebook Ads"
      />

      <Card>
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Créé le</p>
              <p className="text-sm">26 mars 2026</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Dernière modification</p>
              <p className="text-sm">il y a 2h</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Crédits utilisés</p>
              <p className="text-sm">4</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Format</p>
              <p className="text-sm">1080 × 1080 (1:1)</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Qualité</p>
              <p className="text-sm">Standard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">ID projet : {projectId}</p>
    </div>
  );
}
