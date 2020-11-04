import React from 'react';
import { StrukturertAdresse } from 'Domene';

import StrukturertAdresseKomponent from '../../../../adresser/strukturertAdresse';

interface UtfyltAdresseProps {
  adresse: StrukturertAdresse,
}

const UtfyltAdresse = ({
  adresse,
}: UtfyltAdresseProps) => (
  <StrukturertAdresseKomponent adresse={adresse} />
);

export default UtfyltAdresse;
