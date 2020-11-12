import * as Utils from '../../../utils';

export const lagDatalistID = () => `datalist-${Utils._uuid()}`;
export const landTekstFormat = landObjekt => (`${landObjekt.term} (${landObjekt.kode})`);
export const landTekstFormatStoreForbokstaver = landObjekt => (`${Utils.streng.storeForbokstaver(landObjekt.term)} (${landObjekt.kode})`);
