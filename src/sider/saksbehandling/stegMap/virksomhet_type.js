import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVirksomhetType from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVirksomhetType';
import * as KV from '../../../kodeverk';

class VirksomhetType extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: ({
          yrkesgruppeType, ansattISektor, antallLand, aktivitetINorge,
        }) => (
          yrkesgruppeType === KV.Koder.VurderingYrkesgruppeTyper.ARBEIDSTAKER &&
          ansattISektor === KV.Koder.VurderingYrkesaktivitetTyper.INGEN_AV_DISSE &&
          antallLand === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND &&
          aktivitetINorge === KV.Koder.VurderingVirksomhetTyper.UNDER_25_PROSENT
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        exec: ({ yrkesgruppeType, antallLand }) => (
          yrkesgruppeType === KV.Koder.VurderingYrkesgruppeTyper.SELVSTENDIG &&
          antallLand === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.VIRKSOMHET_TYPE;
    this.tittel = 'Arbeids\u00ADmønster';
    this.komponent = VurderingVirksomhetType;
    this.samleRelevanteData = () => ({ });
    this.beregnRelevantUI = () => ({
      visVekslingMellomLand: true,
      visMarginaltArbeid: true,
      visAktivitetINorge: true,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default VirksomhetType;
