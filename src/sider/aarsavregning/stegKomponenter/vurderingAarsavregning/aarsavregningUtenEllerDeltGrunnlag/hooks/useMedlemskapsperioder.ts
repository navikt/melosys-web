import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import * as Utils from "../../../../../../utils";
import * as Api from "../../../../../../services/api";
import { medlemskapsperioderOperations } from "../../../../../../ducks/medlemskapsperioder";
import {
  Medlemskapsperiode,
  OppdaterMedlemskapsperiode,
} from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import MKV from "../../../../../../melosyskodeverk";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "../aarsavregningUtenEllerDeltGrunnlag";
import { hentMedlemskapsFomTomDato } from "../../aarsavregningHelpers";

export const useMedlemskapsperioder = (behandlingID: number) => {
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [lagreMedlemskapsperioderPaagar, setLagreMedlemskapsperioderPaagar] = useState(false);
  const dispatch = useDispatch();

  const finnMedlemskapsperiode = useCallback((perioder: Medlemskapsperiode[]) => {
    const sorterteGyldigePerioder = perioder
      .filter((periode: Medlemskapsperiode) => periode.fomDato && periode.tomDato)
      .sort(Utils.dato.sorterEtterNorskFomDato);
    const medlemskapsperiodeFomTom = hentMedlemskapsFomTomDato(sorterteGyldigePerioder);

    console.log("medlemskapsperiodeFomTom", medlemskapsperiodeFomTom);
    console.log("sorterteGyldigePerioder", sorterteGyldigePerioder);
    console.log("perioder", perioder);

    return {
      fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiodeFomTom?.fom),
      tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiodeFomTom?.tom),
    };
  }, []);

  const lagreMedlemskapsperiodeHvisEndret = async (
    periode: Medlemskapsperiode,
    faktiskLagredePerioder: Medlemskapsperiode[],
    index: number,
    bestemmelse: string,
  ) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(periode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(periode.tomDato, "") as string,
      trygdedekning: periode.trygdedekning,
      bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const sistLagretPeriode = faktiskLagredePerioder[index];
    console.log(`*** Sammenligner for index ${index}:`, { current: periode, lastSaved: sistLagretPeriode });

    const harEndringer =
      !sistLagretPeriode ||
      periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID ||
      periode.fomDato !== sistLagretPeriode.fomDato ||
      periode.tomDato !== sistLagretPeriode.tomDato ||
      periode.trygdedekning !== sistLagretPeriode.trygdedekning;

    console.log(`*** Har endringer for index ${index}?`, harEndringer);

    if (harEndringer) {
      console.log(
        `*** Sender ${periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID ? "opprett" : "oppdater"} request for index ${index} ***`,
      );
      try {
        const response: any = await (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID
          ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
          : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
              behandlingID,
              periode.id,
              periodeRequest,
            ));
        console.log(`*** Respons for index ${index}:`, response);
        return response;
      } catch (error) {
        setFeilmelding("Feil ved lagring av medlemskapsperiode");
        console.error(`*** Feil ved lagring av medlemskapsperiode index ${index}:`, error);
        throw error;
      }
    }
    console.log(`*** Ingen endringer for index ${index}, skipper API kall ***`);
    return undefined;
  };

  const lagreMedlemskapsperioder = useCallback(
    async (
      medlemskapsperioderFormValues: Medlemskapsperiode[],
      bestemmelse: string,
      lagredeMedlemskapsperioderFraState: Medlemskapsperiode[],
    ) => {
      interface LagredeMedlemskapsperioder extends Medlemskapsperiode {
        formValuesIndex: number;
      }

      const endredeMedlemskapsperioder: LagredeMedlemskapsperioder[] = [];
      let errorOccurred = false;

      const savePromises = medlemskapsperioderFormValues.map((periode, index) =>
        lagreMedlemskapsperiodeHvisEndret(periode, lagredeMedlemskapsperioderFraState, index, bestemmelse)
          .then((lagretPeriode) => {
            if (lagretPeriode) {
              endredeMedlemskapsperioder.push({
                ...(lagretPeriode as Medlemskapsperiode),
                formValuesIndex: index,
              });
            }
            return { status: "fulfilled", value: lagretPeriode, index };
          })
          .catch((error) => {
            errorOccurred = true;
            return { status: "rejected", reason: error, index };
          }),
      );

      const results = await Promise.allSettled(savePromises);
      console.log("*** Resultater fra Promise.allSettled (lagring):", results);

      if (errorOccurred) {
        console.error("En eller flere medlemskapsperioder feilet under lagring.");
        return medlemskapsperioderFormValues;
      }

      if (endredeMedlemskapsperioder.length > 0) {
        console.log("*** Minst én periode ble lagret/oppdatert, merger resultater... ***");
        setFeilmelding(undefined);

        const oppdaterteMedlemskapsperioder = medlemskapsperioderFormValues.map((periode: any, index: number) => {
          const lagretPeriodeMedID = endredeMedlemskapsperioder.find(
            (backendPeriode: any) => backendPeriode.formValuesIndex === index,
          );
          if (lagretPeriodeMedID) {
            return {
              ...periode,
              medlemskapstype: lagretPeriodeMedID.medlemskapstype,
              id: lagretPeriodeMedID.id,
            };
          }
          return periode;
        });

        console.log("*** Ferdig oppdaterte medlemskapsperioder: ***", oppdaterteMedlemskapsperioder);
        return oppdaterteMedlemskapsperioder;
      }

      console.log("*** Ingen perioder trengte API-kall for lagring/oppdatering. ***");
      return medlemskapsperioderFormValues;
    },
    [setFeilmelding],
  );

  const slettMedlemskapsperiode = async (
    index: number,
    medlemskapsperioder: Medlemskapsperiode[],
    medlemskapsperioderRemove: (index: number) => void,
  ) => {
    const periode = medlemskapsperioder[index];

    try {
      setLagreMedlemskapsperioderPaagar(true);
      if (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID) {
        medlemskapsperioderRemove(index);
      } else {
        await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, periode.id);
        medlemskapsperioderRemove(index);
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      }
      setLagreMedlemskapsperioderPaagar(false);
    } catch (error) {
      console.error("Feil ved sletting av medlemskapsperiode:", error);
      setFeilmelding("Feil ved sletting av medlemskapsperiode");
      throw error;
    }
  };

  return {
    feilmelding,
    setFeilmelding,
    lagreMedlemskapsperioderPaagar,
    setLagreMedlemskapsperioderPaagar,
    finnMedlemskapsperiode,
    lagreMedlemskapsperioder,
    slettMedlemskapsperiode,
  };
};
