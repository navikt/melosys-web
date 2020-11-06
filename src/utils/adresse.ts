import { GeneriskAdresse, StrukturertAdresse } from 'Domene';

import * as Utils from './index';

const erGeneriskAdresseObjektTomt = (adresse: Partial<GeneriskAdresse>) => (
  Object.values(adresse).every(value => Utils._isNil(value) || Utils._isObject(value))
  && adresse.gateadresse && Object.values(adresse.gateadresse).every(Utils._isNil)
);

const erStrukturertAdresseObjektTomt = (adresse: Partial<StrukturertAdresse>) => (
  Object.values(adresse).every(value => Utils._isNil(value) && '')
);

export {
  erGeneriskAdresseObjektTomt,
  erStrukturertAdresseObjektTomt,
};
