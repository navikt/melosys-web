import TrygdeavgiftsperioderTabell from "./komponenter/trygdeavgiftsperioderTabell";
import * as Api from "../../../../services/api";
import MedlemskapsPerioderTabell from "./komponenter/medlemskapsPerioderTabell";
import "./vurderingAarsavregning.css";
import { useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import SkatteforholdsPerioderTabell from "./komponenter/skatteforholdsPerioderTabell";
import { TidligereGrunnlagsopplysningerFinnesIkke } from "./komponenter/tidligereGrunnlagsopplysningerFinnesIkke";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { FieldArrayProps, FormValuesProps } from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Skatteforholdsperioder } from "../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrygdeavgiftsgrunnlagDto } from "../../../../services/modules/trygdeavgift";
import * as Utils from "../../../../utils";
import vurderingAarsavregningSchema from "./vurderingAarsavregningSchema";

export const VurderingAarsavregning = () => {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>(undefined);
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [lagretTrygdeavgift, setLagretTrygdeavgift] = useState<AarsavregningResponse | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const [defaultPeriode, setDefaultPeriode] = useState<{ fomDato: string; tomDato: string } | undefined>(undefined);

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger
  } = useForm({
    resolver: yupResolver(vurderingAarsavregningSchema),
    context: {},
    mode: "onChange",
    defaultValues: {
      skatteforholdsperioder: [{}],
      inntektskilder: [{}]
    } as FieldValue<FormValuesProps>
  });
  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
    replace: resetSkatteforholdsperioder
  } = useFieldArray<FieldArrayProps, "skatteforholdsperioder", "id">({ control, name: "skatteforholdsperioder" });
  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
    replace: resetInntektskilder
  } = useFieldArray<FieldArrayProps, "inntektskilder", "id">({ control, name: "inntektskilder" });
  const formValues = watch();

  useEffect(() => {
    fetchAvregningsData();
  }, []);

  const fetchAvregningsData = () => {
    return Api.Aarsavregning.hentAvregningsData(behandlingID)
      .then((response: AarsavregningResponse) => {
        setLagretTrygdeavgift(response);
        setValgtÅr(response.aar);
        return response;
      })
      .catch((error: any) => {
        if (error.response?.status === 404) {
          setLagretTrygdeavgift(undefined);
          setValgtÅr(undefined);
        }
      });
  };

  const harTidligereGrunnlagsopplysninger = () => {
    return lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.inntektskperioder !== null && lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.skatteforholdsperioder !== null;
  };

  const settTrygdeavgiftFraTidligereGrunnlag = (formVerdier: FieldValue<FormValuesProps>) => {
    setFeil(undefined);
    // setLagrePending(true);
    // const erBrukerPliktigMedlemOgSkattepliktig =
    //   medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);

    if (harTidligereGrunnlagsopplysninger()) {
      Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, {
        skatteforholdsperioder: lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder,
        inntektskilder: lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.inntektskperioder
      })
        .then((beregnetTrygdeavgift) => {
          setFeil(undefined);
          // setTrygdeavgift(beregnetTrygdeavgift);
        })
        .catch((error) => setFeil(error));
      // .finally(() => setLagrePending(false));
    }

  };

  const håndterLagretTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto) => {
    const { inntektskilder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = inntektskilder?.sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = skatteforholdsperioder?.sort(Utils.dato.sorterEtterISOFomDato);
    resetSkatteforholdsperioder(
      !Utils._isEmpty(sorterteSkatteforhold)
        ? sorterteSkatteforhold.map((skatteforhold) => ({
          fomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.fomDato),
          tomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.tomDato),
          skatteplikttype: skatteforhold.skatteplikttype
        }))
        : [defaultPeriode!]
    );
    resetInntektskilder(
      !Utils._isEmpty(sorterteInntekstkilder)
        ? sorterteInntekstkilder.map((inntektskilde) => ({
          kildetype: inntektskilde.type,
          arbAvgBetales: Utils.streng.boolTilUppercaseStreng(inntektskilde.arbeidsgiversavgiftBetales),
          bruttoInntekt: inntektskilde.avgiftspliktigInntektMnd,
          fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
          tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato)
        }))
        : [defaultPeriode!]
    );
  };

  const håndterAvvik = (avvik: boolean) => {
    if (avvik) {
      const minFomDato = lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder.sort((a, b) => a.fomDato.localeCompare(b.fomDato))[0].fomDato;
      const maxTomDato = lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder.sort((a, b) => b.tomDato.localeCompare(a.tomDato))[0].tomDato;
      setDefaultPeriode({ fomDato: minFomDato, tomDato: maxTomDato });
      håndterLagretTrygdeavgiftsgrunnlag({
        skatteforholdsperioder: lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder,
        inntektskilder: lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.inntektskperioder
      });
    } else{
      resetSkatteforholdsperioder([defaultPeriode!]);
      resetInntektskilder([defaultPeriode!]);
    }
  };

  const håndterEndringAvÅr = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const år = parseInt(event.target.value, 10);
    setFeil(undefined);
    setValgtÅr(år);
  };

  useEffect(() => {
    if (!valgtÅr || lagretTrygdeavgift?.aar === valgtÅr) {
      return;
    }

    Api.Aarsavregning.lagAvregningsData(behandlingID, { aar: valgtÅr })
      .then((nyAvregningsData) => setLagretTrygdeavgift(nyAvregningsData))
      .catch((error: any) => {
        setFeil(error.body?.message || error);
      });
  }, [valgtÅr]);

  return (
    <div className="vurderingAarsavregning">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Årsavregning</Nav.Typo.Innholdstittel>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select label="" id="aarVelger" value={valgtÅr ?? ""} onChange={håndterEndringAvÅr}>
              <option key="" value="" disabled>
                Velg...
              </option>
              {muligeAar.map((aar) => (
                <option key={aar} value={aar}>
                  {aar}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {feil && <Nav.Alert variant="error">{feil}</Nav.Alert>}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr && (
        <TidligereGrunnlagsopplysningerFinnesIkke />
      )}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <>
          <MedlemskapsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <SkatteforholdsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder}
          />
          <TrygdeavgiftsperioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift.trygdeavgiftsperioder}
            avgift={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift}
          />
        </>
      )}
      {lagretTrygdeavgift && (
        <Nav.RadioGroup onChange={håndterAvvik} value={erAvvik} legend="Er det avvik i opplysningene fra skatt eller bruker?">
          <Nav.Radio value={true}>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Nav.RadioGroup>
      )}

      {(
        <Nav.Row>
          <Nav.Column>
            <Skatteforholdsperioder
              formValues={formValues}
              redigerbart={redigerbart}
              remove={skattRemove}
              append={skattAppend}
              control={control}
              defaultPeriode={defaultPeriode}
              fields={skattFields}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {(
        <Inntektskilder
          formValues={formValues}
          redigerbart={redigerbart}
          update={inntektUpdate}
          remove={inntektRemove}
          append={inntektAppend}
          control={control}
          defaultPeriode={defaultPeriode}
          fields={inntektFields}
          medlemskapsTypeErPliktig={false}
        />
      )}

      <Nav.Button variant="primary" disabled={!redigerbart}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
};
