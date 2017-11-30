import React from 'react';
import { validForm } from 'react-redux-form-validation';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Ikoner from '../resources/images';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './inntekt.css';

const uuid = require('uuid/v4');

function InntektLinje({ inntektLinje }) {
  const { beloep, inntektsperiodetype, virksomhet, beskrivelse, utbetaltIPeriode } = inntektLinje;
  const { navn } = virksomhet;

  return (
    <tr>
      <td className="detaljer__periode">{ utbetaltIPeriode }</td>
      <td className="detaljer__firma">{navn}</td>
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
  const panelUndertittel = inntekt[0] ? `Nyeste inntekt: ${inntekt[0].beloep} fra ${inntekt[0].virksomhet.navn} i perioden ${inntekt[0].utbetaltIPeriode}` : '';
  const panelIkon = (props.pristine || props.invalid) ? Ikoner.Varsel : Ikoner.Ferdig;

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Inntekt" undertittel={panelUndertittel} />}
        ariaTittel="Panel for inntekt">
        <form name="inntekt" id="inntekt">
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
            <Nav.Column xs="8">
              <Nav.Fieldset legend="Lønn / inntekt i utlandet (NOK pr måned)">
                <Skjema.Input feltNavn="inntektNorskIPerioden" label="Lønn fra norsk arbeidsgiver" />
                <Skjema.Input feltNavn="inntektUtenlandskIPerioden" label="Lønn fra utenlandsk arbeidsgiver" />
                <Skjema.Input feltNavn="inntektNaeringIPerioden" label="Inntekt fra næringsvirksomhet, inkludert honorarer fra utenlandsk arbeidsgiver" />
              </Nav.Fieldset>
              <Nav.Fieldset legend="Naturalytelser betalt av norsk eller utenlandsk arbeidsgiver">
                <Skjema.Checkbox feltNavn="inntektNaturalFribolig" label="Fri bolig" />
                <Skjema.Checkbox feltNavn="inntektNaturalFribil" label="Fri bil" />
                <Skjema.Input feltNavn="inntektNaturalIAnnet" label="Annen naturalytelse" />
              </Nav.Fieldset>
              <Nav.Fieldset legend="Annet">
                <Skjema.Checkbox feltNavn="inntektInnrapporteringspliktig" label="Inntekten i utenlandsperioden er innrapporteringspliktig." />
                <Skjema.Checkbox feltNavn="inntektTrygdeavgiftBlirTrukket" label="Trygdeavgift blir trukket med skatten." />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </form>
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

function mapStateToProps(state, ownProps) {
  return {
    initialValues: {
      inntektNorskIPerioden: ownProps.soknadArbeidsinntekt.inntektNorskIPerioden,
      inntektUtenlandskIPerioden: ownProps.soknadArbeidsinntekt.inntektUtenlandskIPerioden,
      inntektNaeringIPerioden: ownProps.soknadArbeidsinntekt.inntektNaeringIPerioden,
    },
  };
}

const FormComponent = validForm({
  form: 'inntekt',
  enableReinitialize: true,
  validate: {
    inntektNorskIPerioden: [Skjema.Validering.erPakrevet, Skjema.Validering.kunTall],
    inntektUtenlandskIPerioden: [Skjema.Validering.erPakrevet, Skjema.Validering.kunTall],
    inntektNaeringIPerioden: [Skjema.Validering.erPakrevet, Skjema.Validering.kunTall],
  },
})(Inntekt);


export default connect(mapStateToProps)(FormComponent);
