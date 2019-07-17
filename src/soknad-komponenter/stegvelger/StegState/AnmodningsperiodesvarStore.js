import StegState from './StegState';
import * as Utils from '../../../utils';

class AnmodningsperiodesvarStore extends StegState {
  oppdaterfelt = (eksisterendeData, nyData) => {
    if (!Utils._isNil(nyData)) {
      return nyData;
    }
    return eksisterendeData;
  };

  hent = () => {
    const { stegStore } = this;
    let anmodningsperiodesvar = null;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(key => {
        const stegData = steg[key];
        if (!Utils._isNil(stegData) && Utils._isNil(anmodningsperiodesvar)) {
          anmodningsperiodesvar = stegData;
        }
      });
    });
    return anmodningsperiodesvar;
  };
}

export default AnmodningsperiodesvarStore;
