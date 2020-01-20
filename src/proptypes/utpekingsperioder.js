import PT from 'prop-types';

const Utpekingsperiode = PT.shape({
  fomDato: PT.string,
  tomDato: PT.string,
  lovvalgsbestemmelse: PT.string,
  tilleggBestemmelse: PT.string,
  lovvalgsland: PT.string,
});

const Utpekingsperioder = PT.arrayOf(Utpekingsperiode);

export {
  Utpekingsperiode,
  Utpekingsperioder,
};
