type Avklartfakta = {
  avklartefaktaKode: string | null;
  begrunnelseFritekst: string | null;
  begrunnelseKoder: string[];
  fakta: string[];
  referanse: string;
  subjektID: string | null;
};

export type Virksomheter = {
  virksomhetIDer: string[];
};

export default Avklartfakta;

export type FamilieOmfattetAvNorskTrygd = {
  uuid: string;
  sammensattNavn?: string;
};
export type FamilieIkkeOmfattetAvNorskTrygd = {
  uuid: string;
  begrunnelse: string;
  begrunnelseFritekst: string;
};

export type AvklartMedfolgendeFamilie = {
  familieOmfattetAvNorskTrygd: FamilieOmfattetAvNorskTrygd[];
  familieIkkeOmfattetAvNorskTrygd: FamilieIkkeOmfattetAvNorskTrygd[];
};

export type MedfolgendeFamilie = {
  avklarteMedfolgendeBarn: AvklartMedfolgendeFamilie;
  avklarteMedfolgendeEktefelleSamboer: AvklartMedfolgendeFamilie;
};
