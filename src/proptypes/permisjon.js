import PT from 'prop-types';

import { Periode } from './';

const PermisjonOgPermitteringPropType = PT.shape({
  permisjonsId: PT.number,
  permisjonOgPermittering: PT.string,
  permisjonsprosent: PT.number,
  permisjonsPeriode: Periode,
});

const PermisjonenPropType = PT.shape({
  grad: PT.string,
  inntektstype: PT.string,
  permisjonstype: PT.string,
  periode: PT.shape({
    fom: PT.string,
    tom: PT.string,
  }),
  innmeldt: PT.string,
});

const PermisjonerPropType = PT.arrayOf(PermisjonenPropType);


export {
  PermisjonOgPermitteringPropType as PermisjonOgPermittering,
  PermisjonenPropType as Permisjonen,
  PermisjonerPropType as Permisjoner,
};
