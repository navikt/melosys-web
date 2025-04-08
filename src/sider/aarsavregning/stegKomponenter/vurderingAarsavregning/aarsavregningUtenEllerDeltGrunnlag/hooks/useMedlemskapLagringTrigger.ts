import { useCallback, useEffect, useRef } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../../utils";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { medlemskapsperioderHarBrukerendringer } from "../utils/formUtils";
import { finnAktivFeilmeldingForMedlemskapsperioder } from "../valideringsfeil";

// Omdøpt interface for klarhet
interface UseMedlemskapLagringTriggerProps {
  medlemskapsperioder: Medlemskapsperiode[];
  lagredeMedlemskapsperioder: Medlemskapsperiode[];
  setLagredeMedlemskapsperioder: (perioder: Medlemskapsperiode[]) => void;
  redigerbart: boolean;
  endrerBestemmelse: boolean;
  lagreMedlemskapsperioderPaagar: boolean;
  setLagreMedlemskapsperioderPaagar: (pagaar: boolean) => void;
  trigger: UseFormTrigger<AarsavregningFormValuesProps>;
  setValue: UseFormSetValue<AarsavregningFormValuesProps>;
  bestemmelse: string | undefined;
  lagreMedlemskapsperioder: (
    perioder: Medlemskapsperiode[],
    bestemmelse: string,
    faktiskLagredePerioder: Medlemskapsperiode[],
  ) => Promise<Medlemskapsperiode[]>;
  setArrayValideringsfeil: (error?: string) => void;
}

// Bruker omdøpt interface
export function useMedlemskapLagringTrigger({
  medlemskapsperioder,
  lagredeMedlemskapsperioder,
  setLagredeMedlemskapsperioder,
  redigerbart,
  endrerBestemmelse,
  lagreMedlemskapsperioderPaagar,
  setLagreMedlemskapsperioderPaagar,
  trigger,
  setValue,
  bestemmelse,
  lagreMedlemskapsperioder,
  setArrayValideringsfeil,
}: UseMedlemskapLagringTriggerProps) {
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder.length);
  const debouncedLagreMedlemskapsperioderRef = useRef<any>(null);

  // Debounced lagringsfunksjon
  const debouncedLagreMedlemskapsperioder = useCallback(
    (medlemskapsperioderFormValues: Medlemskapsperiode[], callbackEtterLagring?: () => void) => {
      console.log("*** Kaller lagreMedlemskapsperioder via debounce ***", medlemskapsperioderFormValues);
      lagreMedlemskapsperioder(medlemskapsperioderFormValues, bestemmelse || "", lagredeMedlemskapsperioder)
        .then((oppdaterteMedlemskapsperioder) => {
          console.log("*** lagreMedlemskapsperioder ferdig, oppdaterte: ***", oppdaterteMedlemskapsperioder);
          // Oppdater både lokal state og RHF state
          setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
          setValue("medlemskapsperioder", oppdaterteMedlemskapsperioder, { shouldValidate: false, shouldDirty: false });
        })
        .catch((error) => {
          console.error("*** Feil under lagring av medlemskapsperioder (debounce): ***", error);
          // Kan potensielt sette en feilmelding her hvis nødvendig
        })
        .finally(() => {
          if (callbackEtterLagring) callbackEtterLagring();
        });
    },
    [lagreMedlemskapsperioder, bestemmelse, setValue, lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder],
  );

  // Sett opp ref til den debounced funksjonen
  useEffect(() => {
    debouncedLagreMedlemskapsperioderRef.current = Utils._debounce(debouncedLagreMedlemskapsperioder, 350);
    // Rydd opp debounce ved unmount/endring
    return () => {
      debouncedLagreMedlemskapsperioderRef.current?.cancel?.();
    };
  }, [debouncedLagreMedlemskapsperioder]);

  // Funksjon for å eksplisitt kansellere en pågående debounce
  const cancelDebouncedLagring = useCallback(() => {
    console.log("*** Cancelling debounced medlemskap save ***");
    debouncedLagreMedlemskapsperioderRef.current?.cancel?.();
  }, []);

  // Effekt for å trigge lagring av medlemskapsperioder
  useEffect(() => {
    const lagreMedlemskapsperioderEffect = async () => {
      // Hopp over hvis ikke redigerbart, bestemmelse endres, eller lagring allerede pågår
      if (redigerbart && !endrerBestemmelse && !lagreMedlemskapsperioderPaagar) {
        // Sjekk om antall perioder har endret seg (legg til/fjern)
        if (medlemskapsperioder.length !== medlemskapsperioderForrigeAntall.current) {
          console.log("*** Antall perioder endret (legg til/fjern), skipper lagring denne runden ***");
          medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;
          // Nullstill potensielle gap/overlapp-feil fra legg til/fjern
          setArrayValideringsfeil(undefined);
          return;
        }

        // Sjekk om bruker har gjort endringer i selve periodene
        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
          console.log("*** Medlemskap: Ingen brukerendringer detektert, skipper lagring ***");
          return;
        }

        console.log("*** Medlemskap brukerendringer oppdaget, validerer... ***");
        // Trigger RHF-validering for medlemskapsperioder
        const erGyldigSkjema = await trigger("medlemskapsperioder");
        if (!erGyldigSkjema || !bestemmelse) {
          console.log("*** Medlemskap skjema ikke gyldig eller bestemmelse mangler, skipper lagring ***", {
            erGyldigSkjema,
            bestemmelse,
          });
          // Ikke nullstill arrayValideringsfeil her, RHF håndterer felt-nivå feil
          return;
        }

        // Sjekk spesifikt for gap/overlapp feil
        const medlemskapPeriodeFeil = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
        if (medlemskapPeriodeFeil) {
          console.log(
            "*** Medlemskap periode validering feilet (gap/overlap), stopper lagring ***",
            medlemskapPeriodeFeil,
          );
          setArrayValideringsfeil(medlemskapPeriodeFeil);
          return;
        }
        // Nullstill gap/overlapp feil hvis validering passerer nå
        setArrayValideringsfeil(undefined);

        console.log("*** Medlemskap skjema gyldig, setter lagring pågår og kaller debounce ***");
        setLagreMedlemskapsperioderPaagar(true);
        // Klon med standard JSON metoder for dyp kloning
        const medlemskapsperioderTilLagring = JSON.parse(JSON.stringify(medlemskapsperioder));
        // Kall den debounced lagringsfunksjonen via ref
        debouncedLagreMedlemskapsperioderRef.current?.(medlemskapsperioderTilLagring, () => {
          console.log("*** Medlemskap debounce callback: Setter lagring pågår til false ***");
          setLagreMedlemskapsperioderPaagar(false);
        });
      }
    };
    lagreMedlemskapsperioderEffect();
  }, [
    // Direkte dependencies fra props
    medlemskapsperioder,
    redigerbart,
    endrerBestemmelse,
    bestemmelse,
    lagredeMedlemskapsperioder,
    lagreMedlemskapsperioderPaagar,
    trigger, // Stabil RHF funksjon
    setArrayValideringsfeil, // Stabil state setter
    setLagreMedlemskapsperioderPaagar, // Stabil state setter
    // Stabile refs/funksjoner avledet i hooken
    debouncedLagreMedlemskapsperioderRef, // Avhenger av debounce funksjonen
  ]);

  // Returner funksjonen for å kansellere
  return { cancelDebouncedLagring };
}
