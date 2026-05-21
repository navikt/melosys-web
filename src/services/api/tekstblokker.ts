import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as Tekstblokker from "../modules/tekstblokker";
import { Tekstblokk, TekstblokkOversikt, TekstblokkRequest, TekstblokkType } from "../modules/tekstblokker";

const tekstblokkerKeys = {
  all: ["tekstblokker"] as const,
  liste: (type?: TekstblokkType) => ["tekstblokker", "liste", type ?? "alle"] as const,
  detalj: (id: number) => ["tekstblokker", "detalj", id] as const,
};

export const useTekstblokker = (type?: TekstblokkType) =>
  useQuery<TekstblokkOversikt[]>({
    queryKey: tekstblokkerKeys.liste(type),
    queryFn: () => Tekstblokker.hentAlle(type),
  });

export const useTekstblokk = (id: number | null) =>
  useQuery<Tekstblokk>({
    queryKey: tekstblokkerKeys.detalj(id ?? 0),
    queryFn: () => Tekstblokker.hent(id as number),
    enabled: id !== null,
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
