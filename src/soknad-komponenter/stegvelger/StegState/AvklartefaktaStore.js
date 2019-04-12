import StegState from './StegState';
import * as Utils from '../../../utils';

class Avklartfakta extends StegState {
  lagKey = data => (data.referanse + (data.subjektID || ''));

  oppdaterfelt = (eksisterendeAvklarteSubjekter, nyData) => {
    const key = this.lagKey(nyData);
    if (!eksisterendeAvklarteSubjekter.has(key)) {
      eksisterendeAvklarteSubjekter.set(key, nyData);
    } else {
      const eksisterendeSubjekt = eksisterendeAvklarteSubjekter.get(key);
      const { referanse, fakta, subjektID } = eksisterendeSubjekt;
      const oppdaterFelt = {
        referanse,
        fakta,
        subjektID,
        begrunnelseKoder: nyData.begrunnelseKoder || eksisterendeSubjekt.begrunnelseKoder,
        begrunnelseFritekst: nyData.begrunnelseFritekst || eksisterendeSubjekt.begrunnelseFritekst,
      };

      if (!Utils._isNil(nyData.fakta)) {
        oppdaterFelt.fakta = nyData.fakta;
      }
      if (!Utils._isNil(nyData.subjektID) && !Utils._isUndefined(nyData.subjektID)) {
        oppdaterFelt.subjektID = nyData.subjektID;
      }
      eksisterendeAvklarteSubjekter.set(key, oppdaterFelt);
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
