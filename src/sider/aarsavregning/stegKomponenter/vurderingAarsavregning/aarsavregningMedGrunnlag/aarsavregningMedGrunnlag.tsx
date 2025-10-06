import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.less";
import { useEffect, useState } from "react";
import {
  AarsavregningResponse,
  Trygdeavgiftsgrunnlag,
} from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { FieldValue } from "react-hook-form";
import { FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../../utils";
import { OK } from "../../../../../ducks/aarsavregning/types";
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../utils";
import { AarsavregningMedGrunnlagForm } from "./aarsavregningMedGrunnlagForm";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";

const mapInnvilgetMedlemskapsPeriode = (medlemskapsperioder: Medlemskapsperiode[]) => {
  const sorterteInnvilgedePerioder = [...medlemskapsperioder]
    .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
    .sort(sorterEtterISOFomDato);
  return {
    fomDato: Utils.dato.formatterDatoTilNorsk(sorterteInnvilgedePerioder[0].fomDato),
    tomDato: Utils.dato.formatterDatoTilNorsk(
      sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    ),
  };
};

const mapMedlemskapsperiodeBestemmelse = (
  harTrygdeavgiftFraAvgiftssystemet: boolean,
  medlemskapsperioder?: Medlemskapsperiode[],
) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sortertePerioder = [...medlemskapsperioder]
      .filter((periode) => (harTrygdeavgiftFraAvgiftssystemet ? !periode.redigerbar : true))
      .filter((periode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
      .sort(sorterEtterISOFomDato);
    return sortertePerioder?.[0]?.bestemmelse;
  }
  return undefined;
};

const mapTrygdedekning = (medlemskapsperioder?: Medlemskapsperiode[]) => {
  if (!medlemskapsperioder || medlemskapsperioder.length === 0) return undefined;
  const innvilgedePerioder = medlemskapsperioder.filter(
    (periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET,
  );
  return innvilgedePerioder[0]?.trygdedekning;
};

export interface AarsavregningMedGrunnlagFormValues extends FormValuesProps {
  endeligAvgiftValg: string;
  manueltAvgiftBeloep?: number;
}

export interface InitiellData {
  aarsavregningResponse?: AarsavregningResponse;
  formDefaultValues: FieldValue<AarsavregningMedGrunnlagFormValues>;
  innvilgetMedlemskapsperiode?: { fomDato: string; tomDato: string };
  innvilgetMedlemskapsperiodeBestemmelse?: string;
  innvilgetMedlemskapsperiodeTrygdedekning?: string;
  medlemskapstypeErPliktig: boolean;
  forrigeÅrsavregningErManueltBeregnet: boolean;
  valgtÅr?: number;
}

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [initiellData, setInitiellData] = useState<InitiellData>({
    formDefaultValues: {
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
      endeligAvgiftValg: "",
      manueltAvgiftBeloep: undefined,
    },
    medlemskapstypeErPliktig: false,
    forrigeÅrsavregningErManueltBeregnet: false,
  });
  const [innlastingFeilmelding, setInnlastingFeilmelding] = useState("");

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const dispatch = useDispatch();

  const mapSkjemaverdierFraTrygdeavgiftsgrunnlag = (aarsavregningResponse?: AarsavregningResponse) => {
    let trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag | undefined = undefined;
    if (aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag) {
      trygdeavgiftsgrunnlag = aarsavregningResponse.nyttGrunnlag.trygdeavgiftsgrunnlag;
    } else {
      const bestemmelseFraTidligereAvgiftsgrunnlag =
        aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
          ?.medlemskapsperioder?.[0]?.bestemmelse;
      const eventuellNyBestemmelse = aarsavregningResponse?.vedtatteMedlemskapsperioder?.[0]?.bestemmelse;
      if (
        bestemmelseFraTidligereAvgiftsgrunnlag &&
        eventuellNyBestemmelse &&
        bestemmelseFraTidligereAvgiftsgrunnlag === eventuellNyBestemmelse
      ) {
        trygdeavgiftsgrunnlag =
          aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag;
      }
    }

    const endeligAvgiftValg = aarsavregningResponse?.endeligAvgiftValg;
    const manueltAvgiftBeloep = aarsavregningResponse?.avregning?.manueltAvgiftBeloep;

    if (!trygdeavgiftsgrunnlag) {
      return {
        skatteforholdsperioder: [{}],
        inntektskilder: [{}],
        endeligAvgiftValg: "",
        manueltAvgiftBeloep: undefined,
      };
    }

    const { inntektskperioder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = [...inntektskperioder].sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = [...skatteforholdsperioder].sort(Utils.dato.sorterEtterISOFomDato);

    return {
      endeligAvgiftValg: endeligAvgiftValg || "",
      manueltAvgiftBeloep,
      skatteforholdsperioder: !Utils._isEmpty(sorterteSkatteforhold)
        ? mapTilSkatteforholdProps(sorterteSkatteforhold)
        : [{}],
      inntektskilder: !Utils._isEmpty(sorterteInntekstkilder)
        ? mapTilInntektskilderProps(sorterteInntekstkilder)
        : [{}],
    };
  };

  useEffect(() => {
    if (behandlingID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((res) => {
          if (!res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
            setInnlastingFeilmelding("Årsavregning med grunnlag må ha grunnlag");
            setIsLoading(false);
            return;
          }

          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });

          const defaultFormValues: FieldValue<AarsavregningMedGrunnlagFormValues> =
            mapSkjemaverdierFraTrygdeavgiftsgrunnlag(res);

          const medlemskapsperioder = res.vedtatteMedlemskapsperioder || [];
          const innvilgetMedlemskapsperiode = mapInnvilgetMedlemskapsPeriode(medlemskapsperioder);
          const innvilgetMedlemskapsperiodeBestemmelse = mapMedlemskapsperiodeBestemmelse(false, medlemskapsperioder);
          const innvilgetMedlemskapsperiodeTrygdedekning = mapTrygdedekning(medlemskapsperioder);
          const medlemskapstypeErPliktig = Boolean(
            medlemskapsperioder?.every((periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG),
          );

          const forrigeÅrsavregningErManueltBeregnet = Boolean(
            res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== null &&
              res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== undefined,
          );

          const valgtÅr = innvilgetMedlemskapsperiode
            ? Utils.dato.norskStringTilDate(innvilgetMedlemskapsperiode.fomDato)?.getFullYear()
            : undefined;

          setInitiellData({
            aarsavregningResponse: res,
            formDefaultValues: defaultFormValues,
            innvilgetMedlemskapsperiode,
            innvilgetMedlemskapsperiodeBestemmelse,
            innvilgetMedlemskapsperiodeTrygdedekning,
            medlemskapstypeErPliktig,
            forrigeÅrsavregningErManueltBeregnet,
            valgtÅr,
          });
          setIsLoading(false);
        })
        .catch(() => {
          setInnlastingFeilmelding(`Fant ikke årsavregning for behandlingID: ${behandlingID}`);
          setIsLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    return <div />;
  }

  if (innlastingFeilmelding) {
    return (
      <Nav.Alert variant="error" className="alertstripe_feilmelding">
        {innlastingFeilmelding}
      </Nav.Alert>
    );
  }

  return <AarsavregningMedGrunnlagForm initiellData={initiellData} bekreft={bekreft} oppdaterStatus={oppdaterStatus} />;
}
