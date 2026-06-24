import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { normalizeUserRole } from '../../lib/rbac';
import { getToken } from '../../services/auth';
import { getMeuPerfil } from '../../services/profileService';
import { Button } from '../ui/button';

const ACKNOWLEDGEMENT_PREFIX = 'siga-alerta-risco-ciente';

function getAcknowledgementKey() {
  const token = getToken() ?? '';
  let hash = 2166136261;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `${ACKNOWLEDGEMENT_PREFIX}:${(hash >>> 0).toString(36)}`;
}

export function AcademicRiskToast() {
  const navigate = useNavigate();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const profileQuery = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: getMeuPerfil,
  });
  const acknowledgementKey = getAcknowledgementKey();
  const acknowledged =
    dismissedKey === acknowledgementKey ||
    sessionStorage.getItem(acknowledgementKey) === 'true';
  const profile = profileQuery.data;
  const shouldShow =
    !profileQuery.isError &&
    normalizeUserRole(profile?.perfil) === 'ALUNO' &&
    profile?.emRisco === true &&
    !acknowledged;

  function dismiss() {
    sessionStorage.setItem(acknowledgementKey, 'true');
    setDismissedKey(acknowledgementKey);
  }

  if (!shouldShow) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      aria-labelledby="academic-risk-title"
      className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-orange-300/70 bg-card p-4 text-card-foreground shadow-[0_24px_70px_-24px_rgba(124,45,18,0.55)] dark:border-orange-500/30 sm:left-auto sm:right-5 sm:w-full sm:max-w-md sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-700 ring-1 ring-inset ring-orange-500/20 dark:text-orange-300">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="academic-risk-title"
            className="font-semibold text-foreground"
          >
            Alerta acadêmico
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Identificamos que você possui risco acadêmico em uma ou mais
            disciplinas. Acesse Meu Risco para acompanhar os detalhes e buscar
            apoio.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 -mt-2 h-9 w-9 shrink-0 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-700 dark:hover:text-orange-300"
          onClick={dismiss}
          aria-label="Fechar alerta acadêmico"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="sm" onClick={dismiss}>
          Estou ciente
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/meu-risco')}
        >
          Ver meu risco
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
