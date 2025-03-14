import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.css";
import { useEffect, useState } from "react";
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
import { mapMedlemskapsperioder, mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../aarsavregningHelpers";
import {
  Medlemskapsperiode,
  OppdaterMedlemskapsperiode,
} from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { AarsavregningFormComponent } from "./aarsavregningFormComponent";

const { DELVIS_INNVILGET, INNVILGET } = MKV.Koder.innvilgelsesResultat;

export const ULAGRET_MEDLEMSKAPSPERIODE_ID = -1;

export const DEFAULT_MEDLEMSKAPSPERIODE = {
  id: ULAGRET_MEDLEMSKAPSPERIODE_ID,
  fomDato: "",
  tomDato: "",
  innvilgelsesResultat: "",
  trygdedekning: "",
  bestemmelse: "",
  redigerbar: true,
};

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
  harDeltGrunnlag: boolean;
}

export interface MedlemskapTomFomDatoer {
  fom?: string;
  tom?: string;
}

export interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

export function AarsavregningUtenEllerDeltGrunnlag({ bekreft, oppdaterStatus, harDeltGrunnlag }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<{
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    lagredeMedlemskapsperioder: Medlemskapsperiode[];
    bestemmelser: any[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
  }>({
    lagredeMedlemskapsperioder: [],
    bestemmelser: [],
    formDefaultValues: {
      medlemskapsperioder: [DEFAULT_MEDLEMSKAPSPERIODE],
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
      totaltForskuddsvisFakturert: "",
    },
  });

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const dispatch = useDispatch();

  const opprettMedlemskapsperiode = async (medlemskapsperiode: Medlemskapsperiode) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const response: any = await Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(
      behandlingID,
      periodeRequest,
    );

    return response.type !== medlemskapsperioderTypes.FEILET;
  };

  useEffect(() => {
    const loadInitialData = async () => {
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

        const medlemskapsperioderRes =
          await Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID);
        const innvilgedeMedlemskapsperioder = medlemskapsperioderRes.filter(
          (periode: Medlemskapsperiode) =>
            periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
        );

        let mappedMedlemskapsperioder;
        if (
          redigerbart &&
          harDeltGrunnlag &&
          innvilgedeMedlemskapsperioder.length === 0 &&
          aarsavregningRes?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
        ) {
          // Oppretter medlemskapsperioder fra grunnlag på behandlingsresultat
          const medlemskapsperioderFraGrunnlag =
            aarsavregningRes.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.medlemskapsperioder;
          const innvilgedeMedlemskapsperioderFraGrunnlag = medlemskapsperioderFraGrunnlag.filter(
            (periode) =>
              periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
          );
          // eslint-disable-next-line no-restricted-syntax
          for (const periode of innvilgedeMedlemskapsperioderFraGrunnlag) {
            await opprettMedlemskapsperiode(periode);
          }

          const oppdaterteMedlemskapsperioder =
            await Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID);
          const oppdaterteInnvilgedeMedlemskapsperioder = oppdaterteMedlemskapsperioder.filter(
            (periode: Medlemskapsperiode) =>
              periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
          );

          mappedMedlemskapsperioder = mapMedlemskapsperioder(
            oppdaterteInnvilgedeMedlemskapsperioder,
            aarsavregningRes.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag,
          );
        } else {
          // Vanlig flyt
          mappedMedlemskapsperioder = mapMedlemskapsperioder(
            innvilgedeMedlemskapsperioder,
            aarsavregningRes?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag,
          );
        }

        const erInitiellMappingForDeltGrunnlag = harDeltGrunnlag && aarsavregningRes && !aarsavregningRes.nyttGrunnlag;

        const formDefaultValues: FieldValue<AarsavregningFormValuesProps> = {
          medlemskapsperioder: mappedMedlemskapsperioder.length
            ? mappedMedlemskapsperioder
            : [DEFAULT_MEDLEMSKAPSPERIODE],
          totaltForskuddsvisFakturert: aarsavregningRes?.avregning?.tidligereFakturertBeloepAvgiftssystem || "",
          skatteforholdsperioder: mapTilSkatteforholdProps(
            erInitiellMappingForDeltGrunnlag
              ? aarsavregningRes?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
              : aarsavregningRes?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
            mappedMedlemskapsperioder,
          ),
          inntektskilder: mapTilInntektskilderProps(
            erInitiellMappingForDeltGrunnlag
              ? aarsavregningRes?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
              : aarsavregningRes?.nyttGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder,
            mappedMedlemskapsperioder,
          ),
        };

        setInitialData({
          valgtÅr: aarsavregningRes?.aar,
          aarsavregningResponse: aarsavregningRes,
          lagredeMedlemskapsperioder: innvilgedeMedlemskapsperioder,
          bestemmelser: bestemmelsesRes.bestemmelser,
          formDefaultValues,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Initiell mapping feilet:", error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [behandlingID, harDeltGrunnlag]);

  if (isLoading) {
    return <div />;
  }

  return (
    <AarsavregningFormComponent
      initialData={initialData}
      bekreft={bekreft}
      oppdaterStatus={oppdaterStatus}
      harDeltGrunnlag={harDeltGrunnlag}
    />
  );
}
