
export const hentFakta = (spesifiktFakta, alleFakta) => alleFakta.find(enkelt => enkelt.referanse === spesifiktFakta) || {};

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


export const lagAvklartefaktaBegrunnelse = (felt, subjektID, begrunnelse, fritekst) => (
  lagAvklartfakta(felt, subjektID, null, begrunnelse, fritekst)
);


export const konverterTilStegData = (felt, avklartfakta) => {
  const {
    subjektID, fakta, begrunnelse, fritekst,
  } = avklartfakta;

  return lagAvklartfakta(felt, subjektID, fakta, begrunnelse, fritekst);
};
