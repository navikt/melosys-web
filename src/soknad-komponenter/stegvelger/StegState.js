import './stegvelger.css';
import * as Utils from '../../utils';

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

      if (!Utils._isNil(nyData.oppfylt) && !Utils._isUndefined(nyData.oppfylt)) {
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

    if (!Utils._isNil(nyData.fakta) && !Utils._isUndefined(nyData.fakta)) {
      nyttFelt.fakta = nyData.fakta;
    }

    if (!Utils._isNil(nyData.subjektID) && !Utils._isUndefined(nyData.subjektID)) {
      nyttFelt.subjektID = nyData.subjektID;
    }

    return nyttFelt;
  };

  slettSteg = steg => {
    const { stegStore } = this;
    stegStore.delete(steg);
  };

  hent = () => {
    const ressurser = {};
    const { stegStore } = this;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(key => {
        const { oppfylt, begrunnelse, fritekst } = steg[key];
        ressurser[key] = oppfylt;

        if (begrunnelse && begrunnelse.length > 0) {
          ressurser[`${key}_begrunnelser`] = begrunnelse;
        }

        if (fritekst && fritekst.length > 0) {
          ressurser[`${key}_begrunnelser_fritekst`] = fritekst;
        }
      });
    });
    return ressurser;
  };
}

export default StegState;
