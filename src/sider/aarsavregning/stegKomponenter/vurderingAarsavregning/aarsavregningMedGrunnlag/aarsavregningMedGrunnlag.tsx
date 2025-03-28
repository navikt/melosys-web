import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.css";
import { useEffect, useState } from "react";
import {
  AarsavregningResponse,
  Trygdeavgiftsgrunnlag,
} from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { FieldValue } from "react-hook-form";
import { FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../../utils";
import { OK } from "../../../../../ducks/aarsavregning/types";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../aarsavregningHelpers";
import { AarsavregningMedGrunnlagForm } from "./aarsavregningMedGrunnlagForm";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [initiellData, setInitiellData] = useState<{
    aarsavregningResponse?: AarsavregningResponse;
    formDefaultValues: FieldValue<FormValuesProps>;
    erAvvik?: boolean;
  }>({
    formDefaultValues: {
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
    },
  });

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const dispatch = useDispatch();

  const mapSkjemaverdierFraTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag?: Trygdeavgiftsgrunnlag) => {
    if (!trygdeavgiftsgrunnlag) return { skatteforholdsperioder: [{}], inntektskilder: [{}] };
    const { inntektskperioder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = [...inntektskperioder].sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = [...skatteforholdsperioder].sort(Utils.dato.sorterEtterISOFomDato);

    return {
      skatteforholdsperioder: !Utils._isEmpty(sorterteSkatteforhold)
        ? mapTilSkatteforholdProps(sorterteSkatteforhold)
        : [{}],
      inntektskilder: !Utils._isEmpty(sorterteInntekstkilder) ? mapTilInntektskilderProps(sorterteInntekstkilder) : [{}],
    };
  };

  useEffect(() => {
    if (behandlingID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((res) => {
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });

          let formValues;
          if (res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
            formValues = mapSkjemaverdierFraTrygdeavgiftsgrunnlag(
              res.nyttGrunnlag?.trygdeavgiftsgrunnlag || res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
            );
          } else {
            formValues = {
              skatteforholdsperioder: [{}],
              inntektskilder: [{}],
            };
          }

          setInitiellData({
            aarsavregningResponse: res,
            erAvvik: res.harAvvik,
            formDefaultValues: formValues,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setInitiellData({
              aarsavregningResponse: undefined,
              formDefaultValues: {
                skatteforholdsperioder: [{}],
                inntektskilder: [{}],
              },
            });
          }
          setIsLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    return <div />;
  }

  return (
    <AarsavregningMedGrunnlagForm initiellData={initiellData} bekreft={bekreft} oppdaterStatus={oppdaterStatus} />
  );
}
