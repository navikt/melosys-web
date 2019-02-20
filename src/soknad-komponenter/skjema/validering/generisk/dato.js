import { vaskInputDato } from '../../../../utils/dato';

const datoErGyldig = (verdi = '') => !(vaskInputDato(verdi) === false);

/* eslint import/prefer-default-export:off */
export { datoErGyldig };
