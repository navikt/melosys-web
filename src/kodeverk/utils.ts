import { KTObject } from "@navikt/melosys-kodeverk";
import * as Koder from "./koder";

export const erDoed = (personStatus: KTObject) =>
  [Koder.PersonStatus.DØD, Koder.PersonStatus.DØDD].includes(personStatus.kode);
