import { StrukturertAdresse } from "../../../../../services/api";

import StrukturertAdresseKomponent from "../../../../adresser/strukturertAdresse";

interface UtfyltAdresseProps {
  adresse: StrukturertAdresse;
}

const UtfyltAdresse = ({ adresse }: UtfyltAdresseProps) => <StrukturertAdresseKomponent adresse={adresse} />;

export default UtfyltAdresse;
