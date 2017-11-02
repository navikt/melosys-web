import PT from 'prop-types';

const OrgnummerNavnPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
});

const ForretningsadressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string.isRequired,
  }),
  postnr: PT.string.isRequired,
  poststed: PT.string.isRequired,
  land: PT.string.isRequired,
});

const OrganisasjonPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
  forretningsadresse: ForretningsadressePropType,
  postadresse: PT.string,
  kontakt: PT.shape({
    navn: PT.string.isRequired,
    telefon: PT.string.isRequired,
    epost: PT.string,
  }),
});

const OrganisasjonerPropType = PT.arrayOf(OrganisasjonPropType);

export {
  OrganisasjonPropType as Organisasjon,
  ForretningsadressePropType as Forretningsadresse,
  OrgnummerNavnPropType as OrgnummerNavn,
  OrganisasjonerPropType as Organisasjoner,
};
