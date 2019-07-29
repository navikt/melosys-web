import moment from 'moment';

const minLengde = (value, min) => (value && value.length < min ? `Minimum ${min} tegn kreves` : null);
const erPakrevet = value => (!value ? 'Dette feltet er påkrevet.' : null);
const kunTall = value => (Number.isNaN(value) ? 'Skriv inn kun hele tall' : null);
const erDato = value => (!moment(value, 'DD.MM.YYYY', true).isValid() ? 'Skriv inn korrekt dato.' : null);
const avhengerAvSann = (avhengighet, value, props) => (props.values[avhengighet] && !value ? 'Dette feltet er påkrevet.' : null);

export {
  minLengde,
  erPakrevet,
  kunTall,
  erDato,
  avhengerAvSann,
};
