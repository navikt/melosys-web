type Avklartfakta = {
  avklartefaktaKode: string | null,
  begrunnelseFritekst: string | null,
  begrunnelseKoder: string[],
  fakta: string[],
  referanse: string,
  subjektID: string | null,
};

export type Virksomheter = {
  orgnummer: string[]
};

export default Avklartfakta;
