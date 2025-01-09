import { StrukturertAdresse } from "../../../../../services/api";

import StrukturertAdresseKomponent from "../../../../adresser/strukturertAdresse";

interface UtfyltAdresseProps {
  adresse: StrukturertAdresse;
}

function UtfyltAdresse({ adresse }: UtfyltAdresseProps) {
  return <StrukturertAdresseKomponent adresse={adresse} />;
}

export default UtfyltAdresse;
