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
  land: PT.string.isRequired,
});

const OrganisasjonPropType = PT.shape({
  orgnr: PT.string,
  navn: PT.string,
  forretningsadresse: ForretningsadressePropType,
});

const OrganisasjonerPropType = PT.arrayOf(OrganisasjonPropType);

export {
  OrganisasjonPropType as Organisasjon,
  ForretningsadressePropType as Forretningsadresse,
  OrgnummerNavnPropType as OrgnummerNavn,
  OrganisasjonerPropType as Organisasjoner,
};
