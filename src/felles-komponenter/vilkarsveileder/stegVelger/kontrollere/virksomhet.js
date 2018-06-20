import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVirksomhet, { VurderingVirksomhetTyper } from '../../vurderinger/vurderingVirksomhet';
import { VurderingYrkesaktivitetFordelingTyper } from '../../vurderinger/vurderingYrkesaktivitetFordeling';
import { VurderingSektorTyper } from '../../vurderinger/vurderingSektor';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Virksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG sektorINorge ER LIK "INGEN_AV_DISSE" OG antallLand ER LIK "TO_ELLER_FLERE_LAND" OG aktivitetINorge ER LIK "UNDER_25_PROSENT"',
        exec: ({
          sysselsettingType, ansattISektor, antallLand, aktivitetINorge,
        }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingSektorTyper.INGEN_AV_DISSE &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.TO_ELLER_FLERE_LAND &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "SELVSTENDIG" OG ENTEN antallLand ER LIK "TO_ELLER_FLERE_LAND"',
        exec: ({ sysselsettingType, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.TO_ELLER_FLERE_LAND
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
    this._komponent = VurderingVirksomhet;
    this._dataHenter = () => ({ });
    this._tilstand = () => ({
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
