import PT from 'prop-types';

const VirksomhetProptype = PT.shape({
  navn: PT.string.isRequired,
  id: PT.string.isRequired,
});

export { VirksomhetProptype as Virksomhet };
