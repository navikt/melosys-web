import React from 'react';

import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';

import MKV from '../../../../../melosyskodeverk';

import { UtenlandskIdent } from './types';

interface UtfyltUtenlandskIdentProps {
  utenlandskeIdenter: UtenlandskIdent[],
}

const UtfyltUtenlandskIdent = ({
  utenlandskeIdenter,
}: UtfyltUtenlandskIdentProps) => (
  <>
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
  </>
);

export default UtfyltUtenlandskIdent;
