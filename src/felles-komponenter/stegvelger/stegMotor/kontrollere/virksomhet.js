import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVirksomhet from '../../stegKomponenter/vurderingVirksomhet';
import {
  VurderingVirksomhetTyper,
  VurderingYrkesaktivitetTyper,
  VurderingYrkesaktivitetAntallLandTyper,
  VurderingYrkesgruppeTyper
} from '../../../../kodeverk/koder';

class Virksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'yrkesgruppeType ER LIK "ARBEIDSTAKER" OG yrkesaktivitetType ER LIK "INGEN_AV_DISSE" OG antallLand ER LIK "TO_ELLER_FLERE_LAND" OG aktivitetINorge ER LIK "UNDER_25_PROSENT"',
        exec: ({
          yrkesgruppeType, ansattISektor, antallLand, aktivitetINorge,
        }) => (
          yrkesgruppeType === VurderingYrkesgruppeTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingYrkesaktivitetTyper.INGEN_AV_DISSE &&
          antallLand === VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'yrkesgruppeType ER LIK "SELVSTENDIG" OG ENTEN antallLand ER LIK "TO_ELLER_FLERE_LAND"',
        exec: ({ yrkesgruppeType, antallLand }) => (
          yrkesgruppeType === VurderingYrkesgruppeTyper.SELVSTENDIG &&
          antallLand === VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.VIRKSOMHET;
    this._tittel = 'Arbeids\u00ADmønster';
    this._komponent = VurderingVirksomhet;
    this._samleRelevanteData = () => ({ });
    this._beregnRelevantUI = () => ({
      visVekslingMellomLand: true,
      visMarginaltArbeid: true,
      visAktivitetINorge: true,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Virksomhet;
