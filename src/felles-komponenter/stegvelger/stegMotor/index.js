import * as Kontrollere from './kontrollere';
import { StegTilKontroller } from './typer';
import { behandlinger } from '../../../kodeverk/koder';

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
      if (this._propsLight.behandlingstype.kode === behandlinger.ENDRET_PERIODE) {
        return this.lagKlasseBasertPaID(this._endrePeriodeStegID, 0);
      }
      return this.lagKlasseBasertPaID(this._forsteStegID, 0);
    }
    const nesteSteg = gjeldendeSteg.nesteSteg();
    return nesteSteg && this.lagKlasseBasertPaID(gjeldendeSteg.nesteSteg(), nesteStegPosisjon);
  };

  lagKlasseBasertPaID = (stegID, stegPosisjon) => {
    const StegKlasse = this.beregnStegKlasseFraID(stegID);
    if (!StegKlasse) { return false; }
    return new StegKlasse(this._propsLight, stegPosisjon);
  };

  /** Transformer uppercase ID til camelback. Feks YRKESAKTIVITET_ANTALL_LAND => YrkesaktivitetAntallLand.
   *
   * @param ID
   * @returns {*}
   */
  beregnStegKlasseFraID = ID => {
    const kontrollerNavn = StegTilKontroller[ID];
    return Kontrollere[kontrollerNavn];
  }
}

export default StegMotor;
