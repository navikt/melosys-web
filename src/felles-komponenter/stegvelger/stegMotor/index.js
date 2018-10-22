import * as Kontrollere from './kontrollere';

class StegMotor {
  constructor(props) {
    this._propsLight = props;
    this._forsteStegID = 'INNGANG';
  }

  beregnAlleSteg = () => {
    let gjeldendeSteg = null;
    const stegSamling = [];

    let iterations = 0;

    do {
      const nesteStegPosisjon = stegSamling.length;
      gjeldendeSteg = this.beregnNesteSteg(gjeldendeSteg, nesteStegPosisjon);
      stegSamling.push(gjeldendeSteg.byggSteg());
      iterations += 1;
    } while (gjeldendeSteg.id !== 'VEDTAK' && iterations < 30);

    return stegSamling;
  };

  beregnNesteSteg = (gjeldendeSteg, nesteStegPosisjon) => {
    if (gjeldendeSteg === null) {
      return this.lagKlasseBasertPaID(this._forsteStegID, 0);
    }
    return this.lagKlasseBasertPaID(gjeldendeSteg.nesteSteg(), nesteStegPosisjon);
  };

  lagKlasseBasertPaID = (stegID, stegPosisjon) => {
    const StegKlasse = this.beregnStegKlasseFraID(stegID);
    return new StegKlasse(this._propsLight, stegPosisjon);
  };

  /** Transformer uppercase ID til camelback. Feks YRKESAKTIVITET_ANTALL_LAND => YrkesaktivitetAntallLand.
   *
   * @param ID
   * @returns {*}
   */
  beregnStegKlasseFraID = ID => {
    const kontrollerNavn = ID
      .toLowerCase()
      .split('_')
      .map(part => `${part.charAt(0).toUpperCase()}${part.substr(1)}`)
      .join('');
    return Kontrollere[kontrollerNavn];
  }
}

export default StegMotor;
