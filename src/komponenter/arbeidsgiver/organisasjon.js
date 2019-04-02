import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';
import * as Ikoner from '../../resources/images';

import PanelHeader from '../panelHeader/panelHeader';
import OrganisasjonsAdresse from '../adresser/organisasjonsAdresse';
import KontaktOpplysninger from '../../soknad-komponenter/kontaktopplysninger';

import './organisasjon.css';

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
const Organisasjon = props => {
  const { organisasjon, slettHandle } = props;

  if (!organisasjon) { return null; }
  const {
    orgnr,
    navn,
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
                <OrganisasjonsAdresse visNavn={false} className="organisasjon__adresse" organisasjon={organisasjon} />
              </dl>
            </Nav.Column>
            <Nav.Column xs="6" className="organisasjon__slettwrapper">
              <KontaktOpplysninger juridiskOrg={organisasjon} />
              <div className="organisasjon__slettknapp">
                { slettHandle && <Nav.Knapp onClick={slettHandle}>Slett</Nav.Knapp> }
              </div>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Organisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  slettHandle: PT.func,
};

Organisasjon.defaultProps = {
  slettHandle: undefined,
};

export default Organisasjon;
