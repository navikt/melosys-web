import * as Kontrollere from './kontrollere';


class StegVelger {
  constructor(faktaavklaring) {
    this._faktaavklaring = faktaavklaring;
    this._forsteStegID = 'INNGANG';
  }

  beregnAlleSteg = () => {
    let steg = null;
    const stegSamling = [];

    while(steg.id !== undefined) {
      this.beregnNesteSteg(steg);
      stegSamling.push(steg.byggSteg());
    }

    console.log(stegSamling);
  }

  beregnNesteSteg = forrigeSteg => {
    let nesteSteg;
    if (forrigeSteg === null) {
      nesteSteg = this.lagKlasseBasertPaID(this._forsteStegID);
    }


  }

  lagKlasseBasertPaID = stegID => {
    const StegKlasse = this.beregnStegKlasseFraID(stegID);
    const steget = new StegKlasse(this._faktaavklaring);
    return steget;
  }

  beregnStegKlasseFraID = ID => {
    const kontrollerNavn = ID
      .toLowerCase()
      .split('_')
      .map(part => `${part.charAt(0).toUpperCase()}${part.substr(1)}`)
      .join('');
    return Kontrollere[kontrollerNavn];
  }
}

export default StegVelger;
