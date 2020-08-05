import { tryParseBool } from '../../utils/streng';

export const vilkaarType = 'vilkaar';

export const slettVilkar = felt => ({
  felt,
  type: vilkaarType,
});

export const hentVilkar = (spesifiktVilkar, alleVilkar) => alleVilkar.find(enkelt => enkelt.vilkaar === spesifiktVilkar) || {};

export const erVilkarOppfylt = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.oppfylt;
};

export const hentBegrunnelser = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.begrunnelseKoder;
};

export const lagVilkaar = (felt, verdi, begrunnelse, fritekst, fritekstEngelsk) => {
  const oppfylt = tryParseBool(verdi);
  if (oppfylt === true) {
    return {
      felt,
      oppdaterRedux: true,
      type: vilkaarType,
      innhold: {
        oppfylt,
        begrunnelse: [],
        fritekst: null,
        fritekstEngelsk: null,
      },
    };
  }
  return {
    felt,
    oppdaterRedux: true,
    type: vilkaarType,
    innhold: {
      oppfylt,
      begrunnelse,
      fritekst,
      fritekstEngelsk,
    },
  };
};

export const lagBegrunnelse = (felt, begrunnelse, fritekst, fritekstEngelsk) => (
  lagVilkaar(felt, null, begrunnelse, fritekst, fritekstEngelsk)
);

export const konverterTilStegData = (felt, vilkaar) => {
  const {
    oppfylt,
    begrunnelseKoder,
    begrunnelseFritekst,
    begrunnelseFritekstEngelsk,
  } = vilkaar;

  return {
    felt,
    type: vilkaarType,
    innhold: {
      oppfylt,
      begrunnelse: begrunnelseKoder,
      fritekst: begrunnelseFritekst,
      fritekstEngelsk: begrunnelseFritekstEngelsk,
    },
  };
};
