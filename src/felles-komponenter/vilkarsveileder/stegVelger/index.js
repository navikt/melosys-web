import * as Kontrollere from './kontrollere';


class StegVelger {
  constructor(faktaavklaring) {
    this._faktaavklaring = faktaavklaring;
    this._forsteStegID = 'INNGANG';
  }

  beregnAlleSteg = () => {
    let gjeldendeSteg = null;
    const stegSamling = [];

    do {
      gjeldendeSteg = this.beregnNesteSteg(gjeldendeSteg);
      stegSamling.push(gjeldendeSteg.byggSteg({
        stegPosisjon: stegSamling.length,
        faktaavklaring: this._faktaavklaring,
      }));
    } while (gjeldendeSteg.id !== 'VEDTAK');

    return stegSamling;
  }

  beregnNesteSteg = gjeldendeSteg => {
    if (gjeldendeSteg === null) {
      return this.lagKlasseBasertPaID(this._forsteStegID);
    }
    return this.lagKlasseBasertPaID(gjeldendeSteg.nesteSteg());
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
