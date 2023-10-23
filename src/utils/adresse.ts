import { RegisterAdresse, StrukturertAdresse } from "../services/api";

import * as Utils from "./index";

const erRegisterAdresseObjektTomt = (adresse?: Partial<RegisterAdresse>) =>
  adresse &&
  Object.values(adresse).every((value) => Utils._isNil(value) || Utils._isObject(value)) &&
  adresse.gateadresse &&
  Object.values(adresse.gateadresse).every(Utils._isNil);

const erStrukturertAdresseObjektTomt = (adresse: Partial<StrukturertAdresse>) =>
  Object.values(adresse).every((value) => Utils._isNil(value) || value === "");

export { erRegisterAdresseObjektTomt, erStrukturertAdresseObjektTomt };
