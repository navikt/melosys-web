import { tryParseBool } from '../../utils/streng';

export const vilkaarType = 'vilkaar';

export const hentVilkar = (spesifiktVilkar, alleVilkar) => alleVilkar.find(enkelt => enkelt.vilkaar === spesifiktVilkar) || {};

export const erVilkarOppfylt = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.oppfylt;
};

export const hentBegrunnelser = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.begrunnelser;
};

export const lagVilkaar = (felt, verdi, begrunnelse, fritekst) => {
  const oppfylt = tryParseBool(verdi);
  if (oppfylt === true) {
    return {
      felt,
      oppdaterRedux: true,
      type: vilkaarType,
      innhold: { oppfylt, begrunnelse: [], fritekst: null },
    };
  }
  return {
    felt,
    oppdaterRedux: true,
    type: vilkaarType,
    innhold: { oppfylt, begrunnelse, fritekst },
  };
};

export const lagBegrunnelse = (felt, begrunnelse, fritekst) => (
  lagVilkaar(felt, null, begrunnelse, fritekst)
);

export const konverterTilStegData = (felt, vilkaar) => {
  const { oppfylt, begrunnelseKoder, begrunnelseFritekst } = vilkaar;
  return {
    felt,
    type: vilkaarType,
    innhold: { oppfylt, begrunnelse: begrunnelseKoder, fritekst: begrunnelseFritekst },
  };
};
