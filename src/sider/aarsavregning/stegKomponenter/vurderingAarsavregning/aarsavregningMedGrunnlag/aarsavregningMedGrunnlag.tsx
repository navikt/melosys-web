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
import {
  Avgiftspliktigperiode,
  hasInnvilgelsesResultat,
} from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";

const mapMedlemskapsperioder = (medlemskapsperioder: Avgiftspliktigperiode[]) => {
  const innvilgedePerioder = medlemskapsperioder.filter(
    (periode) =>
      hasInnvilgelsesResultat(periode) && periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET,
  );

  return [...innvilgedePerioder].sort(sorterEtterISOFomDato).map((periode) => ({
    ...periode,
    fomDato: Utils.dato.formatterDatoTilNorsk(periode.fomDato),
    tomDato: Utils.dato.formatterDatoTilNorsk(periode.tomDato),
  }));
};

export interface AarsavregningMedGrunnlagFormValues extends FormValuesProps {
  endeligAvgiftValg: string;
  manueltAvgiftBeloep?: number;
}

export interface InitiellData {
  aarsavregningResponse?: AarsavregningResponse;
  formDefaultValues: FieldValue<AarsavregningMedGrunnlagFormValues>;
  innvilgetMedlemskapsperioder: Avgiftspliktigperiode[];
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
    innvilgetMedlemskapsperioder: [],
    medlemskapstypeErPliktig: false,
    forrigeÅrsavregningErManueltBeregnet: false,
  });
  const [innlastingFeilmelding, setInnlastingFeilmelding] = useState("");

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const dispatch = useDispatch();

  const mapSkjemaverdierFraTrygdeavgiftsgrunnlag = (aarsavregningResponse?: AarsavregningResponse) => {
    let trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag | undefined = undefined;
    if (aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag?.trygdeavgiftsgrunnlag) {
      trygdeavgiftsgrunnlag = aarsavregningResponse.nyttTrygdeavgiftsGrunnlag.trygdeavgiftsgrunnlag;
    } else {
      const tidligerePerioderØ =
        aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
          ?.avgiftspliktigperioder?.[0];
      const sisteGjeldendeØ = aarsavregningResponse?.sisteGjeldendeAvgiftspliktigperioder?.[0];

      const bestemmelseFraTidligereAvgiftsgrunnlag =
        tidligerePerioderØ && hasInnvilgelsesResultat(tidligerePerioderØ) ? tidligerePerioderØ.bestemmelse : undefined;
      const eventuellNyBestemmelse =
        sisteGjeldendeØ && hasInnvilgelsesResultat(sisteGjeldendeØ) ? sisteGjeldendeØ.bestemmelse : undefined;

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

          const medlemskapsperioder = res.sisteGjeldendeAvgiftspliktigperioder || [];
          const innvilgetMedlemskapsperioder = mapMedlemskapsperioder(medlemskapsperioder);
          const medlemskapstypeErPliktig = Boolean(
            innvilgetMedlemskapsperioder?.every(
              (periode) =>
                hasInnvilgelsesResultat(periode) && periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
            ),
          );

          const forrigeÅrsavregningErManueltBeregnet = Boolean(
            res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== null &&
              res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== undefined,
          );

          const valgtÅr =
            innvilgetMedlemskapsperioder.length > 0
              ? Utils.dato.norskStringTilDate(innvilgetMedlemskapsperioder[0].fomDato)?.getFullYear()
              : undefined;

          setInitiellData({
            aarsavregningResponse: res,
            formDefaultValues: defaultFormValues,
            innvilgetMedlemskapsperioder,
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
