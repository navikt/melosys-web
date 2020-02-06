import StegState from './StegState';
import * as Utils from '../../../utils';

class EnkelDataStore extends StegState {
  oppdaterfelt = (eksisterendeData, nyData) => {
    if (!Utils._isNil(nyData)) {
      return nyData;
    }
    return eksisterendeData;
  };

  hent = () => {
    const { stegStore } = this;
    let data = null;
    stegStore.forEach(steg => {
      Object.keys(steg).forEach(key => {
        const stegData = steg[key];
        if (!Utils._isNil(stegData) && Utils._isNil(data)) {
          data = stegData;
        }
      });
    });
    return data;
  };
}

export default EnkelDataStore;
