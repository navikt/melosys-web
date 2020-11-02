import React, { MouseEventHandler } from 'react';

import * as Nav from '../../../../../utils/navFrontend';
import * as Symboler from '../../symboler';
import * as KV from '../../../../../kodeverk';

import MKV from '../../../../../melosyskodeverk';

import { UtenlandskIdent } from './types';

interface UtfyltUtenlandskIdentProps {
  pencilClickHandler: MouseEventHandler,
  binClickHandler: MouseEventHandler,
  tittel: string,
  utenlandskeIdenter: UtenlandskIdent[],
  redigerbart: boolean,
}

const UtfyltUtenlandskIdent = ({
  pencilClickHandler,
  binClickHandler,
  tittel,
  redigerbart,
  utenlandskeIdenter,
}: UtfyltUtenlandskIdentProps) => {
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
          <Symboler.SlettAlt
            onClick={e => binClickHandler(e)}
          />
        </>
      }
    </div>
  );

  return (
    <Nav.Fieldset legend={legend}>
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.typo.Normaltekst>ID-nummer</Nav.typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        {
          utenlandskeIdenter.map(({ ident, landkode }) => (
            <div key={ident}>
              <Nav.Column xs="6">
                <Nav.typo.Element>{ident}</Nav.typo.Element>
              </Nav.Column>
              <Nav.Column xs="6">
                {
                  landkode &&
                  <Nav.typo.Normaltekst>{KV.kodeTilTerm(landkode, MKV.KTObjects.landkoder)}</Nav.typo.Normaltekst>
                }
              </Nav.Column>
            </div>
          ))
        }
      </Nav.Row>
    </Nav.Fieldset>
  );
};


export default UtfyltUtenlandskIdent;
