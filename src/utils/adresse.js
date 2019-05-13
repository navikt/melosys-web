import * as Utils from './index';

const erAdresseObjektTomt = adresse => (
  Object.values(adresse).every(value => Utils._isNil(value) || Utils._isObject(value))
  && Object.values(adresse.gateadresse).every(Utils._isNil)
);

export { erAdresseObjektTomt };
