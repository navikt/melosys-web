import { KTObject } from 'melosys-kodeverk';
import { Periode } from './periode';

export type MedlemskapPeriode = {
  periodeID: number,
  periode: Periode,
  type: KTObject,
  status: KTObject,
  grunnlagstype: KTObject,
  land: KTObject,
  lovvalg: KTObject,
  trygdedekning: KTObject,
  kildedokumenttype: KTObject,
  kilde: KTObject,
  periodetype: KTObject,
};
