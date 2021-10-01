import * as Utils from "../../../../utils";

const datoErGyldig = (verdi = "") => !(Utils.dato.vaskInputDato(verdi) === false);

export { datoErGyldig };
