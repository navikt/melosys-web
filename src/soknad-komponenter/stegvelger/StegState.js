import './stegvelger.css';

class StegState {
  constructor() {
    this.stegStore = new Map();
  }

  slettStegressurs = (stegID, felt) => {
    const { stegStore } = this;

    if (stegStore.has(stegID)) {
      const steg = stegStore.get(stegID);
      delete steg[felt];
      stegStore.set(stegID, steg);
    }
  };

  oppdaterStegressurs = (stegID, { felt, type, innhold }) => {
    const eksisterendeFeltData = this.hentEksisterendeFelt(stegID, felt);
    if (eksisterendeFeltData) {
      const feltData = this.oppdaterfelt(eksisterendeFeltData, type, innhold);
      this.lagreFelt(stegID, felt, feltData);
    } else {
      this.lagreFelt(stegID, felt, innhold);
    }

    this.konverterStegressursTilRedux();
  };

  lagreFelt = (stegID, felt, data) => {
    const { stegStore } = this;
    let steg = stegStore.get(stegID);
    if (!steg) {
      steg = {};
    }
    steg[felt] = data;
    stegStore.set(stegID, steg);
  };

  hentEksisterendeFelt = (stegID, felt) => {
    const { stegStore } = this;
    if (!stegStore.has(stegID)) {
      return null;
    }
    const steg = stegStore.get(stegID);
    return steg[felt];
  };

  oppdaterfelt = (eksisterendeData, type, nyData) => {
    const fritekst = nyData.fritekst || eksisterendeData.fritekst;
    const begrunnelse = nyData.begrunnelse || eksisterendeData.begrunnelse;

    if (type === 'vilkaar') {
      const { oppfylt } = eksisterendeData;
      const nyttFelt = { oppfylt, begrunnelse, fritekst };

      if (nyData.oppfylt !== null && nyData.oppfylt !== undefined) {
        nyttFelt.oppfylt = nyData.oppfylt;
      }
      return nyttFelt;
    }

    const { fakta, subjektID } = eksisterendeData;
    const nyttFelt = {
      fakta,
      subjektID,
      begrunnelse,
      fritekst,
    };

    if (nyData.fakta !== null && nyData.fakta !== undefined) {
      nyttFelt.fakta = nyData.fakta;
    }

    if (nyData.subjektID !== null && nyData.subjektID) {
      nyttFelt.subjektID = nyData.subjektID;
    }

    return nyttFelt;
  };

  slettStegressurser = steg => {
    const { stegStore } = this;
    stegStore.delete(steg);
  };

  konverterStegressursTilRedux = () => {
    const vilkaar = {};
    const { stegStore } = this;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(key => {
        const { oppfylt, begrunnelse } = steg[key];
        vilkaar[key] = oppfylt;

        if (begrunnelse && begrunnelse.length > 0) {
          vilkaar[`${key}Begrunnelser`] = begrunnelse;
        }
      });
    });
    return vilkaar;
  };
}

export default StegState;
