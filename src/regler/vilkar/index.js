import { tryParseBool } from '../../utils/streng';

export const hentVilkar = (spesifiktVilkar, alleVilkar) => alleVilkar.find(enkelt => enkelt.vilkaar === spesifiktVilkar) || {};

export const erVilkarOppfylt = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.oppfylt;
};

export const hentBegrunnelser = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.begrunnelser;
};

export const lagRessurs = (felt, verdi, begrunnelse, fritekst) => {
  const oppfylt = tryParseBool(verdi);
  if (oppfylt === true) {
    return {
      felt,
      innhold: { oppfylt, begrunnelse: [], fritekst: null },
    };
  }
  return {
    felt,
    innhold: { oppfylt, begrunnelse, fritekst },
  };
};

export const lagBegrunnelse = (felt, begrunnelse, fritekst) => {
  return lagRessurs(felt, null, begrunnelse, fritekst);
};

export const konverterTilRessurs = (felt, vilkaar) => {
  const { oppfylt, begrunnelseKoder, begrunnelseFritekst } = vilkaar;
  return lagRessurs(felt, oppfylt, begrunnelseKoder, begrunnelseFritekst);
};
