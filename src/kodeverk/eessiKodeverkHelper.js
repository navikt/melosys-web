import * as EKV from 'eessi-kodeverk';
import { kodeTilObjekt } from './index';

export const hentBucTyperForFagomrade = fagomrade => {
  if (!fagomrade) {
    return [];
  }
  return EKV.KTObjects.buctyper[EKV.Kodemaps.SEKTOR2BUC[fagomrade]];
};

export const alleBucer = Object.assign({}, ...Object.values(EKV.Terms.buctyper));

const alleBuc2Seds = Object.assign({}, ...Object.values(EKV.Kodemaps.BUC2SEDS));
export const hentSedTyperForBuc = buc => {
  if (!buc) {
    return [];
  }
  return [kodeTilObjekt(EKV.Koder.sedtyper[alleBuc2Seds[buc]], EKV.KTObjects.sedtyper)];
};
