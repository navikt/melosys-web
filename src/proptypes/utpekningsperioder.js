import PT from 'prop-types';

const Utpekningsperiode = PT.shape({
  fomDato: PT.string,
  tomDato: PT.string,
  lovvalgsbestemmelse: PT.string,
  tilleggBestemmelse: PT.string,
  lovvalgsland: PT.string,
});

const Utpekningsperioder = PT.arrayOf(Utpekningsperiode);

export {
  Utpekningsperiode,
  Utpekningsperioder,
};
