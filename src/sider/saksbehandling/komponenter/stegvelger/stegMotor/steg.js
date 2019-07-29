import * as Utils from '../../../../../utils';
import { FANE_STATUS } from './typer';

class Steg {
  _id = null;
  _tittel = null;
  _kriterier = null;
  _komponent = null;
  _status = null;
  _samleRelevanteData = null;
  _beregnRelevantUI = null;
  _handlers = null;
  constructor (propsLight, posisjon) {
    this._propsLight = propsLight;
    this._stegPosisjon = posisjon;
  }

  get id() { return this._id; }
  set id(id) { this._id = id; }
  get tittel() { return this._tittel; }
  set tittel(tittel) { this._tittel = tittel; }
  get komponent() { return this._komponent; }
  set komponent(komponent) { this._komponent = komponent; }
  get kriterier() { return this._kriterier; }
  set kriterier(kriterier) { this._kriterier = kriterier; }
  get handlers() { return this._handlers; }
  set handlers(handlers) { this._handlers = handlers; }
  get status() { return this._status; }
  set status(status) { this._status = status; }
  set aktivtSteg(aktiv) { this._aktiv = aktiv; }
  get samleRelevanteData() { return this._samleRelevanteData; }
  set samleRelevanteData(samleRelevanteData) { this._samleRelevanteData = samleRelevanteData; }
  get beregnRelevantUI() { return this._beregnRelevantUI; }
  set beregnRelevantUI(beregnRelevantUI) { this._beregnRelevantUI = beregnRelevantUI; }

  byggSteg = () => ({
    id: this._id,
    komponent: this._komponent,
    tittel: this._tittel,
    handlers: this._handlers, // handlers + data -> propsLight
    data: { ...this._samleRelevanteData(this._propsLight), tilstand: this._beregnRelevantUI(this._propsLight) },
    status: this.hentStatus(),
    stegPosisjon: this._stegPosisjon,
    aktivtSteg: this._aktiv,
  });

  nesteSteg = () => {
    const { avklartefakta = [], vilkar = [] } = this._propsLight;

    const kriterieMatch = this._kriterier.find(kriterie => {
      const { exec } = kriterie;
      return this.assertRegel(exec, avklartefakta, vilkar);
    });

    return kriterieMatch.nesteSteg;
  };

  hentStatus = () => {
    const relevantUI = this.beregnRelevantUI(this._propsLight);
    if (!relevantUI) {
      return FANE_STATUS.FEIL;
    }
    return relevantUI.harAvklaring ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET;
  };

  assertRegel = (regel, avklartefakta, vilkar) => (Utils._isFunction(regel) ? regel(avklartefakta, vilkar) : false);
}

export default Steg;
