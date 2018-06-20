class Steg {
  constructor (propsLight, posisjon) {
    this._propsLight = propsLight;
    this._stegPosisjon = posisjon;
    this._kriterier = null;
    this._id = null;
    this._komponent = null;
    this._dataHenter = null;
    this._tilstand = null;
  }

  get id() {
    return this._id;
  }

  get dataHenter() {
    return this._dataHenter;
  }

  byggSteg = () => {
    return ({
      id: this._id,
      komponent: this._komponent,
      status: this._status,
      handlers: this._handlers,
      data: { ...this._dataHenter(this._propsLight), tilstand: this._tilstand(this._propsLight) },
      stegPosisjon: this._stegPosisjon,
    });
  };

  nesteSteg = () => {
    const kriterieMatch = this._kriterier.find(kriterie => {
      const { exec } = kriterie;
      return this.assertRegel(exec, this._propsLight.faktaavklaring);
    });

    return kriterieMatch.nesteSteg;
  }

  assertRegel = (regel, faktaavklaring) => {
    if (typeof regel !== 'function') { return false; }

    return regel(faktaavklaring);
  }
}

export default Steg;
