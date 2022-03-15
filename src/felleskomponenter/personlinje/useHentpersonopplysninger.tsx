import "./personlinje.css";
import MKV from "../../melosyskodeverk";
import * as StringUtils from "../../utils/streng";
import * as PersonUtils from "../../utils/person";
import { useHentPersonopplysningerQuery } from "./hentpersonopplysninger.generated";
import { KjoennType } from "../../graphql";

type PersonopplysningerProps = {
  navn: string;
  kjoenn: KjoennType;
  erDoed: boolean;
  fnr: string;
  statsborgerskap: string[];
  sivilstand: string;
} | null;

const useHentPersonopplysninger = (behandlingID: number, skip: boolean): PersonopplysningerProps => {
  const { data, error } = useHentPersonopplysningerQuery({ variables: { behandlingID }, skip });

  const person = data?.hentSaksopplysninger.persondata;
  if (error || !person) return null;

  const gyldigeStatsborgerskap = person.statsborgerskap
    .filter((statsborgerskap) => !statsborgerskap.erHistorisk)
    .map((statsborgerskap) => StringUtils.storeForbokstaverForLand(statsborgerskap.land));

  const gyldigSivilstand = person.sivilstand
    .filter((sivilstand) => !sivilstand.erHistorisk)
    .map((sivilstand) => sivilstand.type)
    .pop();

  const gyldigPersonstatus = person.folkeregisterpersonstatuser
    .filter((folkeregisterpersonstatus) => !folkeregisterpersonstatus.erHistorisk)
    .pop();

  return {
    navn: PersonUtils.tilSammensattNavn(person.navn.fornavn, person.navn.mellomnavn, person.navn.etternavn),
    kjoenn: person.kjoenn,
    erDoed: gyldigPersonstatus?.kode === MKV.Koder.personstatuser.DOED,
    fnr: person.folkeregisteridentifikator || "",
    statsborgerskap: gyldigeStatsborgerskap || [],
    sivilstand: gyldigSivilstand || "",
  };
};

export default useHentPersonopplysninger;
