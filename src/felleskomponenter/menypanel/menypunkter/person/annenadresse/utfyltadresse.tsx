import React, { MouseEventHandler } from 'react';
import { StrukturertAdresse } from 'Domene';

import * as Nav from '../../../../../utils/navFrontend';
import * as Symboler from '../../symboler';

import StrukturertAdresseKomponent from '../../../../adresser/strukturertAdresse';

interface UtfyltAdresseProps {
  pencilClickHandler: MouseEventHandler,
  binClickHandler: MouseEventHandler,
  tittel: string,
  adresse: StrukturertAdresse,
  redigerbart: boolean,
}

const UtfyltAdresse = ({
  pencilClickHandler,
  binClickHandler,
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
            onClick={e => pencilClickHandler(e)}
          />
          <Symboler.Slett
            onClick={e => binClickHandler(e)}
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
