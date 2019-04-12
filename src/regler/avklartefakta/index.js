
export const hentFakta = (spesifiktFakta, alleFakta) => alleFakta.filter(enkelt => enkelt.referanse === spesifiktFakta) || [];
export const hentFoersteFakta = (spesifiktFakta, alleFakta) => alleFakta.find(enkelt => enkelt.referanse === spesifiktFakta) || {};
export const hentFoersteFaktaVerdi = avklartfakta => (avklartfakta.fakta ? avklartfakta.fakta[0] : null);

export const lagAvklartfakta = (felt, subjektID, fakta, begrunnelseKoder, begrunnelseFritekst) =>
  ({
    felt,
    type: 'avklartefakta',
    innhold: {
      referanse: felt,
      subjektID,
      fakta,
      begrunnelseKoder,
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
  const {
    subjektID, fakta, begrunnelse, fritekst,
  } = avklartfakta;

  return lagAvklartfakta(felt, subjektID, fakta, begrunnelse, fritekst);
};
