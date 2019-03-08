import * as MKV from 'melosys-kodeverk';

import { stegKatalogMap } from './kontrollere';

class StegMotor {
  constructor(props) {
    this._propsLight = props;
    this._forsteStegID = 'INNGANG';
    this._endrePeriodeStegID = 'ENDRE_PERIODE';
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
      if (this._propsLight.behandlingstype.kode === MKV.Koder.behandlinger.typer.ENDRET_PERIODE) {
        return this.lagKlasseBasertPaID(this._endrePeriodeStegID, 0);
      }
      return this.lagKlasseBasertPaID(this._forsteStegID, 0);
    }
    const nesteSteg = gjeldendeSteg.nesteSteg();
    return nesteSteg && this.lagKlasseBasertPaID(gjeldendeSteg.nesteSteg(), nesteStegPosisjon);
  };

  lagKlasseBasertPaID = (stegID, stegPosisjon) => {
    const StegKlasse = stegKatalogMap.get(stegID);
    if (!StegKlasse) { return false; }
    return new StegKlasse(this._propsLight, stegPosisjon);
  };
}

export default StegMotor;
