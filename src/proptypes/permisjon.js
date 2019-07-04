import PT from 'prop-types';

import { Periode } from './periode';

const PermisjonOgPermitteringPropType = PT.shape({
  permisjonsId: PT.number,
  permisjonOgPermittering: PT.string,
  permisjonsprosent: PT.number,
  permisjonsPeriode: Periode,
});

const PermisjonenPropType = PT.shape({
  permisjonsId: PT.string,
  permisjonsPeriode: PT.shape({
    fom: PT.string,
    tom: PT.string,
  }),
  permisjonsprosent: PT.number,
  permisjonOgPermittering: PT.string,
});

const PermisjonerPropType = PT.arrayOf(PermisjonenPropType);


export {
  PermisjonOgPermitteringPropType as PermisjonOgPermittering,
  PermisjonenPropType as Permisjonen,
  PermisjonerPropType as Permisjoner,
};
