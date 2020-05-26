import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';

import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import './inntektUtland.css';

export function Inntekt (props) {
  const { redigerbart } = props;

  return (
    <div className="inntektUtland">
      <Nav.Row className="iinntektUtland__seksjon">
        <Nav.Column xs="9">
          <Nav.typo.Element>Lønn/inntekt i utlandet (NOK per måned)</Nav.typo.Element>
          <Nav.Fieldset legend="">
            <Skjema.Input placeholder="Skriv inn" feltNavn="inntektNorskIPerioden" label="Utbetalt av arbeids-/oppdragsgivere i Norge" disabled={!redigerbart} />
            <Skjema.Input placeholder="Skriv inn" feltNavn="inntektUtenlandskIPerioden" label="Utbetalt av arbeids-/oppdragsgivere i utlandet" disabled={!redigerbart} />
          </Nav.Fieldset>
          <Nav.Fieldset legend="Naturalytelser betalt av norsk eller utenlandsk arbeidsgiver">
            <Skjema.Checkbox feltNavn="inntektNaturalFribolig" label="Fri bolig" disabled={!redigerbart} />
            <Skjema.Checkbox feltNavn="inntektNaturalFribil" label="Fri bil" disabled={!redigerbart} />
            <Skjema.Input placeholder="Skriv inn" feltNavn="inntektNaturalIAnnet" label="Oppgi annen naturalytelse" disabled={!redigerbart} />
          </Nav.Fieldset>
          <Nav.Fieldset legend="Annet">
            <Skjema.Checkbox feltNavn="inntektErInnrapporteringspliktig" label="Inntekten i utenlandsperioden er innrapporteringspliktig." disabled={!redigerbart} />
            <Skjema.Checkbox feltNavn="inntektTrygdeavgiftBlirTrukket" label="Trygdeavgift blir trukket med skatten." disabled={!redigerbart} />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

Inntekt.propTypes = {
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Inntekt);
