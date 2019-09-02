import PT from 'prop-types';

const VirksomhetProptype = PT.shape({
  navn: PT.string,
  id: PT.string.isRequired,
  adresse: PT.shape({
    land: PT.string,
  }),
});

export { VirksomhetProptype as Virksomhet };
