const minLengde = (value, min) => (value && value.length < min ? `Minimum ${min} tegn kreves` : null);
const erPakrevet = value => (!value ? 'Dette feltet er påkrevet.' : null);

export {
  minLengde,
  erPakrevet,
};
