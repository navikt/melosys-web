import { useCallback } from "react";
import * as Api from "../../../../../../services/api";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";
import { FieldValue } from "react-hook-form";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { beregnTrygdeavgiftsperioder as beregnTrygdeavgiftsperioderOriginal } from "../../komponenter/utils";

export const useTrygdeavgift = (behandlingID: number, aarsavregningID?: number) => {
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
      return beregnTrygdeavgiftsperioderOriginal(formVerdier, options);
    },
    [],
  );

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
