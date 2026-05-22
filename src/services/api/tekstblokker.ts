import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as Tekstblokker from "../modules/tekstblokker";
import { Tekstblokk, TekstblokkOversikt, TekstblokkRequest, TekstblokkType } from "../modules/tekstblokker";

export const tekstblokkerKeys = {
  all: ["tekstblokker"] as const,
  liste: (type?: TekstblokkType) => ["tekstblokker", "liste", type ?? "alle"] as const,
  detalj: (id: number) => ["tekstblokker", "detalj", id] as const,
};

const DETALJ_STALE_TIME = 5 * 60_000;
const PREFETCH_BATCH_SIZE = 6;

/**
 * Prefetcher tekstblokk-detaljer i batches for å unngå at en handling
 * (åpne popover, "vis alle"-knapp) fyrer N parallelle requests samtidig.
 * Cache-treff hopper man over implisitt via TanStacks dedupering.
 */
export const prefetchTekstblokkerIBatches = async (queryClient: QueryClient, ids: number[]): Promise<void> => {
  for (let i = 0; i < ids.length; i += PREFETCH_BATCH_SIZE) {
    const batch = ids.slice(i, i + PREFETCH_BATCH_SIZE);
    await Promise.all(
      batch.map((id) =>
        queryClient.prefetchQuery({
          queryKey: tekstblokkerKeys.detalj(id),
          queryFn: () => Tekstblokker.hent(id),
          staleTime: DETALJ_STALE_TIME,
        }),
      ),
    );
  }
};

export const useTekstblokker = (type: TekstblokkType | undefined, enabled = true) =>
  useQuery<TekstblokkOversikt[]>({
    queryKey: tekstblokkerKeys.liste(type),
    queryFn: () => Tekstblokker.hentAlle(type),
    enabled,
  });

export const useTekstblokk = (id: number | null) =>
  useQuery<Tekstblokk>({
    queryKey: tekstblokkerKeys.detalj(id ?? 0),
    queryFn: () => Tekstblokker.hent(id as number),
    enabled: id !== null,
    staleTime: DETALJ_STALE_TIME,
  });

export const useOpprettTekstblokk = () => {
  const queryClient = useQueryClient();
  return useMutation<Tekstblokk, Error, TekstblokkRequest>({
    mutationFn: Tekstblokker.opprett,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tekstblokkerKeys.all });
    },
  });
};

export const useOppdaterTekstblokk = () => {
  const queryClient = useQueryClient();
  return useMutation<Tekstblokk, Error, { id: number; body: TekstblokkRequest }>({
    mutationFn: ({ id, body }) => Tekstblokker.oppdater(id, body),
    onSuccess: (oppdatert) => {
      queryClient.invalidateQueries({ queryKey: tekstblokkerKeys.all });
      queryClient.setQueryData(tekstblokkerKeys.detalj(oppdatert.id), oppdatert);
    },
  });
};

export const useSlettTekstblokk = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, number>({
    mutationFn: Tekstblokker.slett,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tekstblokkerKeys.all });
    },
  });
};
