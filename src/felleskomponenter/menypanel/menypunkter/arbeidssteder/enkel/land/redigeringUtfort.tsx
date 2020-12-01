import React, { Fragment } from 'react';

import * as KV from '../../../../../../kodeverk';
import * as Nav from '../../../../../../utils/navFrontend';

import { StrukturertAdresse } from '../../../../../adresser';

import { EnRedigeringsknappListeRedigeringUtfort } from '../../../editerbartElementListe';

import './redigeringUtfort.css';

const RedigeringUtfort = ({
  verdier,
}: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedUtland>) => (
  <div className="arbeidssted__utland__redigeringutfort">
    {
      verdier.map((element, index) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <Fragment key={index}>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.typo.Element>Navn på virksomhet</Nav.typo.Element>
              <Nav.typo.Normaltekst>{element.foretakNavn}</Nav.typo.Normaltekst>
            </Nav.Column>
          </Nav.Row>
          <StrukturertAdresse adresse={element.adresse} />
        </Fragment>
      ))
    }
  </div>
);

export default RedigeringUtfort;
