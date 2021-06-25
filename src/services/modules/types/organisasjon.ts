import { RegisterAdresse } from "./adresse";

interface Organisasjon {
  orgnr: string;
  navn: string;
  forretningsadresse: RegisterAdresse;
  postadresse: RegisterAdresse;
  organisasjonsform: string | null;
  oppstartdato: string | null;
}

export default Organisasjon;
