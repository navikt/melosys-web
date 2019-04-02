import PT from 'prop-types';

import { ForretningsAdresse, PostAdresse } from './adresser';

const OrgnummerNavnPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
});

const OrganisasjonPropType = PT.shape({
  orgnr: PT.string,
  navn: PT.string,
  forretningsadresse: ForretningsAdresse,
  postadresse: PostAdresse,
});

const OrganisasjonerPropType = PT.arrayOf(OrganisasjonPropType);

export {
  OrganisasjonPropType as Organisasjon,
  OrgnummerNavnPropType as OrgnummerNavn,
  OrganisasjonerPropType as Organisasjoner,
};
