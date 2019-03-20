import * as MKV from 'melosys-kodeverk';

const erVilkarOppfylt = (spesifiktVilkar, alleVilkar) => {
  const funnetVilkar = alleVilkar.find(enkelt => enkelt.vilkaar === spesifiktVilkar) || {};
  return funnetVilkar.oppfylt;
};

const velgMellomSoknadslandEllerFlaggland = (alleVilkar, soknadsland = MKV.Koder.landkoder.NO, flaggland) => {
  const {
    FO_883_2004_ART11_3A, FO_883_2004_ART11_4_1, FO_883_2004_ART11_4_2, FO_883_2004_ART12_1, FO_883_2004_ART12_2, FO_883_2004_ART16_1,
  } = MKV.Koder.vilkaar;

  if (erVilkarOppfylt(FO_883_2004_ART11_3A, alleVilkar)) {
    if (erVilkarOppfylt(FO_883_2004_ART11_4_1, alleVilkar)) {
      return flaggland;
    }
    return MKV.Koder.landkoder.NO;
  } else if (erVilkarOppfylt(FO_883_2004_ART11_4_2, alleVilkar)) {
    return flaggland;
  } else if (erVilkarOppfylt(FO_883_2004_ART12_2, alleVilkar) || erVilkarOppfylt(FO_883_2004_ART16_1, alleVilkar)) {
    return soknadsland;
  } else if (erVilkarOppfylt(FO_883_2004_ART12_1, alleVilkar)) {
    if (erVilkarOppfylt(FO_883_2004_ART11_4_1, alleVilkar)) {
      return flaggland;
    }
    return soknadsland;
  }
  return soknadsland;
};

export {
  erVilkarOppfylt,
  velgMellomSoknadslandEllerFlaggland,
};
