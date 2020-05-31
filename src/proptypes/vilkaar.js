import PT from 'prop-types';

const VilkaarPropType = PT.shape({
  vilkaar: PT.string,
  oppfylt: PT.bool,
  begrunnelseKoder: PT.arrayOf(PT.string),
  begrunnelseFritekst: PT.string,
});

export { VilkaarPropType as Vilkaar };
