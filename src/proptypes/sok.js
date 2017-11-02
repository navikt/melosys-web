import PT from 'prop-types';

const SokListeEnkeltlinjePropType = PT.shape({
  fnr: PT.string.isRequired,
  sammensattNavn: PT.string.isRequired,
});

const SokListePropType = PT.arrayOf(SokListeEnkeltlinjePropType);

export {
  SokListeEnkeltlinjePropType as SokListeEnkeltlinje,
  SokListePropType as SokListe,
};
