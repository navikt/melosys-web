import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import * as Tekstblokker from "../modules/tekstblokker";
import {
  gjelderKontekst,
  harAlleTags,
  harStatus,
  matcherSoek,
  Statusfilter,
  tellTagsMedValgte,
  Tekstblokk,
  TekstblokkOversikt,
  TekstblokkRequest,
  TekstblokkType,
  TekstblokkVersjon,
} from "../modules/tekstblokker";

export const tekstblokkerKeys = {
  all: ["tekstblokker"] as const,
  liste: (type?: TekstblokkType) => ["tekstblokker", "liste", type ?? "alle"] as const,
  detalj: (id: number) => ["tekstblokker", "detalj", id] as const,
  historikk: (id: number) => ["tekstblokker", "historikk", id] as const,
};

const LISTE_STALE_TIME = 5 * 60_000;
const DETALJ_STALE_TIME = 5 * 60_000;

export const useTekstblokker = (type: TekstblokkType | undefined, enabled = true) =>
  useQuery<TekstblokkOversikt[]>({
    queryKey: tekstblokkerKeys.liste(type),
    queryFn: () => Tekstblokker.hentAlle(type),
    enabled,
    staleTime: LISTE_STALE_TIME,
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

export const usePubliserTekstblokk = () => {
  const queryClient = useQueryClient();
  return useMutation<Tekstblokk, Error, number>({
    mutationFn: Tekstblokker.publiser,
    onSuccess: (publisert) => {
      queryClient.invalidateQueries({ queryKey: tekstblokkerKeys.all });
      queryClient.setQueryData(tekstblokkerKeys.detalj(publisert.id), publisert);
    },
  });
};

// Historikken hentes først når admin ber om den – den er stor og sjelden brukt.
export const useTekstblokkHistorikk = (id: number | null, enabled = true) =>
  useQuery<TekstblokkVersjon[]>({
    queryKey: tekstblokkerKeys.historikk(id ?? 0),
    queryFn: () => Tekstblokker.hentHistorikk(id as number),
    enabled: enabled && id !== null,
    staleTime: DETALJ_STALE_TIME,
  });

export const useSlettTekstblokk = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, number>({
    mutationFn: Tekstblokker.slett,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tekstblokkerKeys.all });
    },
  });
};

interface FiltrerteTekstblokker {
  tagAntall: Array<[string, number]>;
  synlige: TekstblokkOversikt[];
}

export const useFiltrerteTekstblokker = (
  blokker: TekstblokkOversikt[],
  soek: string,
  valgteTags: string[],
  sakstype?: string,
  behandlingstema?: string,
  statusfilter: Statusfilter = "ALLE",
): FiltrerteTekstblokker => {
  // Konteksten avgrenses først, slik at både søk og tag-telling gjelder det utvalget
  // saksbehandleren faktisk kan bruke i denne saken.
  const iKontekst = useMemo(
    () => blokker.filter((b) => gjelderKontekst(b, sakstype, behandlingstema) && harStatus(b, statusfilter)),
    [blokker, sakstype, behandlingstema, statusfilter],
  );
  const etterSoek = useMemo(() => iKontekst.filter((b) => matcherSoek(b, soek)), [iKontekst, soek]);
  const synlige = useMemo(() => etterSoek.filter((b) => harAlleTags(b, valgteTags)), [etterSoek, valgteTags]);
  // Tagene telles over det som faktisk er igjen, ikke over hele søketreffet. Med
  // AND-filtrering ville resten bare ført til tomme lister. Antallet blir dermed
  // "hvor mange treff får jeg hvis jeg legger til denne taggen også".
  const tagAntall = useMemo(() => tellTagsMedValgte(synlige, valgteTags), [synlige, valgteTags]);
  return { tagAntall, synlige };
};
