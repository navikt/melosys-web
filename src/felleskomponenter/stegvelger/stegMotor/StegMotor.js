class StegMotor {
  _propsLight;
  constructor(props, stegMap, forsteSteg) {
    this._propsLight = props;
    this._stegMap = stegMap;
    this._forsteSteg = forsteSteg;
  }

  beregnAlleSteg = () => {
    let gjeldendeSteg = null;
    const stegSamling = [];

    let iterations = 0;

    do {
      const nesteStegPosisjon = stegSamling.length;
      gjeldendeSteg = this.beregnNesteSteg(gjeldendeSteg, nesteStegPosisjon);
      if (gjeldendeSteg) { stegSamling.push(gjeldendeSteg.byggSteg()); }
      iterations += 1;
    } while (gjeldendeSteg && iterations < 30);

    return stegSamling;
  };

  beregnNesteSteg = (gjeldendeSteg, nesteStegPosisjon) => {
    if (gjeldendeSteg === null) {
      return this.lagKlasseBasertPaID(this._forsteSteg, 0);
    }
    const nesteSteg = gjeldendeSteg.nesteSteg();
    return nesteSteg && this.lagKlasseBasertPaID(gjeldendeSteg.nesteSteg(), nesteStegPosisjon);
  };

  lagKlasseBasertPaID = (stegID, stegPosisjon) => {
    const StegKlasse = this._stegMap.get(stegID);
    if (!StegKlasse) { return false; }
    return new StegKlasse(this._propsLight, stegPosisjon);
  };
}

export default StegMotor;
