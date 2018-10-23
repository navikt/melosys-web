class Steg {
  constructor (propsLight, posisjon) {
    this._propsLight = propsLight;
    this._stegPosisjon = posisjon;
    this._kriterier = null;
    this._id = null;
    this._tittel = null;
    this._komponent = null;
    this._samleRelevanteData = null;
    this._beregnRelevantUI = null;
  }

  get id() {
    return this._id;
  }

  get dataHenter() {
    return this._dataHenter;
  }

  byggSteg = () => ({
    id: this._id,
    komponent: this._komponent,
    status: this._status,
    tittel: this._tittel,
    handlers: this._handlers,
    data: { ...this._samleRelevanteData(this._propsLight), tilstand: this._beregnRelevantUI(this._propsLight) },
    stegPosisjon: this._stegPosisjon,
    aktivtSteg: false,
  });

  nesteSteg = () => {
    const { avklartefakta = [], vilkar = [] } = this._propsLight;

    const kriterieMatch = this._kriterier.find(kriterie => {
      const { exec } = kriterie;
      return this.assertRegel(exec, avklartefakta, vilkar);
    });

    return kriterieMatch.nesteSteg;
  };

  assertRegel = (regel, avklartefakta, vilkar) => {
    if (typeof regel !== 'function') { return false; }

    return regel(avklartefakta, vilkar);
  }
}

export default Steg;
