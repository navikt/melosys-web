class Steg {
  constructor (faktaavklaring, skjema) {
    this._faktaavklaring = faktaavklaring;
    this._skjema = skjema;
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

  byggSteg = config => {
    const { stegPosisjon } = config;
    return ({
      id: this._id,
      komponent: this._komponent,
      status: this._status,
      handlers: this._handlers,
      data: { ...this._dataHenter(this._faktaavklaring), tilstand: this._tilstand(this._skjema) },
      stegPosisjon,
    });
  };

  nesteSteg = () => {
    const kriterieMatch = this._kriterier.find(kriterie => {
      const { exec } = kriterie;
      return this.assertRegel(exec, this._faktaavklaring);
    });

    return kriterieMatch.nesteSteg;
  }

  assertRegel = (regel, faktaavklaring) => {
    if (typeof regel !== 'function') { return false; }

    return regel(faktaavklaring);
  }
}

export default Steg;
