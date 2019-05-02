
export const hentFaktaListe = (spesifiktFakta, alleFakta) => alleFakta.filter(enkelt => enkelt.referanse === spesifiktFakta) || [];
export const hentFakta = (spesifiktFakta, alleFakta) => alleFakta.find(enkelt => enkelt.referanse === spesifiktFakta) || {};
export const hentFaktaVerdi = avklartfakta => (avklartfakta.fakta ? avklartfakta.fakta[0] : null);

export const lagAvklartfakta = (felt, subjektID, fakta, begrunnelseKoder, begrunnelseFritekst) => {
  let begrunnelseListe = [];
  if (begrunnelseKoder && begrunnelseKoder.length > 0) {
    begrunnelseListe = [begrunnelseKoder];
  }
  return {
    felt,
    oppdaterRedux: true,
    type: 'avklartefakta',
    innhold: {
      referanse: felt,
      subjektID,
      fakta: [fakta],
      begrunnelseKoder: begrunnelseListe,
      begrunnelseFritekst,
    },
  };
};

export const lagAvklartefaktaBegrunnelse = (felt, subjektID, begrunnelse, begrunnelseFritekst) => {
  let begrunnelseListe = [];
  if (begrunnelse && begrunnelse.length > 0) {
    begrunnelseListe = [begrunnelse];
  }
  return {
    felt,
    oppdaterRedux: true,
    type: 'avklartefakta',
    innhold: {
      referanse: felt,
      subjektID,
      fakta: null,
      begrunnelseKoder: begrunnelseListe,
      begrunnelseFritekst,
    },
  };
};

export const konverterTilStegData = (felt, avklartfakta) => {
  if (!avklartfakta || !avklartfakta.fakta) return null;

  const {
    subjektID, fakta, begrunnelseKoder, begrunnelseFritekst,
  } = avklartfakta;

  return {
    felt,
    type: 'avklartefakta',
    innhold: {
      referanse: felt,
      subjektID,
      fakta,
      begrunnelseKoder,
      begrunnelseFritekst,
    },
  };
};
