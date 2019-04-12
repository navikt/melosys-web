
export const hentFaktaListe = (spesifiktFakta, alleFakta) => alleFakta.filter(enkelt => enkelt.referanse === spesifiktFakta) || [];
export const hentFakta = (spesifiktFakta, alleFakta) => alleFakta.find(enkelt => enkelt.referanse === spesifiktFakta) || {};
export const hentFaktaVerdi = avklartfakta => (avklartfakta.fakta ? avklartfakta.fakta[0] : null);

export const lagAvklartfakta = (felt, subjektID, fakta, begrunnelseKoder, begrunnelseFritekst) =>
  ({
    felt,
    type: 'avklartefakta',
    innhold: {
      referanse: felt,
      subjektID,
      fakta: [fakta],
      begrunnelseKoder: [begrunnelseKoder],
      begrunnelseFritekst,
    },
  });

export const lagAvklartefaktaBegrunnelse = (felt, subjektID, begrunnelse, fritekst) => {
  let begrunnelseListe = [];
  if (begrunnelse && begrunnelse.length > 0) {
    begrunnelseListe = [begrunnelse];
  }
  return lagAvklartfakta(felt, subjektID, null, begrunnelseListe, fritekst);
};

export const konverterTilStegData = (felt, avklartfakta) => {
  if (!avklartfakta) return null;

  const {
    subjektID, fakta, begrunnelseKoder, begrunnelseFritekst,
  } = avklartfakta;

  return {
    felt,
    type: 'avklartefakta',
    ignorer: true,
    innhold: {
      referanse: felt,
      subjektID,
      fakta,
      begrunnelseKoder,
      begrunnelseFritekst,
    },
  };
};
