import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSysselsetting, { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Sysselsetting extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this._kriterier = [
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" eller sysselsettingType ER LIK "ARBEIDSTAKER__OG__SELVSTENDIG"',
        exec: ({ sysselsettingType }) => sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER,
        nesteSteg: STEG.ARBEIDSFORHOLD,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "SELVSTENDIG" eller sysselsettingType ER LIK "ARBEIDSTAKER_OG_SELVSTENDIG"',
        exec: ({ sysselsettingType }) => sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG || sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG,
        nesteSteg: STEG.YRKESAKTIVITET_FORDELING,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "IKKE_ARBEIDENDE" eller sysselsettingType ER LIK "ARBEIDSTAKER_OG_SELVSTENDIG"',
        exec: ({ sysselsettingType }) => sysselsettingType === VurderingSysselsettingTyper.IKKE_ARBEIDENDE,
        nesteSteg: STEG.IKKE_YRKESAKTIV,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ];
    this._id = STEG.SYSSELSETTING;
    this._tittel = 'Aktivitet';
    this._komponent = VurderingSysselsetting;
    this._samleRelevanteData = () => ({ });
    this._beregnRelevantUI = () => ({
      visSysselsettingType: true,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Sysselsetting;
