import * as Utils from "../../../utils";

class StegState {
  constructor() {
    this.stegStore = new Map();
  }

  slettStegData = (stegID, data = {}) => {
    const { felt } = data;
    if (this.stegStore.has(stegID)) {
      if (Utils._isNil(felt)) {
        this.slettSteg(stegID);
      } else {
        this.slettFelt(stegID, data);
      }
    }
  };

  slettFelt = (stegID, data) => {
    const { felt } = data;
    const { stegStore } = this;
    const steg = stegStore.get(stegID);
    delete steg[felt];
    stegStore.set(stegID, steg);
  };

  slettFeltIAlleSteg = (data) => {
    const { stegStore } = this;
    stegStore.forEach((_value, key) => {
      this.slettFelt(key, data);
    });
  };

  slettSteg = (stegID) => {
    this.stegStore.delete(stegID);
  };

  oppdaterStegData = (stegID, { felt, innhold }) => {
    const eksisterendeFelt = this.hentStegMedFelt(stegID, felt);
    const oppdatertFelt = this.oppdaterfelt(eksisterendeFelt, innhold);
    this.lagreFelt(stegID, felt, oppdatertFelt);
  };

  oppdaterStegDataIAlleSteg = ({ felt, innhold }) => {
    const { stegStore } = this;
    stegStore.forEach((_value, key) => {
      const eksisterendeFelt = this.hentStegMedFelt(key, felt);
      if (eksisterendeFelt) {
        const oppdatertFelt = this.oppdaterfelt(eksisterendeFelt, innhold);
        this.lagreFelt(key, felt, oppdatertFelt);
      }
    });
  };

  lagreFelt = (stegID, felt, data) => {
    const { stegStore } = this;
    const steg = stegStore.get(stegID);
    steg[felt] = data;
    stegStore.set(stegID, steg);
  };

  hentStegMedFelt = (stegID, felt) => {
    const { stegStore } = this;
    let steg = {};
    if (!stegStore.has(stegID)) {
      stegStore.set(stegID, steg);
    }
    steg = stegStore.get(stegID);
    if (!steg[felt]) {
      const nyttFelt = this.nyttFelt();
      steg[felt] = nyttFelt;
      stegStore.set(stegID, steg);
    }
    return steg[felt];
  };

  nyttFelt = () => ({});
}

export default StegState;
