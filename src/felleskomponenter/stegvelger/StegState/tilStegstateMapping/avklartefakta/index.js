export const avklartefaktaType = "avklartefakta";

export const slettAvklartfakta = (felt, subjektID) => ({
  felt,
  subjektID,
  type: avklartefaktaType,
});

export const lagAvklartfakta = (felt, subjektID, fakta, begrunnelseKoder, begrunnelseFritekst = null) => ({
  felt,
  oppdaterRedux: true,
  type: avklartefaktaType,
  innhold: {
    referanse: felt,
    subjektID,
    fakta: [fakta],
    begrunnelseKoder,
    begrunnelseFritekst,
  },
});

export const lagAvklartefaktaBegrunnelse = (felt, subjektID, begrunnelseKoder, begrunnelseFritekst = null) => ({
  felt,
  oppdaterRedux: true,
  type: avklartefaktaType,
  innhold: {
    referanse: felt,
    subjektID,
    fakta: null,
    begrunnelseKoder,
    begrunnelseFritekst,
  },
});

export const konverterAvklartfaktaTilStegData = (felt, avklartfakta) => {
  if (!avklartfakta || !avklartfakta.fakta) return null;

  const { subjektID, fakta, begrunnelseKoder, begrunnelseFritekst = null } = avklartfakta;

  return {
    felt,
    type: avklartefaktaType,
    innhold: {
      referanse: felt,
      subjektID,
      fakta,
      begrunnelseKoder,
      begrunnelseFritekst,
    },
  };
};
