import { KTObject } from '@navikt/melosys-kodeverk';
import { Periode } from './periode';

export type MedlPeriode = {
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
