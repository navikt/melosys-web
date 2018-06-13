import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
import VurderingSektor, { VurderingSektorTyper } from '../../vurderinger/vurderingSektor';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Sektor extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
    this._kriterier = [
      {
        beskrivelse: 'ansattISektor ER LIK "OFFENTLIG"',
        exec: ({ ansattISektor }) => ansattISektor === VurderingSektorTyper.OFFENTLIG,
        nesteSteg: STEG.TJENESTEMANN,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG ansattISektor ER LIK "SOKKEL"',
        exec: ({ sysselsettingType, ansattISektor }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingSektorTyper.SOKKEL
        ),
        nesteSteg: STEG.AKTIVITET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.YRKESAKTIVITET_FORDELING,
      },
    ];
    this._id = STEG.SEKTOR;
    this._komponent = VurderingSektor;
  }
}

export default Sektor;
