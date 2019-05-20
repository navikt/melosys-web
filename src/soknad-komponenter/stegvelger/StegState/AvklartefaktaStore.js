import StegState from './StegState';
import * as Utils from '../../../utils';

class Avklartfakta extends StegState {
  lagKey = data => (data.referanse + (data.subjektID || ''));

  slettStegData = (stegID, felt, filtere) => {
    if (this.stegStore.has(stegID)) {
      if (Utils._isNil(felt)) {
        this.slettSteg(stegID);
      } else {
        this.slettFelt(stegID, felt, filtere);
      }
    }
  };

  slettFelt = (stegID, felt, filtere) => {
    const { stegStore } = this;

    if (stegStore.has(stegID)) {
      const steg = stegStore.get(stegID);
      if (filtere) {
        this.slettFeltMedFilter(steg, felt, filtere);
      } else {
        delete steg[felt];
      }
      stegStore.set(stegID, steg);
    }
  };

  slettFeltMedFilter = (steg, felt, filtere) => {
    Object.keys(filtere).forEach(filter => {
      const filterValue = filtere[filter];
      const keyToDelete = `${felt}${filterValue}`;

      const stegFelt = steg[felt].has(keyToDelete) ? steg[felt].get(keyToDelete) : null;

      if (stegFelt && stegFelt[filter] === filterValue) {
        steg[felt].delete(keyToDelete);
      }
    });
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
        begrunnelseKoder: nyData.begrunnelseKoder || eksisterendeSubjekt.begrunnelseKoder,
        begrunnelseFritekst: nyData.begrunnelseFritekst || eksisterendeSubjekt.begrunnelseFritekst,
      };

      if (!Utils._isNil(nyData.fakta)) {
        oppdatertFelt.fakta = nyData.fakta;
      }
      if (!Utils._isNil(nyData.subjektID) && !Utils._isUndefined(nyData.subjektID)) {
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
