import * as Kontrollere from './kontrollere';


class StegVelger {
  constructor(faktaavklaring) {
    this._faktaavklaring = faktaavklaring;
  }


  beregnAlleSteg = () => {
    const forsteStegID = 'INNGANG';

    let steg;
    const stegSamling = [];
    steg = this.hentSteg(forsteStegID);
    stegSamling.push(steg.byggSteg());
    steg = this.hentSteg(steg.nesteSteg());
    stegSamling.push(steg.byggSteg());
    steg = this.hentSteg(steg.nesteSteg());
    stegSamling.push(steg.byggSteg());
    steg = this.hentSteg(steg.nesteSteg());
    stegSamling.push(steg.byggSteg());

    console.log(stegSamling);
  }

  hentSteg = stegID => {
    const StegKlasse = this.kontrollerOppslag(stegID);
    const steget = new StegKlasse(this._faktaavklaring);
    return steget;
  }

  kontrollerOppslag = ID => {
    const kontrollerNavn = ID
      .toLowerCase()
      .split('_')
      .map(part => `${part.charAt(0).toUpperCase()}${part.substr(1)}`)
      .join('');
    return Kontrollere[kontrollerNavn];
  }
}

export default StegVelger;
