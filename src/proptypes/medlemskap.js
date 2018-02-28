import PT from 'prop-types';
import { Periode } from './periode';
import { Kodeverk } from './kodeverk';

const MedlemskapPeriodePropType = PT.shape({
  periode: Periode,
  type: Kodeverk,
  status: Kodeverk,
  grunnlagstype: Kodeverk,
  land: Kodeverk,
  lovvalg: Kodeverk,
  trygdedekning: PT.string,
  kildedokumenttype: PT.string,
  kilde: PT.string,
});

const MedlemskapPropType = PT.shape({
  medlemsperiode: PT.arrayOf(MedlemskapPeriodePropType),
});

export {
  MedlemskapPeriodePropType as MedlemskapPeriode,
  MedlemskapPropType as Medlemskap,
};
