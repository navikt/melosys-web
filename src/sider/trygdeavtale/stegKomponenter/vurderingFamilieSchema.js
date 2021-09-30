import { object, string } from "yup";

import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

import { BOOLSK_STRING } from "../../../constants";
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

function manglerObligatoriskeFelt(tilknyttedeBarn, tilknyttetEktefelle, barn, ektefelle) {
  if (Utils._isEmpty(tilknyttedeBarn) && !tilknyttetEktefelle) return false;
  if (!barn || !ektefelle) return true;

  if (
    tilknyttedeBarn.some(
      (familiemedlem) =>
        !barn ||
        !barn[familiemedlem.uuid] ||
        !barn[familiemedlem.uuid].innvilget ||
        (barn[familiemedlem.uuid].innvilget === BOOLSK_STRING.USANN && !barn[familiemedlem.uuid].begrunnelse)
    )
  )
    return true;
  if (
    tilknyttetEktefelle &&
    (!ektefelle || !ektefelle.innvilget || (ektefelle.innvilget === BOOLSK_STRING.USANN && !ektefelle.begrunnelse))
  )
    return true;

  return false;
}

const vurdering_familie = object().shape({
  barn: object().nullable(),
  ektefelle: object().nullable(),
  alleFamiliemedlemmerErDekket: string().when(["$tilknyttedeBarn", "tilknyttetEktefelle", "barn", "ektefelle"], {
    is: manglerObligatoriskeFelt,
    then: string().required(MAA_FYLLES_UT),
  }),
});

export default vurdering_familie;
