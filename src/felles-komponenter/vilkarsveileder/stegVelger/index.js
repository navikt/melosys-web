import Inngang from './inngang';
import Periode from './periode';

class StegVelger {
  constructor(faktaavklaring){
    this._faktaavklaring = faktaavklaring;
    this._stegLeksikon = {
      INNGANG: Inngang,
      PERIODE: Periode,
    };
  }

  stegKlasse = stegID => this._stegLeksikon[stegID] || false;

  beregnAlleSteg = () => {
    const forsteStegID = 'INNGANG';

    let steg;
    const stegSamling = [];
    steg = this.hentSteg(forsteStegID);
    stegSamling.push(steg.byggSteg());
    steg = this.hentSteg(steg.nesteSteg());
    stegSamling.push(steg.byggSteg());

    console.log(stegSamling);
  }

  hentSteg = stegID => {
    const StegKlasse = this.stegKlasse(stegID);
    const steget = new StegKlasse(this._faktaavklaring);
    return steget;
  }
}

export default StegVelger;
