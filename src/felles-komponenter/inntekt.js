import React from 'react';
import { validForm } from 'react-redux-form-validation';
import PT from 'prop-types';

import * as Ikoner from '../resources/images';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Validering from './skjema/validering';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import Input from './skjema/input/input';
import Checkbox from './skjema/input/checkbox';

import './inntekt.css';

const uuid = require('uuid/v4');


function InntektLinje({ inntektLinje }) {
  const { beloep, inntektsperiodetype, virksomhetID, beskrivelse, utbetaltIPeriode } = inntektLinje;
  return (
    <tr>
      <td className="detaljer__periode">{ utbetaltIPeriode }</td>
      <td className="detaljer__orgnr">{virksomhetID}</td>
      <td className="detaljer__inntekt">{beloep} pr {inntektsperiodetype}</td>
      <td className="detaljer__beskrivelse">{beskrivelse}</td>
    </tr>
  );
}

InntektLinje.propTypes = {
  inntektLinje: MPT.InntektLinje.isRequired,
};

function Inntekt (props) {
  const { inntekt: { inntekt } } = props;
  const panelUndertittel = inntekt[0] ? `Nyeste inntekt: ${inntekt[0].beloep} i perioden ${inntekt[0].utbetaltIPeriode}` : '';
  const panelIkon = (props.pristine || props.invalid) ? Ikoner.Varsel : Ikoner.Ferdig;

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Inntekt" undertittel={panelUndertittel} />}
        ariaTittel="Panel for inntekt">
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <table className="tabellutlisting inntekt__detaljer">
              <tbody>
                <tr>
                  <th>Utbetalt</th><th>Organisasjon</th><th>Inntekt</th><th>Beskrivelse</th>
                </tr>
                {inntekt.map(inntektLinje => <InntektLinje key={uuid()} inntektLinje={inntektLinje} />)}
              </tbody>
            </table>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="6">
            <Nav.Fieldset legend="Lønn / inntekt i utlandet (NOK pr måned)">
              <Input feltNavn="lonnNorskArbeidsgiver" label="Lønn fra norsk arbeidsgiver" />
              <Input feltNavn="lonnUtenlandskArbeidsgiver" label="Lønn fra utenlandsk arbeidsgiver" />
              <Input feltNavn="inntektUtenlandskNaering" label="Inntekt fra næringsvirksomhet, inkludert honorarer fra utenlandsk arbeidsgiver" />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Naturalytelser betalt av norsk eller utenlandsk arbeidsgiver">
              <Checkbox feltNavn="inntektUtenlandskNaturalBolig" label="Fri bolig" />
              <Checkbox feltNavn="inntektUtenlandskNaturalBil" label="Fri bil" />
              <Input feltNavn="inntektUtenlandskNaturalAnnet" label="Annen naturalytelse" />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Annet">
              <Checkbox feltNavn="inntektErInnrapporteringspliktig" label="Inntekten i utenlandsperioden er innrapporteringspliktig." />
              <Checkbox feltNavn="trygdeavgiftBlirTrukketMedSkatt" label="Trygdeavgift blir trukket med skatten." />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Inntekt.propTypes = {
  inntekt: MPT.Inntekt,
  invalid: PT.bool.isRequired,
  pristine: PT.bool.isRequired,
};

Inntekt.defaultProps = {
  inntekt: {},
};

export default validForm({
  form: 'inntekt',
  initialValues: { lonnNorskArbeidsgiver: '', lonnUtenlandskArbeidsgiver: '', inntektUtenlandskNaering: '' },
  pure: false,
  validate: {
    lonnNorskArbeidsgiver: [Validering.erPakrevet, Validering.kunTall],
    lonnUtenlandskArbeidsgiver: [Validering.erPakrevet, Validering.kunTall],
    inntektUtenlandskNaering: [Validering.erPakrevet, Validering.kunTall],
  },
})(Inntekt);
