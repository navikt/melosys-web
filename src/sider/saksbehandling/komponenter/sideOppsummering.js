import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import { formatterDatoTilNorsk } from '../../../utils/dato';
import { soknadSelectors } from '../../../ducks/soknad';
import { fagsakSelectors } from '../../../ducks/fagsaker';
import { behandlingerOperations, behandlingerSelectors } from '../../../ducks/behandlinger';
import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import Behandlingsmeny from './behandlingsmeny';
import Behandlingsstatus from './behandlingsstatus';
import Oppsummering from '../../../felleskomponenter/oppsummering';

import './sideOppsummering.css';

class SideOppsummering extends Component {
  apneTidligereBehandlinger = () => {
    const URI_SOK = `/sok/${this.props.person.fnr}`;
    window.open(URI_SOK);
  };

  render() {
    const {
      behandlingID,
      fagsak,
      oppsummering,
      person,
      soknadsperiodeFom,
      soknadsperiodeTom,
      behandlingstype,
    } = this.props;

    if (!oppsummering) return <div />;

    const {
      lagreOgLukkHandle,
      oppfriskSaksopplysningerHandle,
      tilbakeleggeHandle,
      visHenleggDialogHandle,
      visAvslagSoknadDialogHandle,
      arbeidsland,
      avsluttSakSomBortfalt,
      endreLovvalgsperiodeRedigerbart,
    } = this.props;

    return (
      <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
        <Nav.Panel className="saksbehandling__soknadSammendrag">
          <Nav.Row>
            <Nav.Column xs="12" md="12">
              <div className="oppsummering__menylinje">
                <Behandlingsmeny
                  lagreOgLukkHandle={lagreOgLukkHandle}
                  tilbakeleggeHandle={tilbakeleggeHandle}
                  oppfriskSaksopplysningerHandle={oppfriskSaksopplysningerHandle}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  avsluttSakSomBortfalt={avsluttSakSomBortfalt}
                  apneTidligereBehandlinger={this.apneTidligereBehandlinger}
                  redigerbart={endreLovvalgsperiodeRedigerbart}
                  visHenleggSak={behandlingstype !== MKV.Koder.behandlinger.typer.ENDRET_PERIODE}
                  visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                />
              </div>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12" md="6">
              <Nav.Undertittel className="soknadSammendrag__header">Søknad</Nav.Undertittel>
            </Nav.Column>
          </Nav.Row>
          {/* START OPPSUMMERING */}
          <Nav.Row>
            <Nav.Column xs="12">
              {oppsummering && <Oppsummering
                arbeidsland={arbeidsland}
                fagsak={fagsak}
                oppsummering={oppsummering}
                person={person}
                soknadsperiodeFom={soknadsperiodeFom}
                soknadsperiodeTom={soknadsperiodeTom}
              />
              }
            </Nav.Column>
          </Nav.Row>
          {/* END OPPSUMMERING */}
          {/* START BEHANDLINGSSTATUS */}
          <Nav.Row>
            <Nav.Column xs="12">
              <Behandlingsstatus behandlingID={behandlingID} />
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT BEHANDLINGSSTATUS */}
        </Nav.Panel>
      </section>
    );
  }
}

SideOppsummering.propTypes = {
  behandlingID: PT.number.isRequired,
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool,
  endreLovvalgsperiodeRedigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  avsluttSakSomBortfalt: PT.func.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  tilForsidenHandle: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
};
SideOppsummering.defaultProps = {
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
};

const mapStateToProps = state => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  endreLovvalgsperiodeRedigerbart: behandlingerSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  soknadsperiodeFom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
  soknadsperiodeTom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
