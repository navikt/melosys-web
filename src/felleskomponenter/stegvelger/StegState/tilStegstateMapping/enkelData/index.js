export const slettEnkelData = (felt, type) => ({
  felt,
  type,
});

export const lagEnkelData = (data, type) => ({
  felt: type,
  oppdaterRedux: true,
  type,
  innhold: data,
});

export const konverterEnkelDataTilStegData = (data, type) => ({
  felt: type,
  type,
  innhold: data,
});
