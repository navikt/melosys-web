import React from 'react';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/index';
import * as Ikoner from '../../resources/images/index';

import PanelHeader from '../panelHeader/panelHeader';

import ForretningsAdresse from '../adresser/forretningsAdresse';

import './organisasjon.css';

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
const Organisasjon = ({ organisasjon }) => {
  if (!organisasjon) { return null; }

  const {
    orgnr,
    navn,
    forretningsadresse,
  } = organisasjon;

  return (
    <div className="panelSeksjon organisasjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader
          ikon={Ikoner.Arbeidsgiver}
          tittel={`Arbeidsgiver i Norge: ${navn}`}
          undertittel={<div>{`Org.nr: ${orgnr}`} </div>}
        />}
        ariaTittel={`Panel for arbeidsgiveren ${navn}`} >
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="6">
              <dl className="organisasjon__detaljer">
                <dt>Forretningsadresse</dt>
                <dd>{<ForretningsAdresse forretningsadresse={forretningsadresse} />}</dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Organisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
};

export default Organisasjon;
