import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.less";
import { useCallback, useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { FieldValue } from "react-hook-form";
import { FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import { OK } from "../../../../../ducks/aarsavregning/types";

import { medlemskapsperioderTypes } from "../../../../../ducks/medlemskapsperioder";
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../utils";
import {
  AvgiftspliktigPeriode,
  OppdaterMedlemskapsperiode,
} from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { AarsavregningUtenEllerDeltGrunnlagForm } from "./aarsavregningUtenEllerDeltGrunnlagForm";

const { DELVIS_INNVILGET, INNVILGET } = MKV.Koder.innvilgelsesResultat;

export const ULAGRET_MEDLEMSKAPSPERIODE_ID = -1;

export const DEFAULT_MEDLEMSKAPSPERIODE = {
  id: ULAGRET_MEDLEMSKAPSPERIODE_ID,
  fomDato: "",
  tomDato: "",
  innvilgelsesResultat: "",
  medlemskapstype: "",
  trygdedekning: "",
  bestemmelse: "",
  redigerbar: true,
};

const mapTilMedlemskapsperiodeFieldProps = (
  medlemskapsperiode: any,
  tidligereGrunnlag?: Api.Aarsavregning.Trygdeavgiftsgrunnlag,
) => {
  const grunnlagsperioder = tidligereGrunnlag?.avgiftspliktigPerioder;

  const medlemskapsperiodeErFraGrunnlag = grunnlagsperioder?.some(
    (periode) => periode.periodeFra === medlemskapsperiode.fomDato && periode.periodeTil === medlemskapsperiode.tomDato,
  );

  return {
    ...medlemskapsperiode,
    fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
    tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
    feil: undefined,
    redigerbar: !medlemskapsperiodeErFraGrunnlag,
  };
};

const mapMedlemskapsperioder = (perioder: any[], tidligereGrunnlag?: Api.Aarsavregning.Trygdeavgiftsgrunnlag) =>
  [...perioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b))
    .map((periode) => mapTilMedlemskapsperiodeFieldProps(periode, tidligereGrunnlag));

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
  harTrygdeavgiftFraAvgiftssystemet: boolean;
  harGrunnlag: boolean;
}

export interface MedlemskapTomFomDatoer {
  fom?: string;
  tom?: string;
}

export interface AarsavregningFormValuesProps extends FormValuesProps {
  trygdeavgiftFraAvgiftssystemet?: number | string;
  bestemmelse?: string;
  endeligAvgiftValg: string;
  manueltAvgiftBeloep?: number | string;
}

