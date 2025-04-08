/* eslint-disable max-lines */
import { FieldValue } from "react-hook-form";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import * as Nav from "../../../../../navFrontend";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import BestemmelseSelect from "../komponenter/bestemmelseSelect";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import { MedlemskapsperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { TidligereFakturertIAvgiftssystemetInput } from "../komponenter/tidligereFakturertIAvgiftssystemetInput";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { AarsavregningFormValuesProps } from "./aarsavregningUtenEllerDeltGrunnlag";
import { useAarsavregningForm } from "./hooks/useAarsavregningForm";
import { Feilmelding } from "./valideringsfeil";

export function AarsavregningUtenEllerDeltGrunnlagForm({
  initiellData,
  bekreft,
  oppdaterStatus,
  harDeltGrunnlag,
}: {
  initiellData: {
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    bestemmelser: string[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
    trygdedekninger?: string[];
  };
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
  harDeltGrunnlag: boolean;
}) {
  const {
    hovedFeilmelding,
    medlemskapFeilmelding,
    arrayValideringsfeil,
    beregningPaagar,
    aarsavregningResponse,
    trygdedekninger,
    setTrygdedekninger,
    endrerBestemmelse,
    setEndrerBestemmelse,
    debouncedBeregningPagaar,
    lagreMedlemskapsperioderPaagar,
    control,
    formValues,
    formIsValid,
    errors,
    setValue,
    medlemskapsperioderFields,
    skattFields,
    inntektFields,
    skattAppend,
    skattRemove,
    inntektAppend,
    inntektRemove,
    inntektUpdate,
    leggTilDefaultMedlemskapsperiode,
    slettMedlemskapsperiode,
    bekreftOnClick,
    lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig,
    medlemskapsperiode,
    medlemskapstypeErPliktig,
    trygdeAvgiftSkalIkkeBetalesTilNav,
    forskuddsvisFakturertTrygdeavgift,
    skjemaErRedigerbart,
    redigerbart,
    behandlingID,
    setHovedFeilmelding,
  } = useAarsavregningForm({
    initiellData,
    bekreft,
    oppdaterStatus,
  });

  return (
    <div className="vurderingAarsavregning">
      {harDeltGrunnlag && (
        <>
          <MedlemskapsPerioderTabell
            perioder={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <TidligereGrunnlagsoversikt
            skatteforholdsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
            }
            avgift={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift}
          />

          {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

          <BeregnetTrygdeavgiftDetaljer
            grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
            medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
            tittel="Tidligere beregnet trygdeavgift"
          />
        </>
      )}

      <TidligereFakturertIAvgiftssystemetInput
        control={control as any}
        redigerbart={skjemaErRedigerbart}
        harDeltGrunnlag={harDeltGrunnlag}
      />

      <Nav.Heading className="endelige_opplysninger_heading" level="2">
        Inntekts- og skatteopplysninger for endelig trygdeavgift
      </Nav.Heading>

      <BestemmelseSelect
        control={control as any}
        setValue={setValue}
        bestemmelser={initiellData.bestemmelser}
        harDeltGrunnlag={harDeltGrunnlag}
        behandlingID={behandlingID}
        redigerbart={skjemaErRedigerbart}
        setTrygdedekninger={setTrygdedekninger}
        setFeilmelding={setHovedFeilmelding}
        setEndrerBestemmelse={setEndrerBestemmelse}
        lagreMedlemskapsperioderHvisGyldig={lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig}
      />

      <div className="medlemskapsperioder">
        {medlemskapsperioderFields.map((field, index) => (
          <MedlemskapsperiodeSkjema
            key={field.id}
            redigerbart={skjemaErRedigerbart}
            control={control as any}
            field={field}
            index={index}
            remove={slettMedlemskapsperiode}
            formValues={formValues}
            handleLeggTil={leggTilDefaultMedlemskapsperiode}
            visLeggTil
            maksVerdi={
              initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined
            }
            minVerdi={initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined}
            trygdedekninger={trygdedekninger}
            setValue={setValue}
            errors={errors}
          />
        ))}
      </div>

      <Skatteforholdsperioder
        defaultPeriode={medlemskapsperiode}
        formValues={formValues}
        redigerbart={skjemaErRedigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control as any}
        fields={skattFields}
      />
      {!trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Inntektskilder
          defaultPeriode={medlemskapsperiode}
          formValues={formValues}
          redigerbart={skjemaErRedigerbart}
          update={inntektUpdate}
          remove={inntektRemove}
          append={inntektAppend}
          control={control as any}
          fields={inntektFields}
          medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
          skalViseErMaanedsBelopRadioGroup
          bestemmelse={formValues.bestemmelse}
        />
      )}
      {formIsValid && trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />
      )}

      {formIsValid &&
        !beregningPaagar &&
        !debouncedBeregningPagaar &&
        !arrayValideringsfeil &&
        !hovedFeilmelding &&
        !medlemskapFeilmelding && (
          <SumArsavregningTabell
            nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
            tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            tidligereTrygdeavgiftAvgiftssystem={aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem}
          />
        )}

      {formIsValid &&
        !beregningPaagar &&
        !debouncedBeregningPagaar &&
        !hovedFeilmelding &&
        !medlemskapFeilmelding &&
        !arrayValideringsfeil &&
        aarsavregningResponse?.nyttGrunnlag && (
          <BeregnetTrygdeavgiftDetaljer
            grunnlag={aarsavregningResponse.nyttGrunnlag}
            medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
            tittel="Endelig beregnet trygdeavgift"
          />
        )}

      {arrayValideringsfeil && <Feilmelding type={arrayValideringsfeil} />}

      {(hovedFeilmelding || medlemskapFeilmelding) && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {hovedFeilmelding || medlemskapFeilmelding}
        </Nav.Alert>
      )}

      <Nav.Button
        variant="primary"
        loading={beregningPaagar || endrerBestemmelse || lagreMedlemskapsperioderPaagar || debouncedBeregningPagaar}
        disabled={!redigerbart}
        onClick={bekreftOnClick}
      >
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
