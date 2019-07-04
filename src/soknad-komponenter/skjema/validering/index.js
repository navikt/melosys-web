import { idErBlank, navnAvsenderErBlank, idErIkkeFnrEllerDnr, idErIkkeFnrEllerDnrEllerOrgnr, idErIkkeNummer, idErIkkeOrgnr, idFinnesIkke } from './mikrovalidering';
import { adresseKreves, norskPostNummer } from './generisk/adresse';
import { minLengde, erPakrevet, kunTall, erDato, avhengerAvSann } from './generisk';
import { fulltNavn, erGyldigDnr, erGyldigFnr } from './generisk/person';
import Felles from './felles';
import * as Skjemaer from './skjemaer';

export {
  idErBlank, navnAvsenderErBlank, idErIkkeFnrEllerDnr, idErIkkeFnrEllerDnrEllerOrgnr, idErIkkeNummer, idErIkkeOrgnr, idFinnesIkke,
  adresseKreves,
  norskPostNummer,
  minLengde,
  erPakrevet,
  fulltNavn,
  erGyldigDnr,
  erGyldigFnr,
  kunTall,
  erDato,
  avhengerAvSann,
  Felles,
  Skjemaer,
};
