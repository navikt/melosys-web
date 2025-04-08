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
    lagredePerioder: Medlemskapsperiode[],
    index: number,
    bestemmelse: string,
  ) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(periode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(periode.tomDato, "") as string,
      trygdedekning: periode.trygdedekning,
      bestemmelse: bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const lagretMedlemskapsperiode = lagredePerioder[index];
    const harEndringer =
      !lagretMedlemskapsperiode ||
      periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID ||
      periode.fomDato !== lagretMedlemskapsperiode.fomDato ||
      periode.tomDato !== lagretMedlemskapsperiode.tomDato ||
      periode.trygdedekning !== lagretMedlemskapsperiode.trygdedekning;

    if (harEndringer) {
      try {
        const response: any = await (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID
          ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
          : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
              behandlingID,
              periode.id,
              periodeRequest,
            ));

        return response;
      } catch (error) {
        setFeilmelding("Feil ved lagring av medlemskapsperiode");
        console.error("Feil ved lagring av medlemskapsperiode:", error);
        return undefined;
      }
    }

    return undefined;
  };

  const lagreMedlemskapsperioder = useCallback(
    async (medlemskapsperioderFormValues: Medlemskapsperiode[], bestemmelse: string) => {
      interface LagredeMedlemskapsperioder extends Medlemskapsperiode {
        formValuesIndex: number;
      }

      const endredeMedlemskapsperioder: LagredeMedlemskapsperioder[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
        const lagretPeriode = await lagreMedlemskapsperiodeHvisEndret(
          periode, 
          medlemskapsperioderFormValues, 
          index, 
          bestemmelse
        );
        if (lagretPeriode)
          endredeMedlemskapsperioder.push({
            ...(lagretPeriode as Medlemskapsperiode),
            formValuesIndex: index,
          });
      }

      if (endredeMedlemskapsperioder.length > 0) {
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

        console.log("oppdaterteMedlemskapsperioder", oppdaterteMedlemskapsperioder);
        
        return oppdaterteMedlemskapsperioder;
      }
      
      return medlemskapsperioderFormValues;
    },
    [],
  );

  const slettMedlemskapsperiode = async (
    index: number, 
    medlemskapsperioder: Medlemskapsperiode[], 
    medlemskapsperioderRemove: (index: number) => void
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