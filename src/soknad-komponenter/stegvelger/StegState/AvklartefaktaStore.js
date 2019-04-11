import StegState from './StegState';
import * as Utils from '../../../utils';

class Avklartfakta extends StegState {
  oppdaterfelt = (eksisterendeAvklarteSubjekter, type, nyData) => {
    const key = nyData.referanse + nyData.subjektID;
    if (!eksisterendeAvklarteSubjekter.has(key)) {
      eksisterendeAvklarteSubjekter.set(key, nyData);
    } else {
      const eksisterendeSubjekt = eksisterendeAvklarteSubjekter.get(key);
      const fritekst = nyData.begrunnelseFritekst || eksisterendeSubjekt.begrunnelseFritekst;
      const begrunnelse = nyData.begrunnelseKoder || eksisterendeSubjekt.begrunnelseKoder;

      const { referanse, fakta, subjektID } = eksisterendeSubjekt;
      const oppdaterFelt = {
        fakta,
        subjektID,
        begrunnelse,
        fritekst,
        referanse,
      };
      if (!Utils._isNil(nyData.fakta) && !Utils._isUndefined(nyData.fakta)) {
        oppdaterFelt.fakta = nyData.fakta;
      }
      if (!Utils._isNil(nyData.subjektID) && !Utils._isUndefined(nyData.subjektID)) {
        oppdaterFelt.subjektID = nyData.subjektID;
      }
      eksisterendeAvklarteSubjekter.set(key, oppdaterFelt);
    }
    return eksisterendeAvklarteSubjekter;
  };

  lagreFelt = (stegID, felt, data) => {
    const { stegStore } = this;
    let steg = stegStore.get(stegID);
    if (!steg) {
      steg = {};
      steg[felt] = new Map();
      steg[felt].set(data.referanse + data.subjektID, data);
    } else {
      steg[felt] = data;
    }
    stegStore.set(stegID, steg);
  };

  hent = () => {
    const avklartefakta = {};
    const { stegStore } = this;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(referanse => {
        avklartefakta[referanse] = [];
        const avklarteSubjekter = steg[referanse];
        avklarteSubjekter.forEach(value => {
          avklartefakta[referanse].push(value);
        });
      });
    });
    return avklartefakta;
  };
}

export default Avklartfakta;
