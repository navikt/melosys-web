import StegState from './StegState';
import * as Utils from '../../../utils';

class Avklartfakta extends StegState {
  lagKey = data => (data.referanse + (data.subjektID || ''));

  slettFelt = (stegID, data) => {
    const { stegStore } = this;
    const { subjektID, felt } = data;

    if (stegStore.has(stegID)) {
      const steg = stegStore.get(stegID);
      if (subjektID) {
        this.slettFeltMedSubjektID(steg, data);
      } else {
        delete steg[felt];
      }
      stegStore.set(stegID, steg);
    }
  };

  slettFeltMedSubjektID = (steg, data) => {
    const { felt, subjektID } = data;

    const keyToDelete = this.lagKey({ referanse: felt, subjektID });
    const stegFelt = steg[felt];
    if (!stegFelt) return;
    stegFelt.delete(keyToDelete);
  };

  oppdaterfelt = (eksisterendeAvklarteSubjekter, nyData) => {
    const key = this.lagKey(nyData);
    if (!eksisterendeAvklarteSubjekter.has(key)) {
      eksisterendeAvklarteSubjekter.set(key, nyData);
    } else {
      const eksisterendeSubjekt = eksisterendeAvklarteSubjekter.get(key);
      const { referanse, fakta, subjektID } = eksisterendeSubjekt;
      const oppdatertFelt = {
        referanse,
        fakta,
        subjektID,
        begrunnelseKoder: !Utils._isUndefined(nyData.begrunnelseKoder) ? nyData.begrunnelseKoder : eksisterendeSubjekt.begrunnelseKoder,
        begrunnelseFritekst: !Utils._isUndefined(nyData.begrunnelseFritekst) ? nyData.begrunnelseFritekst : eksisterendeSubjekt.begrunnelseFritekst,
      };

      if (!Utils._isNil(nyData.fakta)) {
        oppdatertFelt.fakta = nyData.fakta;
      }
      if (!Utils._isNil(nyData.subjektID)) {
        oppdatertFelt.subjektID = nyData.subjektID;
      }
      eksisterendeAvklarteSubjekter.set(key, oppdatertFelt);
    }
    return eksisterendeAvklarteSubjekter;
  };

  nyttFelt = () => (new Map());

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
