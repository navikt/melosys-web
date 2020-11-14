import { GeneriskAdresse } from './adresse';

type Organisasjon = {
  orgnr: string,
  navn: string,
  forretningsadresse: GeneriskAdresse,
  postadresse: GeneriskAdresse,
};

export default Organisasjon;
