export const avklartefaktaType = 'avklartefakta';

export const hentFaktaListe = (spesifiktFakta, alleFakta) => alleFakta.filter(enkelt => enkelt.referanse === spesifiktFakta) || [];
export const hentFakta = (spesifiktFakta, alleFakta) => alleFakta.find(enkelt => enkelt.referanse === spesifiktFakta) || {};
export const hentFaktaVerdi = avklartfakta => (avklartfakta && avklartfakta.fakta ? avklartfakta.fakta[0] : null);

export const slettAvklartfakta = (felt, subjektID) => ({
  felt,
  subjektID,
  type: avklartefaktaType,
});

export const lagAvklartfakta = (felt, subjektID, fakta, begrunnelseKoder, begrunnelseFritekst = null) => (
  {
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
  }
);

export const lagAvklartefaktaBegrunnelse = (felt, subjektID, begrunnelseKoder, begrunnelseFritekst = null) => (
  {
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
  }
);

export const konverterTilStegData = (felt, avklartfakta) => {
  if (!avklartfakta || !avklartfakta.fakta) return null;

  const {
    subjektID, fakta, begrunnelseKoder, begrunnelseFritekst = null,
  } = avklartfakta;

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
