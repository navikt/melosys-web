import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';
import * as Api from '../../services/api';
import * as Utils from '../../utils';

import PanelHeader from '../../komponenter/panelHeader/panelHeader';
import { fagsakSelectors } from '../../ducks/fagsaker';

import Fullmektig from './fullmektig';

import './fullmektig.css';

const uuid = require('uuid/v4');

const aktoerTemplate = {
  aktoerID: undefined,
  databaseID: 0,
  institusjonsID: undefined,
  orgnr: undefined,
  representererKode: undefined,
  rolleKode: undefined,
  utenlandskPersonID: undefined,
};

export class FullmektigPanel extends Component {
  state = {
    fullmektige: [],
    disableLeggTilFullmektig: false,
  };

  componentDidMount() {
    this.hentFullmektige();
  }
  hentOrg = orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
  hentAktoer = (saksnr, rolleKode, representererKode) => Api.Fagsaker.aktoer.hent(saksnr, rolleKode, representererKode);
  lagreAktoer = (saksnr, data) => Api.Fagsaker.aktoer.send(saksnr, data);
  slettAktoer = databaseID => Api.Fagsaker.aktoer.slett(databaseID);

  lagreNyFullmektigOgOppdaterLokalt = async (representererKode, orgnr) => {
    try {
      const lagretFullmektig = await this.lagreFullmektig(representererKode, orgnr);
      this.setState(prevState => ({
        fullmektige: this.byttUtTemplateMedLagretFullmektig(prevState.fullmektige, lagretFullmektig),
        disableLeggTilFullmektig: false,
      }));
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  byttUtTemplateMedLagretFullmektig = (fullmektige, lagretFullmektig) => fullmektige.map(fullmektig => ((fullmektig.databaseID === 0) ? { ...lagretFullmektig } : { ...fullmektig }));

  lagreFullmektig = (representererKode, orgnr, databaseID) => {
    const { lagreAktoer } = this;
    const { oppsummering } = this.props;

    const aktoer = {
      ...aktoerTemplate,
      aktoerID: null,
      databaseID: databaseID || null,
      orgnr,
      utenlandskPersonID: null,
      institusjonsID: null,
      rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
      representererKode,
    };
    lagreAktoer(oppsummering.saksnummer, aktoer);
  };

  apneLeggTilFullmektigDialog = () => {
    this.setState(prevState => ({
      fullmektige: [...prevState.fullmektige, { ...aktoerTemplate }],
      disableLeggTilFullmektig: true,
    }));
  };

  hentFullmektige = async () => {
    const { hentAktoer } = this;
    const { saksnummer } = this.props.oppsummering;

    try {
      const fullmektige = await hentAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT);
      this.setState({ fullmektige });
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  slettFullmektigLokalt = databaseID => {
    const nyFullmektige = this.state.fullmektige.filter(fullmektig => fullmektig.databaseID !== databaseID);
    this.setState({
      fullmektige: nyFullmektige,
    });
    this.setState({ disableLeggTilFullmektig: false });
  };

  render() {
    const {
      hentOrg,
      slettAktoer,
      lagreFullmektig,
      slettFullmektigLokalt,
      apneLeggTilFullmektigDialog,
      lagreNyFullmektigOgOppdaterLokalt,
    } = this;

    const { redigerbart } = this.props;
    const panelIkon = Ikoner.Ferdig;

    const { disableLeggTilFullmektig } = this.state;

    return (
      <div>
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Fullmektig" />}
          ariaTittel="Opplysninger om fullmektig">
          <Nav.Container fluid>
            {this.state.fullmektige.map(fullmektig => (
              <Fullmektig
                key={uuid()} // Kan ikke bruke databaseID her da den er nullable
                databaseID={fullmektig.databaseID}
                redigerbart={redigerbart}
                fullmektig={fullmektig}
                lagreFullmektig={lagreFullmektig}
                slettAktoer={slettAktoer}
                slettFullmektigLokalt={slettFullmektigLokalt}
                lagreNyFullmektigOgOppdaterLokalt={lagreNyFullmektigOgOppdaterLokalt}
                hentOrg={hentOrg}
              />
            ))}
            <Nav.Knapp disabled={disableLeggTilFullmektig || !redigerbart} onClick={apneLeggTilFullmektigDialog} type="mini">+ LEGG TIL FULLMEKTIG</Nav.Knapp>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

FullmektigPanel.propTypes = {
  oppsummering: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});
/*
const ConnectedFullmektigPanel = props => (
  <FullmektigPanel
    {...props}
  />
);
*/
export default connect(mapStateToProps)(FullmektigPanel);

