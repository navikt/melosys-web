import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
import VurderingBostedsland from '../../vurderinger/vurderingBostedsland';
import { VurderingYrkesaktivitetFordelingTyper } from '../../vurderinger/vurderingYrkesaktivitetFordeling';
import { VurderingVirksomhetTyper } from '../../vurderinger/vurderingVirksomhet';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Bostedsland extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
    this._kriterier = [
      {
        kriterier: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG' +
        'aktivitetINorge ER LIK "UNDER_25_PROSENT" OG bostedsLand INNEHOLDER "NO" OG' +
        'antallLand ER LIK "TO_ELLER_FLERE_LAND"',
        erOppfylt: ({
          antallLand, sysselsettingType, aktivitetINorge, bostedsland = [],
        }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT &&
          bostedsland.includes('NO') &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.TO_ELLER_FLERE_LAND
        ),
        nesteSteg: STEG.FORRETNINGSSTED,
      },
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.BOSTEDSLAND;
    this._komponent = VurderingBostedsland;
  }
}

export default Bostedsland;
