import React from 'react';

import * as Ikoner from '../resources/images';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './inntekt.css';

function Inntekt () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Inntekt under oppholdet" undertittel="" />}
        ariaTittel="Panel for inntekt under oppholdet">
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="9">
            <Nav.Fieldset legend="Lønn / inntekt i utlandet(NOK pr måned)">
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
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Inntekt.propTypes = {
  inntekt: MPT.Inntekt,
};

Inntekt.defaultProps = {
  inntekt: {},
};

export default Inntekt;
