const minLengde = (value, min) => (value && value.length < min ? `Minimum ${min} tegn kreves` : null);
const erPakrevet = value => (!value ? 'Dette feltet er påkrevet.' : null);
const kunTall = value => (isNaN(value) ? 'Skriv inn kun hele tall' : null);

export {
  minLengde,
  erPakrevet,
  kunTall,
};
