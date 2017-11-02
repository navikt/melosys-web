import PT from 'prop-types';

import { Kodeverk, Periode } from './';

const MedlemskapPeriodePropType = PT.shape({
  id: PT.number,
  periode: Periode,
  meta: PT.shape({
    opprinneligOpprettetAv: PT.string,
    sistEndretAv: PT.string,
    tidspunktOpprinneligOpprettet: PT.string,
    tidspunktSistEndret: PT.string,
  }),
  version: PT.number,
  dato: PT.shape({
    registrert: PT.string,
    besluttet: PT.string,
  }),
  status: Kodeverk,
  helsedel: PT.bool,
  type: Kodeverk,
  lovvalg: Kodeverk,
  grunnlagstype: Kodeverk,
  land: Kodeverk,
  trygdedekning: Kodeverk,
  kildedokumenttype: Kodeverk,
  register: PT.string,
});

const MedlemskapPropType = PT.shape({
  aktorID: PT.string,
  periodeListe: PT.arrayOf(MedlemskapPeriodePropType),
});


export {
  MedlemskapPeriodePropType as MedlemskapPeriode,
  MedlemskapPropType as Medlemskap,
};
