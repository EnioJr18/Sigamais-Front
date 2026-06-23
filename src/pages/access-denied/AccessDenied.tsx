import { ArrowLeft, ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <section className="grid flex-1 place-items-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldX className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-destructive">
            Acesso restrito
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Você não tem permissão para acessar esta página
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Esta área é reservada a outro perfil de usuário. Volte ao painel ou utilize as opções disponíveis no menu.
          </p>
          <Button className="mt-7" onClick={() => navigate('/dashboard', { replace: true })}>
            <ArrowLeft className="h-4 w-4" />
            Voltar ao dashboard
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default AccessDenied;
