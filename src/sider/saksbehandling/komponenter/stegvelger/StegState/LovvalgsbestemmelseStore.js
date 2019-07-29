import StegState from './StegState';
import * as Utils from '../../../../../utils';

class LovvalgsbestemmelseStore extends StegState {
  oppdaterfelt = (eksisterendeData, nyData) => {
    if (!Utils._isNil(nyData)) {
      return nyData;
    }
    return eksisterendeData;
  };

  hent = () => {
    const { stegStore } = this;
    let lovvalgsbestemmelse = null;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(key => {
        const stegData = steg[key];
        if (!Utils._isNil(stegData) && Utils._isNil(lovvalgsbestemmelse)) {
          lovvalgsbestemmelse = stegData;
        }
      });
    });
    return lovvalgsbestemmelse;
  };
}

export default LovvalgsbestemmelseStore;
