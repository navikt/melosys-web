import StegState from './StegState';
import * as Utils from '../../../utils';

class Avklartfakta extends StegState {
  oppdaterfelt = (eksisterendeData, type, nyData) => {
    const fritekst = nyData.fritekst || eksisterendeData.fritekst;
    const begrunnelse = nyData.begrunnelse || eksisterendeData.begrunnelse;

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

  hent = () => {
    const avklartefakta = {};
    const { stegStore } = this;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(referanse => {
        const { fakta, subjektID, begrunnelse } = steg[referanse];
        avklartefakta[referanse] = {
          fakta,
          subjektID,
          begrunnelse,
          referanse,
        };
      });
    });
    return avklartefakta;
  };
}

export default Avklartfakta;
