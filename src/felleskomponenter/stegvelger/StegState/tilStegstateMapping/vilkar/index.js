import { tryParseBool } from "../../../../../utils/streng";

export const vilkaarType = "vilkaar";

export const slettVilkar = (felt) => ({
  felt,
  type: vilkaarType,
});

// Vær forsiktig med denne, den sletter alle vilkår i alle steg.
export const slettVilkarIAlleSteg = (felt) => ({
  felt,
  type: vilkaarType,
  iAlleSteg: true,
});

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

export const lagVilkarbegrunnelse = (felt, begrunnelse, fritekst, fritekstEngelsk) =>
  lagVilkaar(felt, null, begrunnelse, fritekst, fritekstEngelsk);

export const konverterVilkarTilStegData = (felt, vilkaar) => {
  const { oppfylt, begrunnelseKoder, begrunnelseFritekst, begrunnelseFritekstEngelsk } = vilkaar;

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
