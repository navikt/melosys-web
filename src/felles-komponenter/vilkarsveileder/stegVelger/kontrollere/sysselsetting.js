import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
import VurderingSysselsetting, { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Sysselsetting extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
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
    this._komponent = VurderingSysselsetting;
  }
}

export default Sysselsetting;
