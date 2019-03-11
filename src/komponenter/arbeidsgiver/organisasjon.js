import React, { useState } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';
import * as Ikoner from '../../resources/images';

import PanelHeader from '../panelHeader/panelHeader';

import ForretningsAdresse from '../adresser/forretningsAdresse';

import KontaktOpplysninger from '../../soknad-komponenter/kontaktopplysninger';

import './organisasjon.css';

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
const Organisasjon = props => {
  const [state, setState] = useState({
    visLeggTilKnapp: true,
  });

  const toggleVisLeggTilKnapp = () => {
    setState(gammelState => ({
      visLeggTilKnapp: !gammelState.visLeggTilKnapp,
    }));
  };

  const { organisasjon, slettHandle } = props;
  const { visLeggTilKnapp } = state;

  if (!organisasjon) { return null; }
  const {
    orgnr,
    navn,
    forretningsadresse,
  } = organisasjon;

  const content = (
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
            <Nav.Column xs="6" className="organisasjon__slettwrapper">
              <KontaktOpplysninger
                representererKode={MKV.Koder.representerer.ARBEIDSGIVER}
                juridiskOrg={organisasjon}
                visLeggTilKnapp={visLeggTilKnapp}
                toggleVisLeggTilKnapp={toggleVisLeggTilKnapp}
              />
              <div className="organisasjon__slettknapp">
                { slettHandle && <Nav.Knapp onClick={slettHandle}>Slett</Nav.Knapp> }
              </div>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
  return content;
};

Organisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  slettHandle: PT.func,
};

Organisasjon.defaultProps = {
  slettHandle: undefined,
};

export default Organisasjon;
