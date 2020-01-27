import Steg from '../komponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../komponenter/stegvelger/stegMotor/typer';
import VurderingVirksomhetType from '../komponenter/stegvelger/stegKomponenter/vurderingVirksomhetType';
import * as KV from '../../../kodeverk';

class VirksomhetType extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'yrkesgruppeType ER LIK "ARBEIDSTAKER" OG yrkesaktivitetType ER LIK "INGEN_AV_DISSE" OG antallLand ER LIK "TO_ELLER_FLERE_LAND" OG aktivitetINorge ER LIK "UNDER_25_PROSENT"',
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
        beskrivelse: 'yrkesgruppeType ER LIK "SELVSTENDIG" OG ENTEN antallLand ER LIK "TO_ELLER_FLERE_LAND"',
        exec: ({ yrkesgruppeType, antallLand }) => (
          yrkesgruppeType === KV.Koder.VurderingYrkesgruppeTyper.SELVSTENDIG &&
          antallLand === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'alle andre valg',
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
