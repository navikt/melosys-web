import * as Koder from "./koder";

export const erDoed = (personStatusKode: string) =>
  [Koder.PersonStatus.DØD, Koder.PersonStatus.DØDD].includes(personStatusKode);
