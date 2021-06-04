import React from "react";

import * as Api from "../../../../../services/api";

import StrukturertAdresseKomponent from "../../../../adresser/strukturertAdresse";

interface UtfyltAdresseProps {
  adresse: Api.Types.StrukturertAdresse;
}

const UtfyltAdresse = ({ adresse }: UtfyltAdresseProps) => <StrukturertAdresseKomponent adresse={adresse} />;

export default UtfyltAdresse;
