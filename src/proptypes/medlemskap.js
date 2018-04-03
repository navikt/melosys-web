import PT from 'prop-types';
import { Periode } from './periode';
import { Kodeverk } from './kodeverk';

const MedlemskapEnkeltPeriodePropType = PT.shape({
  periode: Periode,
  type: Kodeverk,
  status: Kodeverk,
  grunnlagstype: Kodeverk,
  land: Kodeverk,
  lovvalg: Kodeverk,
  trygdedekning: Kodeverk,
  kildedokumenttype: Kodeverk,
  kilde: Kodeverk,
});

const MedlemskapPerioderPropType = PT.arrayOf(MedlemskapEnkeltPeriodePropType);

const MedlemskapPropType = PT.shape({
  perioderMed: PT.arrayOf(MedlemskapEnkeltPeriodePropType),
  perioderUten: PT.arrayOf(MedlemskapEnkeltPeriodePropType),
  perioderUavklart: PT.arrayOf(MedlemskapEnkeltPeriodePropType),
  perioderAvvist: PT.arrayOf(MedlemskapEnkeltPeriodePropType),
});

export {
  MedlemskapEnkeltPeriodePropType as MedlemskapEnkeltPeriode,
  MedlemskapPerioderPropType as MedlemskapPerioder,
  MedlemskapPropType as Medlemskap,
};
