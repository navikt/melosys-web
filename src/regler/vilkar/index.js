export const erVilkarOppfylt = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = alleVilkar.find(enkelt => enkelt.vilkaar === spesifiktVilkar) || {};
  return funnetVilkar.oppfylt;
};
