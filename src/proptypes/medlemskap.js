import PT from 'prop-types';

const MedlemskapPeriodePropType = PT.shape({
  type: PT.string,
  status: PT.string,
  grunnlagstype: PT.string,
  land: PT.string,
  lovvalg: PT.string,
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
