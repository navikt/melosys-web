import { useQuery } from "@tanstack/react-query";
import { KTObject } from "@navikt/melosys-kodeverk";

import { hentBehandlingstemaer, hentSakstemaer, hentSakstyper } from "../modules/lovligekombinasjoner";

export const lovligeKombinasjonerKeys = {
  sakstyper: ["lovligekombinasjoner", "sakstyper"] as const,
  sakstemaer: (sakstype: string) => ["lovligekombinasjoner", "sakstemaer", sakstype] as const,
  behandlingstemaer: (sakstype: string, sakstema: string) =>
    ["lovligekombinasjoner", "behandlingstemaer", sakstype, sakstema] as const,
};

export const useLovligeSakstyper = () =>
  useQuery<KTObject[]>({
    queryKey: lovligeKombinasjonerKeys.sakstyper,
    queryFn: () => hentSakstyper(),
  });

export const useLovligeSakstemaer = (sakstype: string) =>
  useQuery<KTObject[]>({
    queryKey: lovligeKombinasjonerKeys.sakstemaer(sakstype),
    queryFn: () => hentSakstemaer(null, sakstype),
    enabled: !!sakstype,
  });

export const useLovligeBehandlingstemaer = (sakstype: string, sakstema: string) =>
  useQuery<KTObject[]>({
    queryKey: lovligeKombinasjonerKeys.behandlingstemaer(sakstype, sakstema),
    queryFn: () => hentBehandlingstemaer(null, sakstype, sakstema),
    enabled: !!sakstype && !!sakstema,
  });
