import React, { MouseEventHandler } from 'react';
import { StrukturertAdresse } from 'Domene';

import * as Nav from '../../../../../utils/navFrontend';
import * as Symboler from '../../symboler';

import StrukturertAdresseKomponent from '../../../../adresser/strukturertAdresse';

interface UtfyltAdresseProps {
  onPencilClick: MouseEventHandler,
  onBinClick: MouseEventHandler,
  tittel: string,
  adresse: StrukturertAdresse,
  redigerbart: boolean,
}

const UtfyltAdresse = ({
  onPencilClick,
  onBinClick,
  tittel,
  adresse,
  redigerbart,
}: UtfyltAdresseProps) => {
  const legend = (
    <div>
      <span style={{ marginRight: '10px' }}>{tittel}</span>
      {
        redigerbart &&
        <>
          <Symboler.Rediger
            style={{ marginRight: '10px' }}
            onClick={e => onPencilClick(e)}
          />
          <Symboler.SlettAlt
            onClick={e => onBinClick(e)}
          />
        </>
      }
    </div>
  );

  return (
    <Nav.Fieldset legend={legend}>
      <StrukturertAdresseKomponent adresse={adresse} />
    </Nav.Fieldset>
  );
};


export default UtfyltAdresse;
