import { lagDatalistID, landTekstFormat } from './utils';

import * as KV from '../../../kodeverk';
import MKV from '../../../melosyskodeverk';

describe('Landvelger Utils', () => {
  describe('lagDatalistID', () => {
    it('returnerer en string', () => {
      const datalistID = lagDatalistID();

      expect(datalistID.includes('datalist-')).toBe(true);
    });
  });

  describe('landTekstFormat', () => {
    it('returnerer en formattert string med land og landkode', () => {
      const KTObject = KV.kodeTilObjekt(MKV.Koder.landkoder.DE, MKV.KTObjects.landkoder);
      const formattertString = landTekstFormat(KTObject);

      expect(formattertString).toBe('Tyskland (DE)');
    });
  });
});
