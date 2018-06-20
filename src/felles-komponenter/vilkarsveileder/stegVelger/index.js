import * as Kontrollere from './kontrollere';


class StegVelger {
  constructor(props) {
    this._propsLight = {
      faktaavklaring: props.faktaavklaring,
      inngang: props.inngang,
      skjema: props.skjema
    };
    this._forsteStegID = 'INNGANG';
  }

  beregnAlleSteg = () => {
    let gjeldendeSteg = null;
    const stegSamling = [];

    do {
      const nesteStegPosisjon = stegSamling.length;
      gjeldendeSteg = this.beregnNesteSteg(gjeldendeSteg, nesteStegPosisjon);
      stegSamling.push(gjeldendeSteg.byggSteg());
    } while (gjeldendeSteg.id !== 'VEDTAK');

    return stegSamling;
  }

  beregnNesteSteg = (gjeldendeSteg, nesteStegPosisjon) => {
    if (gjeldendeSteg === null) {
      return this.lagKlasseBasertPaID(this._forsteStegID, 0);
    }
    return this.lagKlasseBasertPaID(gjeldendeSteg.nesteSteg(), nesteStegPosisjon);
  }

  lagKlasseBasertPaID = (stegID, stegPosisjon) => {
    const StegKlasse = this.beregnStegKlasseFraID(stegID);
    const steget = new StegKlasse(this._propsLight, stegPosisjon);
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
