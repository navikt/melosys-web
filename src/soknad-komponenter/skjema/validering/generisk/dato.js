import * as Utils from '../../../../utils';

const datoErGyldig = (verdi = '') => !(Utils.dato.vaskInputDato(verdi) === false);

/* eslint import/prefer-default-export:off */
export { datoErGyldig };
