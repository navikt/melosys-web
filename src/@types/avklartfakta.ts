type Avklartfakta = {
  avklartefaktaKode: string | null,
  begrunnelseFritekst: string | null,
  begrunnelseKoder: string[],
  fakta: string[],
  referanse: string,
  subjektID: string | null,
};

export default Avklartfakta;
