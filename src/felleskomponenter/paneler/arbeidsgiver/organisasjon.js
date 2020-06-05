import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import OrganisasjonsAdresse from '../../adresser/organisasjonsAdresse';
import KontaktOpplysninger from '../../kontaktopplysninger';

import './organisasjon.css';

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
const Organisasjon = ({
  organisasjon,
  slettHandle,
  redigerbart,
}) => {
  if (!organisasjon) { return null; }
  const {
    orgnr,
  } = organisasjon;

  return (
    <div className="panelSeksjon organisasjon">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.typo.Element className="orgnr">Org. nr: </Nav.typo.Element>
            <Nav.typo.Normaltekst className="orgnr">{orgnr}</Nav.typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <dl className="organisasjon__detaljer">
              <OrganisasjonsAdresse visNavn={false} className="organisasjon__adresse" organisasjon={organisasjon} />
            </dl>
          </Nav.Column>
          <Nav.Column xs="6" className="organisasjon__slettwrapper">
            <KontaktOpplysninger juridiskOrg={organisasjon} redigerbart={redigerbart} />
            <div className="organisasjon__slettknapp">
              { slettHandle && <Nav.Knapp disabled={!redigerbart} onClick={slettHandle}>Slett</Nav.Knapp> }
            </div>
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Organisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  slettHandle: PT.func,
  redigerbart: PT.bool.isRequired,
};

Organisasjon.defaultProps = {
  slettHandle: undefined,
};

export default Organisasjon;
