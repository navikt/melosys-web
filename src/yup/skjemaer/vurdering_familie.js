import { object, string } from "yup";
import { BOOLSK_STRING } from "../../constants";

const NOE_SKJEDDE = { melding: "Noe skjedde" };

function manglerObligatoriskeFelt(medfolgendeBarn, medfolgendeEktefelleSamboer, barn, ektefelle_samboer) {
  if (!medfolgendeBarn || !medfolgendeEktefelleSamboer || !barn || !ektefelle_samboer) return true;
  if (
    medfolgendeBarn.some(
      (familiemedlem) =>
        !barn ||
        !barn[familiemedlem.uuid] ||
        !barn[familiemedlem.uuid].innvilget ||
        (barn[familiemedlem.uuid].innvilget === BOOLSK_STRING.USANN && !barn[familiemedlem.uuid].begrunnelse)
    )
  )
    return true;
  if (
    medfolgendeEktefelleSamboer.some(
      (familiemedlem) =>
        !ektefelle_samboer ||
        !ektefelle_samboer[familiemedlem.uuid] ||
        !ektefelle_samboer[familiemedlem.uuid].innvilget ||
        (ektefelle_samboer[familiemedlem.uuid].innvilget === BOOLSK_STRING.USANN &&
          !ektefelle_samboer[familiemedlem.uuid].begrunnelse)
    )
  )
    return true;

  return false;
}

const vurdering_familie = object().shape({
  barn: object().nullable(),
  ektefelle_samboer: object().nullable(),
  alleFamiliemedlemmerErDekket: string().when(
    ["$medfolgendeBarn", "$medfolgendeEktefelleSamboer", "barn", "ektefelle_samboer"],
    {
      is: manglerObligatoriskeFelt,
      then: string().required(NOE_SKJEDDE),
    }
  ),
});

export { vurdering_familie };
