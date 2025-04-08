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

/**
 * Hovedkomponenten for årsavregningsskjemaet (både med og uten delt grunnlag).
 * Bruker `useAarsavregningForm` for all state og logikk.
 */
export function AarsavregningUtenEllerDeltGrunnlagForm({
  initiellData,
  bekreft, // Funksjon som kalles når bruker bekrefter steget
  oppdaterStatus, // Funksjon for å rapportere gyldighetsstatus til forelder
  harDeltGrunnlag, // Boolean for å vise/skjule deler relatert til delt grunnlag
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
  // Henter all state og funksjoner fra den sentraliserte hooken
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
      {/* Viser tidligere grunnlag kun hvis det er delt grunnlag */}
      {harDeltGrunnlag && (
        <>
          {/* Tabell for tidligere medlemskapsperioder */}
          <MedlemskapsPerioderTabell
            perioder={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          {/* Oversikt over tidligere skatt, inntekt og avgift */}
          <TidligereGrunnlagsoversikt
            skatteforholdsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
            }
            avgift={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift}
          />

          {/* Melding hvis trygdeavgift ikke var forskuddsvis fakturert */}
          {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

          {/* Detaljer for tidligere beregnet avgift */}
          <BeregnetTrygdeavgiftDetaljer
            grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
            medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
            tittel="Tidligere beregnet trygdeavgift"
          />
        </>
      )}

      {/* Input for manuelt tidligere fakturert beløp */}
      <TidligereFakturertIAvgiftssystemetInput
        control={control as any}
        redigerbart={skjemaErRedigerbart}
        harDeltGrunnlag={harDeltGrunnlag}
      />

      <Nav.Heading className="endelige_opplysninger_heading" level="2">
        Inntekts- og skatteopplysninger for endelig trygdeavgift
      </Nav.Heading>

      {/* Velger for bestemmelse (EOS/Art.16 etc.) */}
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

      {/* Dynamisk liste over medlemskapsperioder */}
      <div className="medlemskapsperioder">
        {medlemskapsperioderFields.map((field, index) => (
          <MedlemskapsperiodeSkjema
            key={field.id} // Viktig for Reacts liste-rendering
            redigerbart={skjemaErRedigerbart}
            control={control as any}
            field={field} // Data for dette feltet i arrayen
            index={index} // Index i arrayen
            remove={slettMedlemskapsperiode} // Funksjon for å slette denne perioden
            formValues={formValues} // Hele skjemaets verdier (kan brukes internt i skjemaet)
            handleLeggTil={leggTilDefaultMedlemskapsperiode} // Funksjon for å legge til ny periode
            visLeggTil // Skal "Legg til" knapp vises?
            // Begrensninger for datovelgere
            maksVerdi={
              initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined
            }
            minVerdi={initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined}
            trygdedekninger={trygdedekninger} // Liste over tilgjengelige trygdedekninger
            setValue={setValue} // RHF setValue for interne endringer
            errors={errors} // RHF errors objekt
          />
        ))}
      </div>

      {/* Komponent for skatteforholdsperioder */}
      <Skatteforholdsperioder
        defaultPeriode={medlemskapsperiode} // Brukes for default datoer ved ny periode
        formValues={formValues}
        redigerbart={skjemaErRedigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control as any}
        fields={skattFields}
      />

      {/* Komponent for inntektskilder (vises kun hvis relevant) */}
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
          skalViseErMaanedsBelopRadioGroup // Prop for å vise spesifikk radiogruppe
          bestemmelse={formValues.bestemmelse}
        />
      )}

      {/* Melding hvis trygdeavgift ikke skal betales til NAV */}
      {formIsValid && trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />
      )}

      {/* Summert tabell for avregning (vises når alt er gyldig og ingen beregning pågår) */}
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

      {/* Detaljer for endelig beregnet avgift (vises når alt er gyldig og nytt grunnlag finnes) */}
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

      {/* Viser array-valideringsfeil (f.eks. gap/overlapp) */}
      {arrayValideringsfeil && <Feilmelding type={arrayValideringsfeil} />}

      {/* Viser hovedfeilmelding eller medlemskapsfeilmelding */}
      {(hovedFeilmelding || medlemskapFeilmelding) && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {hovedFeilmelding || medlemskapFeilmelding}
        </Nav.Alert>
      )}

      {/* Hovedknapp for å bekrefte og gå videre */}
      <Nav.Button
        variant="primary"
        loading={beregningPaagar || endrerBestemmelse || lagreMedlemskapsperioderPaagar || debouncedBeregningPagaar}
        disabled={!redigerbart} // Deaktiveres hvis ikke redigerbart
        onClick={bekreftOnClick} // Kaller handler fra useAarsavregningForm
      >
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
