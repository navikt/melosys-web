import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.css";
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
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../aarsavregningHelpers";
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

const mapMedlemskapsperiodeBestemmelse = (harDeltGrunnlag: boolean, medlemskapsperioder?: Medlemskapsperiode[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sortertePerioder = [...medlemskapsperioder]
      .filter((periode) => (harDeltGrunnlag ? !periode.redigerbar : true))
      .filter((periode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
      .sort(sorterEtterISOFomDato);
    return sortertePerioder?.[0]?.bestemmelse;
  }
  return undefined;
};

export interface AarsavregningMedGrunnlagFormValues extends FormValuesProps {
  behandlingsvalg?: string;
  avgift25Prosent?: string;
}

export interface InitiellData {
  aarsavregningResponse?: AarsavregningResponse;
  formDefaultValues: FieldValue<AarsavregningMedGrunnlagFormValues>;
  innvilgetMedlemskapsperiode?: { fomDato: string; tomDato: string };
  innvilgetMedlemskapsperiodeBestemmelse?: string;
  medlemskapstypeErPliktig: boolean;
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
      behandlingsvalg: undefined,
      avgift25Prosent: undefined,
    },
    medlemskapstypeErPliktig: false,
  });
  const [innlastingFeilmelding, setInnlastingFeilmelding] = useState("");

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const dispatch = useDispatch();

  const mapSkjemaverdierFraTrygdeavgiftsgrunnlag = (
    trygdeavgiftsgrunnlag?: Trygdeavgiftsgrunnlag,
    behandlingsvalg?: string,
    avgift25Prosent?: string,
  ) => {
    if (!trygdeavgiftsgrunnlag)
      return {
        skatteforholdsperioder: [{}],
        inntektskilder: [{}],
        behandlingsvalg: undefined,
        avgift25Prosent: undefined,
      };
    const { inntektskperioder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = [...inntektskperioder].sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = [...skatteforholdsperioder].sort(Utils.dato.sorterEtterISOFomDato);

    return {
      behandlingsvalg,
      avgift25Prosent,
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
          if (!res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
            setInnlastingFeilmelding("Årsavregning med grunnlag må ha grunnlag");
            setIsLoading(false);
            return;
          }

          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });

          const defaultFormValues = mapSkjemaverdierFraTrygdeavgiftsgrunnlag(
            res?.nyttGrunnlag?.trygdeavgiftsgrunnlag || res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
            res.behandlingsvalg,
            res?.avregning?.avgift25Prosent,
          );

          const medlemskapsperioder = res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
          const innvilgetMedlemskapsperiode = mapInnvilgetMedlemskapsPeriode(medlemskapsperioder);
          const innvilgetMedlemskapsperiodeBestemmelse = mapMedlemskapsperiodeBestemmelse(false, medlemskapsperioder);
          const medlemskapstypeErPliktig = Boolean(
            medlemskapsperioder?.every((periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG),
          );

          setInitiellData({
            aarsavregningResponse: res,
            formDefaultValues: defaultFormValues,
            innvilgetMedlemskapsperiode,
            innvilgetMedlemskapsperiodeBestemmelse,
            medlemskapstypeErPliktig,
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
