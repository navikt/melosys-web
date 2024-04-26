export const hentVilkar = (spesifiktVilkar, alleVilkar) =>
  alleVilkar.find((enkelt) => enkelt.vilkaar === spesifiktVilkar) || {};

export const erVilkarOppfylt = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.oppfylt;
};

export const hentBegrunnelser = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = hentVilkar(spesifiktVilkar, alleVilkar);
  return funnetVilkar.begrunnelseKoder;
};
