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
import { hentMedlemskapsperiodeBestemmelse } from "../komponenter/utils";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";
import { BOOLSK_STRING } from "../../../../../constants";

const lagInnvilgetMedlemskapsPeriode = (medlemskapsperioder: Medlemskapsperiode[]) => {
  const sorterteInnvilgedePerioder = [...medlemskapsperioder]
    .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
    .sort(sorterEtterISOFomDato);
  return {
    fomDato: Utils.dato.formatterDatoTilNorsk(sorterteInnvilgedePerioder[0].fomDato),
    tomDato: Utils.dato.formatterDatoTilNorsk(sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato),
  };
};

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export interface InitiellData {
  aarsavregningResponse?: AarsavregningResponse;
  formDefaultValues: FieldValue<FormValuesProps>;
  erAvvik?: boolean;
  innvilgetMedlemskapsperiode?: { fomDato: string; tomDato: string };
  innvilgetMedlemskapsperiodeBestemmelse?: string;
  medlemskapstypeErPliktig?: boolean;
}

export function AarsavregningMedGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [initiellData, setInitiellData] = useState<InitiellData>({
    formDefaultValues: {
      erAvvik: "",
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
    },
  });
  const [innlastingFeilmelding, setInnlastingFeilmelding] = useState("");

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const dispatch = useDispatch();

  const mapSkjemaverdierFraTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag?: Trygdeavgiftsgrunnlag, harAvvik?: boolean) => {
    if (!trygdeavgiftsgrunnlag) return { erAvvik: "", skatteforholdsperioder: [{}], inntektskilder: [{}] };
    const { inntektskperioder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = [...inntektskperioder].sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = [...skatteforholdsperioder].sort(Utils.dato.sorterEtterISOFomDato);

    return {
      erAvvik: harAvvik ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN,
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

          const formValues = mapSkjemaverdierFraTrygdeavgiftsgrunnlag(
            res?.nyttGrunnlag?.trygdeavgiftsgrunnlag || res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
            res.harAvvik
          );

          const medlemskapsperioder = res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
          const innvilgetMedlemskapsperiode = lagInnvilgetMedlemskapsPeriode(medlemskapsperioder);
          const innvilgetMedlemskapsperiodeBestemmelse = hentMedlemskapsperiodeBestemmelse(false, medlemskapsperioder);
          const medlemskapstypeErPliktig = medlemskapsperioder?.every(
            (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
          );

          setInitiellData({
            aarsavregningResponse: res,
            erAvvik: res.harAvvik,
            formDefaultValues: formValues,
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
