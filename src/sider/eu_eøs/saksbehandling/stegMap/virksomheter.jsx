import { Virksomheter } from "../../stegMap";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import * as KV from "../../../../kodeverk";

import SokkelSkip from "./sokkel_skip";
import Yrkesgruppe from "./yrkesgruppe";

class SaksbehandlingVirksomheter extends Virksomheter {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(propsLight.avklartefakta);
    const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(
      propsLight.avklartefakta,
      KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP
    );
    const gårDirekteTilArtikkel16 = Yrkesgruppe.finnAvklaring(
      propsLight.avklartefakta,
      KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12
    );

    this.kriterier = [
      {
        exec: () =>
          propsLight.konvensjonStorbritanniaToggleEnabled &&
          harValgtArbeidsgiver &&
          gårDirekteTilArtikkel16 &&
          propsLight.unntaksvilkår?.oppfylt,
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        exec: () => harValgtArbeidsgiver && (gårDirekteTilArtikkel16 || propsLight.erArbeidTjenestepersonEllerFly),
        nesteSteg: STEG.MEDFOLGENDE_BARN,
      },
      {
        exec: () => {
          const erToEllerFlereLand = propsLight.erSoknadArbeidFlereLand;

          return harValgtArbeidsgiver && erToEllerFlereLand;
        },
        nesteSteg: STEG.VURDER_ARBEIDSLAND,
      },
      {
        exec: (avklartefakta) => {
          const erVanligYrkesaktiv = Virksomheter.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingYrkesgruppeTyper.ORDINAER
          );
          const erFlyendePersonell = Virksomheter.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL
          );
          const erSokkelUtland = SokkelSkip.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND
          );

          return (
            harValgtArbeidsgiver &&
            (erVanligYrkesaktiv || erFlyendePersonell || (arbeiderPaSokkelEllerSkip && erSokkelUtland))
          );
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        exec: (avklartefakta) => {
          const erSkipEttLand = SokkelSkip.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND
          );
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSkipEttLand;
        },
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ];
  }
}

export default SaksbehandlingVirksomheter;
