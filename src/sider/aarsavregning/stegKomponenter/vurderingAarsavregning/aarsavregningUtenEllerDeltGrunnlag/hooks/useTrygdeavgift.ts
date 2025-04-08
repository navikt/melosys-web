import { useCallback } from "react";
import * as Api from "../../../../../../services/api";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";
import { FieldValue } from "react-hook-form";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { beregnTrygdeavgiftsperioder as beregnTrygdeavgiftsperioderOriginal } from "../../komponenter/utils";

/**
 * Hook for å håndtere API-kall relatert til trygdeavgift (beregning og oppdatering).
 */
export const useTrygdeavgift = (behandlingID: number, aarsavregningID?: number) => {
  // Wrapper rundt den faktiske beregningslogikken (i utils)
  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (
      formVerdier: FieldValue<AarsavregningFormValuesProps>,
      options: {
        behandlingID: number;
        medlemskapstypeErPliktig: boolean;
        setFeilmelding: (feilmelding: string | undefined) => void;
        setAarsavregningResponse: (response: AarsavregningResponse) => void;
      },
    ) => {
      // Kaller den importerte hjelpefunksjonen
      return beregnTrygdeavgiftsperioderOriginal(formVerdier, options);
    },
    [], // Tom dependency-array siden den kun bruker importert funksjon og props
  );

  // Direkte kall til API for å oppdatere totalt forskuddsvis fakturert
  const handleOppdaterTotaltForskuddsvisFakturert = async (
    behandlingid: number,
    request: Api.Aarsavregning.AarsavregningRequest,
    aarsavregningid?: number,
  ) => {
    return Api.Aarsavregning.oppdaterAarsavregning(behandlingid, request, aarsavregningid);
  };

  return {
    handleBeregnTrygdeavgiftsperioder,
    handleOppdaterTotaltForskuddsvisFakturert,
  };
};
