class Steg {
  constructor (faktaavklaring) {
    this._faktaavklaring = faktaavklaring;
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

  byggSteg = () => ({
    id: this._id,
    komponent: this._komponent,
    status: this._status,
    handlers: this._handlers,
    dataHenter: this._dataHenter,
    tilstandHenter: this._tilstand,
  })

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
