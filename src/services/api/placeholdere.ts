import { useQuery } from "@tanstack/react-query";

import * as Placeholdere from "../modules/placeholdere";

export const placeholderKeys = {
  all: ["placeholdere"] as const,
  verdier: (behandlingId: number) => ["placeholdere", "verdier", behandlingId] as const,
  katalog: () => ["placeholdere", "katalog"] as const,
};

// Katalogen endres bare ved deploy, så den kan stå lenge uten refetch.
const KATALOG_STALE_TIME = 30 * 60_000;

// Verdier og betingelser kommer fra samme endepunkt. Spørringen caches rå og plukkes fra
// hverandre med select, så de to hookene deler ett kall.
const verdiSporring = (behandlingId: number | null, enabled: boolean) => ({
  queryKey: placeholderKeys.verdier(behandlingId ?? 0),
  queryFn: () => Placeholdere.hentVerdier(behandlingId as number),
  enabled: enabled && behandlingId !== null,
  // Verdiene skal være ferske hver gang Send brev åpnes; cachen brukes kun som
  // mellomlager mens dialogen står åpen.
  staleTime: 0,
  refetchOnMount: "always" as const,
});

const katalogSporring = (enabled: boolean) => ({
  queryKey: placeholderKeys.katalog(),
  queryFn: Placeholdere.hentKatalog,
  enabled,
  staleTime: KATALOG_STALE_TIME,
});

// Stabile referanser: en select definert inline ville vært ny for hver render, og de som
// bygger et nytt array ville gitt konsumentene ny data hver gang – med remarkering av hele
// editoren som følge.
const TOMME_BETINGELSER: Placeholdere.Betingelse[] = [];
const TOMME_BETINGELSESBESKRIVELSER: Placeholdere.BetingelseBeskrivelse[] = [];

const velgVerdier = (respons: { verdier: Placeholdere.PlaceholderVerdi[] }) => respons.verdier;
// Eldre api uten feltet gir tom liste – da er alle betingelser ukjente og innholdet står urørt.
const velgBetingelser = (respons: { betingelser?: Placeholdere.Betingelse[] }) =>
  respons.betingelser ?? TOMME_BETINGELSER;
const velgPlaceholdere = (respons: { placeholdere: Placeholdere.PlaceholderBeskrivelse[] }) => respons.placeholdere;
const velgBetingelsesbeskrivelser = (respons: { betingelser?: Placeholdere.BetingelseBeskrivelse[] }) =>
  respons.betingelser ?? TOMME_BETINGELSESBESKRIVELSER;

export const usePlaceholderVerdier = (behandlingId: number | null, enabled = true) =>
  useQuery({ ...verdiSporring(behandlingId, enabled), select: velgVerdier });

export const useBetingelseVerdier = (behandlingId: number | null, enabled = true) =>
  useQuery({ ...verdiSporring(behandlingId, enabled), select: velgBetingelser });

export const usePlaceholderKatalog = (enabled = true) =>
  useQuery({ ...katalogSporring(enabled), select: velgPlaceholdere });

export const useBetingelseKatalog = (enabled = true) =>
  useQuery({ ...katalogSporring(enabled), select: velgBetingelsesbeskrivelser });
