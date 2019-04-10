import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Ikoner from '../resources/images/index';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/index';
import * as Skjema from './skjema/index';

import { fagsakSelectors } from '../ducks/fagsaker/';
import PanelHeader from '../komponenter/panelHeader/panelHeader';
import './inntektUtland.css';

function Inntekt (props) {
  const { redigerbart } = props;
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="inntektUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Inntekt under oppholdet" undertittel="" />}
        ariaTittel="Panel for inntekt under oppholdet">
        <Nav.Row className="iinntektUtland__seksjon">
          <Nav.Column xs="9">
            <Nav.Fieldset legend="Lønn / inntekt i utlandet(NOK pr måned)">
              <Skjema.Input feltNavn="inntektNorskIPerioden" label="Lønn fra norsk arbeidsgiver" disabled={!redigerbart} />
              <Skjema.Input feltNavn="inntektUtenlandskIPerioden" label="Lønn fra utenlandsk arbeidsgiver" disabled={!redigerbart} />
              <Skjema.Input feltNavn="inntektNaeringIPerioden" label="Inntekt fra næringsvirksomhet, inkludert honorarer fra utenlandsk arbeidsgiver" disabled={!redigerbart} />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Naturalytelser betalt av norsk eller utenlandsk arbeidsgiver">
              <Skjema.Checkbox feltNavn="inntektNaturalFribolig" label="Fri bolig" disabled={!redigerbart} />
              <Skjema.Checkbox feltNavn="inntektNaturalFribil" label="Fri bil" disabled={!redigerbart} />
              <Skjema.Input feltNavn="inntektNaturalIAnnet" label="Annen naturalytelse" disabled={!redigerbart} />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Annet">
              <Skjema.Checkbox feltNavn="inntektErInnrapporteringspliktig" label="Inntekten i utenlandsperioden er innrapporteringspliktig." disabled={!redigerbart} />
              <Skjema.Checkbox feltNavn="inntektTrygdeavgiftBlirTrukket" label="Trygdeavgift blir trukket med skatten." disabled={!redigerbart} />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Inntekt.propTypes = {
  redigerbart: PT.bool.isRequired,
  inntekt: MPT.Inntekt,
};

Inntekt.defaultProps = {
  inntekt: {},
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Inntekt);
