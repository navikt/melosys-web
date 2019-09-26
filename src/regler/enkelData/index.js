export const slettEnkelData = (felt, type) => ({
  felt,
  type,
});

export const lagEnkelData = (felt, type) => ({
  felt: type,
  oppdaterRedux: true,
  type,
  innhold: felt,
});

export const konverterEnkelDataTilStegData = (data, type) => ({
  felt: type,
  type,
  innhold: data,
});
