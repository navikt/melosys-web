import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { useAsyncCallbackState } from "../../../../hooks";
import * as Api from "../../../../services/api";

export const VurderingAarsavregning = () => {
  const [lagretTrygdeavgift] = useAsyncCallbackState(
    () => Api.Aarsavregning.hentAvregningsData(1), // TODO bruk korrekt avregningsID
    undefined,
    []
  );

  return (
    <div>
      <h1>Årsavregning</h1>
      #TODO Skal kun vise dersom eksisterende det finnes data for tidligere år
      <div className="dd">test</div>
      <TrygdeavgiftsperioderTabell perioder={lagretTrygdeavgift.tidligereOpplysninger?.avgift.trygdeavgiftsperioder} />
    </div>
  );
};
