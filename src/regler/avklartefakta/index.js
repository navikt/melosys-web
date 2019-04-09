
export const lagAvklartfakta = (felt, subjektID, fakta, begrunnelse, fritekst) =>
  ({
    felt,
    type: 'avklartefakta',
    innhold: {
      subjektID,
      fakta: [fakta],
      begrunnelse: [begrunnelse],
      fritekst,
    },
  });


export const lagAvklartefaktaBegrunnelse = (felt, subjektID, begrunnelse, fritekst) => {
  return lagAvklartfakta(felt, subjektID, null, begrunnelse, fritekst);
};


export const konverterTilRessurs = (felt, avklartfakta) => {
  const {
    subjektID, fakta, begrunnelse, fritekst,
  } = avklartfakta;

  return lagAvklartfakta(felt, subjektID, fakta, begrunnelse, fritekst);
};
