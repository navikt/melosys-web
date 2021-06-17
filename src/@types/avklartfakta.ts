/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
type Avklartfakta = {
  avklartefaktaKode: string | null;
  begrunnelseFritekst: string | null;
  begrunnelseKoder: string[];
  fakta: string[];
  referanse: string;
  subjektID: string | null;
};

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export type Virksomheter = {
  virksomhetIDer: string[];
};

export default Avklartfakta;

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export type MedfolgendeFamiliemedlem = {
  uuid: string;
  omfattet: boolean;
  begrunnelseKode: string | null;
  begrunnelseFritekst: string | null;
};

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export type MedfolgendeFamilie = {
  medfolgendeFamilie: MedfolgendeFamiliemedlem[];
};
