import StegState from './StegState';
import * as Utils from '../../../utils';

class VilkaarStore extends StegState {
  oppdaterfelt = (eksisterendeData, type, nyData) => {
    const fritekst = nyData.fritekst || eksisterendeData.fritekst;
    const begrunnelse = nyData.begrunnelse || eksisterendeData.begrunnelse;

    const { oppfylt } = eksisterendeData;
    const nyttFelt = { oppfylt, begrunnelse, fritekst };

    if (!Utils._isNil(nyData.oppfylt) && !Utils._isUndefined(nyData.oppfylt)) {
      nyttFelt.oppfylt = nyData.oppfylt;
    }
    return nyttFelt;
  };

  hent = () => {
    const vilkaar = {};
    const { stegStore } = this;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(key => {
        const { oppfylt, begrunnelse, fritekst } = steg[key];
        if (!Utils._isNil(oppfylt)) {
          vilkaar[key] = oppfylt;
        }

        if (begrunnelse && begrunnelse.length > 0) {
          vilkaar[`${key}_begrunnelser`] = begrunnelse;
        }

        if (fritekst && fritekst.length > 0) {
          vilkaar[`${key}_begrunnelser_fritekst`] = fritekst;
        }
      });
    });
    return vilkaar;
  };
}

export default VilkaarStore;
