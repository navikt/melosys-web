import React, { Component } from 'react';
import { reduxForm, arrayPush } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import DatoOmrade from './datoOmrade/datoOmrade';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import { boolTilNorsk } from '../utils/utils';

import './arbeidsforholdene.css';
import EnkeltDato from './datoOmrade/enkeltDato';

const uuid = require('uuid/v4');

function Arbeidsavtalen({ avtalen }) {
  const {
    arbeidstidsordning,
    avloenningstype,
    yrke,
    beregnetAntallTimerPrUke,
    endringsdatoStillingsprosent,
  } = avtalen;

  return (
    <div className="arbeidsavtale">
      <Nav.Element>Arbeidsavtale</Nav.Element>
      <dt>Ordning</dt>
      <dd>{arbeidstidsordning || '-'}</dd>
      <dt>Timer pr uke</dt>
      <dd>{beregnetAntallTimerPrUke || '-'}</dd>
      <dt>Sist endret</dt>
      <dd><EnkeltDato dato={endringsdatoStillingsprosent} /></dd>
      <dt>Yrke</dt>
      <dd>{yrke || '-'}</dd>
      <dt>Lønnstype</dt>
      <dd>{avloenningstype || '-'}</dd>
    </div>
  );
}

Arbeidsavtalen.propTypes = {
  avtalen: MPT.Arbeidsavtale.isRequired,
};

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param { arbeidsforhold } Object Et objekt med det aktuelle arbeidsforholdet.
 */
const Arbeidsforhold = props => {
  const {
    arbeidsforholdID,
    arbeidsforholdIDnav,
    ansettelsesPeriode,
    arbeidsforholdstype,
    Aordning,
    arbeidsgiver: { navn: arbeidsgiverNavn },
    arbeidsavtaler,
  } = props.arbeidsforhold;

  const { leggtilArbeidsforhold } = props;

  return (
    <div className="panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader
          ikon={Ikoner.Ferdig}
          tittel={`Arbeidsforhold: ${arbeidsgiverNavn}`}
          undertittel={<div>Periode: <EnkeltDato dato={ansettelsesPeriode.fom} /> - <EnkeltDato dato={ansettelsesPeriode.tom} /> </div>}
        />}
        ariaTittel={`Panel for arbeidsforhold hos ${arbeidsgiverNavn}`} >
        <Nav.Row className="arbeidsforhold__enkelt">
          <div className="arbeidsforholdene panelSeksjon">
            <Nav.Row className="arbeidsforhold__enkelt">
              <Nav.Column xs="5">
                <Nav.Container fluid>
                  <DatoOmrade periode={ansettelsesPeriode} />
                  <dl className="arbeidsforhold__detaljer">
                    <dt>A-ordning:</dt>
                    <dd>{boolTilNorsk(Aordning)}</dd>
                  </dl>
                </Nav.Container>
              </Nav.Column>
              <Nav.Column xs="7">
                <dl className="arbeidsforhold__detaljer">
                  <dt>NAV-ID:</dt>
                  <dd>{arbeidsforholdIDnav}</dd>
                  <dt>Type:</dt>
                  <dd>{arbeidsforholdstype}</dd>
                </dl>
                <dl className="arbeidsforhold__detaljer">
                  { arbeidsavtaler.map(avtalen => <Arbeidsavtalen key={uuid()} avtalen={avtalen} />) }
                </dl>
              </Nav.Column>
            </Nav.Row>
          </div>
          <Nav.Knapp type="hoved" className="arbeidsforhold__relevantknapp" onClick={() => leggtilArbeidsforhold(arbeidsforholdID)}>Velg arbeidsforhold</Nav.Knapp>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Arbeidsforhold.propTypes = {
  arbeidsforhold: MPT.Arbeidsforhold.isRequired,
  leggtilArbeidsforhold: PT.func.isRequired,
};


/** Dette er grunnkomponenten som eksporteres til omverden.
 * Flertall: Arbeidsforholdene - en array med alle arbeidsforhold, hver som ett objekt.
 * Entall: Arbeidsforhold - et objekt med ett enkelt arbeidsforhold.
 *
 * @param { arbeidsforholdene } Array En liste over alle arbeidforhold, hvert som et objekt
 */
class Arbeidsforholdene extends Component {
  leggtilArbeidsforholdHandler = arbeidsforholdID => {
    const { dispatch } = this.props;
    dispatch(arrayPush('vurderingArbeidsforhold', 'arbeidsforholdene', arbeidsforholdID));
  }

  render () {
    const { arbeidsforholdene } = this.props;
    const { leggtilArbeidsforholdHandler } = this;

    return (
      <div className="arbeidsforholdene">
        {arbeidsforholdene.map(arbeidsforhold => <Arbeidsforhold
          key={uuid()}
          arbeidsforhold={arbeidsforhold}
          leggtilArbeidsforhold={leggtilArbeidsforholdHandler}
        />)}
      </div>
    );
  }
}

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  dispatch: PT.func.isRequired,
};

export default reduxForm({
  form: 'vurderingArbeidsforhold',
})(Arbeidsforholdene);