export function AarsavregningUtenEllerDeltGrunnlag({
  bekreft,
  oppdaterStatus,
  harTrygdeavgiftFraAvgiftssystemet,
  harGrunnlag,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [initiellData, setInitiellData] = useState<{
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    bestemmelser: string[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
    trygdedekninger?: string[];
  }>({
    bestemmelser: [],
    formDefaultValues: {
      bestemmelse: "",
      medlemskapsperioder: [DEFAULT_MEDLEMSKAPSPERIODE],
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
  const dispatch = useDispatch();

  const opprettMedlemskapsperiode = async (medlemskapsperiode: AvgiftspliktigPeriode) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.periodeFra, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.periodeTil, "") as string,
      trygdedekning: medlemskapsperiode.dekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const response: any = await Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(
      behandlingID,
      periodeRequest,
    );

    return response.type !== medlemskapsperioderTypes.FEILET;
  };

  const getMappedMedlemskapsperioder = async (
    aarsavregningRes: AarsavregningResponse,
  ): Promise<AvgiftspliktigPeriode[]> => {
    const medlemskapsperioderRes =
      await Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID);

    const innvilgedeMedlemskapsperioder = medlemskapsperioderRes.filter(
      (periode: AvgiftspliktigPeriode) =>
        periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
    );

    if (
      redigerbart &&
      harTrygdeavgiftFraAvgiftssystemet &&
      innvilgedeMedlemskapsperioder.length === 0 &&
      aarsavregningRes?.sisteGjeldendeMedlemskapsperioder
    ) {
      // Initiell innlasting for delt grunnlag
      const medlemskapsperioderFraGrunnlag = aarsavregningRes.sisteGjeldendeMedlemskapsperioder;
      const innvilgedeMedlemskapsperioderFraGrunnlag = medlemskapsperioderFraGrunnlag.filter(
        (periode) => periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
      );

      for (const periode of innvilgedeMedlemskapsperioderFraGrunnlag) {
        await opprettMedlemskapsperiode(periode);
      }

      // Henter medlemskapsperioder fra behandlingsresultat
      const oppdaterteMedlemskapsperioder =
        await Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID);

      const oppdaterteInnvilgedeMedlemskapsperioder = oppdaterteMedlemskapsperioder.filter(
        (periode: AvgiftspliktigPeriode) =>
          periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
      );

      return mapMedlemskapsperioder(
        oppdaterteInnvilgedeMedlemskapsperioder,
        aarsavregningRes.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag,
      );
    }
    // Vanlig innlastning. Delt og uten grunnlag
    return mapMedlemskapsperioder(
      innvilgedeMedlemskapsperioder,
      aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag,
    );
  };

  const getBestemmelse = (mappedMedlemskapsperioder: AvgiftspliktigPeriode[]) => {
    if (mappedMedlemskapsperioder.length > 0) {
      const førsteBestemmelse = mappedMedlemskapsperioder[0].bestemmelse;
      const medlemskapsperioderHarSammeBestemmelse = mappedMedlemskapsperioder.every(
        (period) => period.bestemmelse === førsteBestemmelse,
      );
      if (medlemskapsperioderHarSammeBestemmelse) {
        return førsteBestemmelse;
      }
      throw new Error(
        "Kan ikke laste inn årsavregning fordi grunnlag eller behandlingsresultat har innvilgede medlemskapsperioder med ulik bestemmelse",
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

        const deltGrunnlagAarsavregningHarIkkeNyttGrunnlag =
          harTrygdeavgiftFraAvgiftssystemet && aarsavregningRes && !aarsavregningRes.nyttTrygdeavgiftsGrunnlag;

        const bestemmelseFraTidligereAvgiftsgrunnlag =
          aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
            ?.avgiftspliktigPerioder?.[0]?.bestemmelse;
        const eventuellNyBestemmelse = aarsavregningRes?.sisteGjeldendeMedlemskapsperioder?.[0]?.bestemmelse;

        const skalHenteGrunnlagFraTidligereTrygdeavgiftsgrunnlag =
          deltGrunnlagAarsavregningHarIkkeNyttGrunnlag &&
          bestemmelseFraTidligereAvgiftsgrunnlag &&
          eventuellNyBestemmelse &&
          bestemmelseFraTidligereAvgiftsgrunnlag === eventuellNyBestemmelse;

        const mappedMedlemskapsperioder = await getMappedMedlemskapsperioder(aarsavregningRes!);
        const bestemmelse = getBestemmelse(mappedMedlemskapsperioder);
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

        const formDefaultValues: FieldValue<AarsavregningFormValuesProps> = {
          medlemskapsperioder: mappedMedlemskapsperioder.length
            ? mappedMedlemskapsperioder
            : [DEFAULT_MEDLEMSKAPSPERIODE],
          bestemmelse,
          trygdeavgiftFraAvgiftssystemet,
          endeligAvgiftValg: aarsavregningRes?.endeligAvgiftValg || "",
          manueltAvgiftBeloep,
          skatteforholdsperioder: mapTilSkatteforholdProps(
            skalHenteGrunnlagFraTidligereTrygdeavgiftsgrunnlag
              ? aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
                  .skatteforholdsperioder
              : aarsavregningRes?.nyttTrygdeavgiftsGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
            mappedMedlemskapsperioder,
          ),
          inntektskilder: mapTilInntektskilderProps(
            skalHenteGrunnlagFraTidligereTrygdeavgiftsgrunnlag
              ? aarsavregningRes?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
              : aarsavregningRes?.nyttTrygdeavgiftsGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder,
            mappedMedlemskapsperioder,
          ),
        };

        setInitiellData({
          valgtÅr: aarsavregningRes?.aar,
          aarsavregningResponse: aarsavregningRes,
          bestemmelser: bestemmelsesRes.bestemmelser,
          formDefaultValues,
          trygdedekninger,
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
      harGrunnlag={harGrunnlag}
    />
  );
}
