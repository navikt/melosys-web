import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.less";
import { useCallback, useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import * as PeriodeAdapter from "../../../../../services/modules/aarsavregning/periodeApiAdapter";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { fagsakSelectors } from "../../../../../ducks/fagsaker";
import { FieldValue } from "react-hook-form";
import { FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import { OK } from "../../../../../ducks/aarsavregning/types";

import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../utils";
import {
  Avgiftspliktigperiode,
  AarsavregningsPeriodeType,
  MedlemskapsperiodeForAvgift,
  LovvalgsperiodeForAvgift,
  erMedlemskapsperiodeEllerLovvalgsperiode,
} from "../../../../../services/modules/types/periodeTyper";
import { AarsavregningUtenEllerDeltGrunnlagForm } from "./aarsavregningUtenEllerDeltGrunnlagForm";

const { DELVIS_INNVILGET, INNVILGET } = MKV.Koder.innvilgelsesResultat;

/**
 * FieldProps for avgiftspliktige perioder i årsavregning-skjema.
 * Utvider Avgiftspliktigperiode (discriminated union) med:
 * - redigerbar: true = kan endres (nye perioder), false = fra grunnlag (låst)
 * - feil: valideringsfeilmelding
 */
export type AvgiftspliktigperiodeFieldProps = Avgiftspliktigperiode & {
  redigerbar: boolean;
  feil?: string;
};

/** @deprecated Bruk AvgiftspliktigperiodeFieldProps */
export type MedlemskapsperiodeFieldProps = AvgiftspliktigperiodeFieldProps;

export const ULAGRET_MEDLEMSKAPSPERIODE_ID = -1;
export const ULAGRET_HELSEUTGIFTDEKKESPERIODE_ID = -2;

export const erUlagretPeriode = (id: number): boolean =>
  id === ULAGRET_MEDLEMSKAPSPERIODE_ID || id === ULAGRET_HELSEUTGIFTDEKKESPERIODE_ID;

export const DEFAULT_MEDLEMSKAPSPERIODE: AvgiftspliktigperiodeFieldProps = {
  id: ULAGRET_MEDLEMSKAPSPERIODE_ID,
  type: "MEDLEMSKAPSPERIODE",
  fomDato: "",
  tomDato: "",
  innvilgelsesResultat: "",
  medlemskapstype: "",
  trygdedekning: "",
  bestemmelse: "",
  redigerbar: true,
};

export const lagDefaultPeriode = (periodeType: AarsavregningsPeriodeType): AvgiftspliktigperiodeFieldProps => {
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE":
      return DEFAULT_MEDLEMSKAPSPERIODE;
    case "LOVVALGSPERIODE":
      return {
        id: -1,
        type: "LOVVALGSPERIODE",
        fomDato: "",
        tomDato: "",
        innvilgelsesResultat: "",
        medlemskapstype: "",
        trygdedekning: "",
        bestemmelse: "",
        redigerbar: true,
      };
    case "HELSEUTGIFTDEKKESPERIODE":
      return {
        id: ULAGRET_HELSEUTGIFTDEKKESPERIODE_ID,
        type: "HELSEUTGIFTDEKKESPERIODE",
        fomDato: "",
        tomDato: "",
        bostedLandkode: "",
        redigerbar: true,
      };
  }
};

export const mapTilFieldProps = (
  periode: Avgiftspliktigperiode,
  sistGjeldendeAvgiftspliktigePerioder?: Avgiftspliktigperiode[],
): AvgiftspliktigperiodeFieldProps => {
  const erFraGrunnlag = sistGjeldendeAvgiftspliktigePerioder?.some(
    (grunnlagPeriode) => grunnlagPeriode.fomDato === periode.fomDato && grunnlagPeriode.tomDato === periode.tomDato,
  );

  return {
    ...periode,
    fomDato: Utils.dato.formatterDatoTilNorsk(periode.fomDato),
    tomDato: Utils.dato.formatterDatoTilNorsk(periode.tomDato),
    feil: undefined,
    redigerbar: !erFraGrunnlag,
  };
};

/** @deprecated Bruk mapTilFieldProps */
export const mapTilMedlemskapsperiodeFieldProps = mapTilFieldProps;

export const mapPerioder = (
  perioder: Avgiftspliktigperiode[],
  sistGjeldendeAvgiftspliktigePerioder?: Avgiftspliktigperiode[],
): AvgiftspliktigperiodeFieldProps[] =>
  [...perioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b))
    .map((periode) => mapTilFieldProps(periode, sistGjeldendeAvgiftspliktigePerioder));

/** @deprecated Bruk mapPerioder */
export const mapMedlemskapsperioder = mapPerioder;

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
  harTrygdeavgiftFraAvgiftssystemet: boolean;
  harTidligereTrygdeavgiftsgrunnlag: boolean;
}

export interface MedlemskapTomFomDatoer {
  fom?: string;
  tom?: string;
}

