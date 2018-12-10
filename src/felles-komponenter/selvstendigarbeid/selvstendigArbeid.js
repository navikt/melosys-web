import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';

import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';
import * as Skjema from '../skjema';
import * as formSelectors from '../../ducks/form/selectors';
import * as soknadActions from '../../ducks/soknad/actions';
import { fagsakSelectors } from '../../ducks/fagsaker';

import SelvstendigeForetak from './selvstendigeforetak';
import { BOOLSK } from '../../constants';

import PanelHeader from '../panelHeader/panelHeader';

import { OrganisasjonSelectors, OrganisasjonOperations } from '../../ducks/organisasjoner';

import './selvstendigArbeid.css';

const SelvstendigArbeid = props => {
  const { values: soknadVerdier } = props.soknadForm;
  const {
    redigerbart, organisasjoner, hentOrganisasjon, oppdaterSoknadState,
  } = props;
  const { erSelvstendig } = soknadVerdier;
  const panelErRelevant = erSelvstendig === BOOLSK.SANN;

  const panelIkon = panelErRelevant ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  const foretakListe = erSelvstendig === BOOLSK.SANN ?
    <FieldArray
      name="selvstendigForetak"
      component={SelvstendigeForetak}
      organisasjoner={organisasjoner}
      hentOrganisasjon={hentOrganisasjon}
      oppdaterSoknadState={oppdaterSoknadState}
      skjema={soknadVerdier}
    />
    : null;

  return (
    <div className="selvstendigArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Arbeid som selvstendig næringsdrivende" undertittel="" />}
        ariaTittel="Arbeid som selvstendig næringsdrivende">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="erSelvstendig" label="Oppgir søker at han eller hun jobber som selvstendig næringsdrivende?">
                <Skjema.Radio feltNavn="erSelvstendig" value={BOOLSK.SANN} label="Ja" disabled={!redigerbart} />
                <Skjema.Radio feltNavn="erSelvstendig" value={BOOLSK.USANN} label="Nei" disabled={!redigerbart} />
              </Skjema.RadioGruppe>
            </Nav.Column>
          </Nav.Row>
          { foretakListe }
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

SelvstendigArbeid.propTypes = {
  redigerbart: PT.bool.isRequired,
  soknadForm: PT.object,
  hentOrganisasjon: PT.func.isRequired,
  organisasjoner: PT.array.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
};

SelvstendigArbeid.defaultProps = {
  soknadForm: {},
};

const mapStateToProps = state => ({
  soknadForm: formSelectors.SoknadenFormSelector(state),
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
  oppdaterSoknadState: skjema => dispatch(soknadActions.oppdaterSoknadState(skjema)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SelvstendigArbeid);
