import { useQuery } from "@tanstack/react-query";

import * as Placeholdere from "../modules/placeholdere";
import { PlaceholderBeskrivelse, PlaceholderVerdi } from "../modules/placeholdere";

export const placeholderKeys = {
  all: ["placeholdere"] as const,
  verdier: (behandlingId: number) => ["placeholdere", "verdier", behandlingId] as const,
  katalog: () => ["placeholdere", "katalog"] as const,
};

// Katalogen endres bare ved deploy, så den kan stå lenge uten refetch.
const KATALOG_STALE_TIME = 30 * 60_000;

export const usePlaceholderVerdier = (behandlingId: number | null, enabled = true) =>
  useQuery<PlaceholderVerdi[]>({
    queryKey: placeholderKeys.verdier(behandlingId ?? 0),
    queryFn: () => Placeholdere.hentVerdier(behandlingId as number).then((respons) => respons.verdier),
    enabled: enabled && behandlingId !== null,
    // Verdiene skal være ferske hver gang Send brev åpnes; cachen brukes kun som
    // mellomlager mens dialogen står åpen.
    staleTime: 0,
    refetchOnMount: "always",
  });

export const usePlaceholderKatalog = (enabled = true) =>
  useQuery<PlaceholderBeskrivelse[]>({
    queryKey: placeholderKeys.katalog(),
    queryFn: () => Placeholdere.hentKatalog().then((respons) => respons.placeholdere),
    enabled,
    staleTime: KATALOG_STALE_TIME,
  });
