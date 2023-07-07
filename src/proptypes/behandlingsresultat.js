import PT from "prop-types";

const BehandlingsresultatPropType = PT.shape({
  behandlingsresultatTypeKode: PT.string,
  begrunnelseKoder: PT.arrayOf(PT.string),
  begrunnelseFritekst: PT.string,
  innledningFritekst: PT.string,
  nyVurderingBakgrunn: PT.string,
});

export { BehandlingsresultatPropType as Behandlingsresultat };