export interface AarsavregningFormValuesProps extends FormValuesProps {
  avgiftspliktigperioder: MedlemskapsperiodeFieldProps[];
  trygdeavgiftFraAvgiftssystemet?: string;
  bestemmelse?: string;
  endeligAvgiftValg: string;
  manueltAvgiftBeloep?: string;
}

export function AarsavregningUtenEllerDeltGrunnlag({
  bekreft,
  oppdaterStatus,
  harTrygdeavgiftFraAvgiftssystemet,
  harTidligereTrygdeavgiftsgrunnlag,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [initiellData, setInitiellData] = useState<{
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    bestemmelser: string[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
    trygdedekninger?: string[];
    periodeType: AarsavregningsPeriodeType;
  }>({
    bestemmelser: [],
    periodeType: "MEDLEMSKAPSPERIODE",
    formDefaultValues: {
      bestemmelse: "",
      avgiftspliktigperioder: [DEFAULT_MEDLEMSKAPSPERIODE],
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
      trygdeavgiftFraAvgiftssystemet: "",
      endeligAvgiftValg: "",
      manueltAvgiftBeloep: "",
    },
  });

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaSelector);
  const dispatch = useDispatch();

  const erEøsPensjonist =
    sakstype?.kode === MKV.Koder.sakstyper.EU_EOS &&
    sakstema?.kode === MKV.Koder.sakstemaer.TRYGDEAVGIFT &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.PENSJONIST;

  const hentMappedPerioder = async (
    aarsavregningRes: AarsavregningResponse,
    periodeType: AarsavregningsPeriodeType,
  ): Promise<AvgiftspliktigperiodeFieldProps[]> => {
    const perioderRes = await PeriodeAdapter.hentPerioder(periodeType, behandlingID);

    const erInnvilget = (periode: Avgiftspliktigperiode) =>
      periode.type === "HELSEUTGIFTDEKKESPERIODE" ||
      (erMedlemskapsperiodeEllerLovvalgsperiode(periode) &&
        (periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET));

    const innvilgedePerioder = perioderRes.filter(erInnvilget);

    if (
      redigerbart &&
      harTrygdeavgiftFraAvgiftssystemet &&
      innvilgedePerioder.length === 0 &&
      aarsavregningRes?.sisteGjeldendeAvgiftspliktigperioder &&
      periodeType !== "HELSEUTGIFTDEKKESPERIODE"
    ) {
      const perioderFraGrunnlag = aarsavregningRes.sisteGjeldendeAvgiftspliktigperioder.filter(
        (periode) => periode.type === periodeType && erInnvilget(periode),
      );

      for (const periode of perioderFraGrunnlag) {
        const bestemmelse = erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.bestemmelse : "";
        await PeriodeAdapter.opprettPeriode(periodeType, behandlingID, periode, bestemmelse);
      }

      const oppdatertePerioder = await PeriodeAdapter.hentPerioder(periodeType, behandlingID);
      const oppdaterteInnvilgede = oppdatertePerioder.filter(erInnvilget);

      return mapPerioder(oppdaterteInnvilgede, aarsavregningRes.sisteGjeldendeAvgiftspliktigperioder);
    }

    return mapPerioder(innvilgedePerioder, aarsavregningRes.sisteGjeldendeAvgiftspliktigperioder);
  };

  const getBestemmelse = (perioder: AvgiftspliktigperiodeFieldProps[], periodeType: AarsavregningsPeriodeType) => {
    if (periodeType === "HELSEUTGIFTDEKKESPERIODE") {
      return "";
    }

    if (perioder.length > 0) {
      const perioderMedBestemmelse = perioder.filter(
        (p): p is (MedlemskapsperiodeForAvgift | LovvalgsperiodeForAvgift) & { redigerbar: boolean; feil?: string } =>
          erMedlemskapsperiodeEllerLovvalgsperiode(p),
      );
      if (perioderMedBestemmelse.length === 0) return "";

      const førsteBestemmelse = perioderMedBestemmelse[0].bestemmelse;
      const harSammeBestemmelse = perioderMedBestemmelse.every((periode) => periode.bestemmelse === førsteBestemmelse);
      if (harSammeBestemmelse) {
        return førsteBestemmelse;
      }
      throw new Error(
        "Kan ikke laste inn årsavregning fordi grunnlag eller behandlingsresultat har innvilgede perioder med ulik bestemmelse",
      );
    }
    return "";
  };

  const getTrygdedekninger = async (bestemmelse: string): Promise<string[]> => {
    if (bestemmelse) {
      try {
        return await Api.LovligeKombinasjoner.hentTrygdedekninger(bestemmelse);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Feil ved henting av trygdedekninger:", err);
      }
    }
    return [];
  };

  useEffect(() => {
    const lastInitiellData = async () => {
      if (!behandlingID) {
        setIsLoading(false);
        return;
      }

      try {
        const bestemmelsesRes = await Api.Ftrl.hentBestemmelser(behandlingstema);

        let aarsavregningRes: AarsavregningResponse | undefined;
        try {
          aarsavregningRes = await Api.Aarsavregning.hentAarsavregning(behandlingID);
          dispatch({ type: OK, data: aarsavregningRes });
        } catch (err: any) {
          if (err.response?.status !== 404) {
            throw err;
          }
        }

        const periodeType: AarsavregningsPeriodeType =
          aarsavregningRes?.sisteGjeldendeAvgiftspliktigperioder?.[0]?.type ??
          (erEøsPensjonist ? "HELSEUTGIFTDEKKESPERIODE" : "MEDLEMSKAPSPERIODE");

        const deltGrunnlagAarsavregningHarIkkeNyttGrunnlag =
          harTrygdeavgiftFraAvgiftssystemet && aarsavregningRes && !aarsavregningRes.nyttTrygdeavgiftsGrunnlag;

        const tidligerePeriode =
          aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
            ?.avgiftspliktigperioder?.[0];
        const bestemmelseFraTidligereAvgiftsgrunnlag =
          tidligerePeriode && erMedlemskapsperiodeEllerLovvalgsperiode(tidligerePeriode)
            ? tidligerePeriode.bestemmelse
            : undefined;
        const nyPeriode = aarsavregningRes?.sisteGjeldendeAvgiftspliktigperioder?.[0];
        const eventuellNyBestemmelse =
          nyPeriode && erMedlemskapsperiodeEllerLovvalgsperiode(nyPeriode) ? nyPeriode.bestemmelse : undefined;

        const skalHenteGrunnlagFraTidligereTrygdeavgiftsgrunnlag =
          deltGrunnlagAarsavregningHarIkkeNyttGrunnlag &&
          bestemmelseFraTidligereAvgiftsgrunnlag &&
          eventuellNyBestemmelse &&
          bestemmelseFraTidligereAvgiftsgrunnlag === eventuellNyBestemmelse;

        const mappedPerioder = await hentMappedPerioder(aarsavregningRes!, periodeType);
        const bestemmelse = getBestemmelse(mappedPerioder, periodeType);
        const trygdedekninger = await getTrygdedekninger(bestemmelse);

        const trygdeavgiftFraAvgiftssystemet =
          aarsavregningRes?.avregning?.trygdeavgiftFraAvgiftssystemet !== undefined &&
          aarsavregningRes?.avregning?.trygdeavgiftFraAvgiftssystemet !== null
            ? aarsavregningRes?.avregning?.trygdeavgiftFraAvgiftssystemet
            : "";
        const manueltAvgiftBeloep =
          aarsavregningRes?.avregning?.manueltAvgiftBeloep !== undefined &&
          aarsavregningRes?.avregning?.manueltAvgiftBeloep !== null
            ? aarsavregningRes?.avregning?.manueltAvgiftBeloep
            : "";

        const defaultPeriode = lagDefaultPeriode(periodeType);

        const formDefaultValues: FieldValue<AarsavregningFormValuesProps> = {
          avgiftspliktigperioder: mappedPerioder.length ? mappedPerioder : [defaultPeriode],
          bestemmelse,
          trygdeavgiftFraAvgiftssystemet,
          endeligAvgiftValg: aarsavregningRes?.endeligAvgiftValg || "",
          manueltAvgiftBeloep,
          skatteforholdsperioder: mapTilSkatteforholdProps(
            skalHenteGrunnlagFraTidligereTrygdeavgiftsgrunnlag
              ? aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
                  .skatteforholdsperioder
              : aarsavregningRes?.nyttTrygdeavgiftsGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
            mappedPerioder,
          ),
          inntektskilder: mapTilInntektskilderProps(
            skalHenteGrunnlagFraTidligereTrygdeavgiftsgrunnlag
              ? aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
              : aarsavregningRes?.nyttTrygdeavgiftsGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder,
            mappedPerioder,
          ),
        };

        setInitiellData({
          valgtÅr: aarsavregningRes?.aar,
          aarsavregningResponse: aarsavregningRes,
          bestemmelser: bestemmelsesRes.bestemmelser,
          formDefaultValues,
          trygdedekninger,
          periodeType,
        });

        setIsLoading(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Feil ved initiell lasting:", error);
        setIsLoading(false);
      }
    };

    lastInitiellData();
  }, [behandlingID, harTrygdeavgiftFraAvgiftssystemet]);

  const memoizedOppdaterStatus = useCallback((erGyldig: boolean) => {
    oppdaterStatus(erGyldig);
  }, []);

  if (isLoading) {
    return <div />;
  }

  return (
    <AarsavregningUtenEllerDeltGrunnlagForm
      initiellData={initiellData}
      bekreft={bekreft}
      oppdaterStatus={memoizedOppdaterStatus}
      harTrygdeavgiftFraAvgiftssystemet={harTrygdeavgiftFraAvgiftssystemet}
      harTidligereTrygdeavgiftsgrunnlag={harTidligereTrygdeavgiftsgrunnlag}
    />
  );
}
