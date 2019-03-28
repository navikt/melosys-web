import React, { Component, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';
import * as Api from '../../services/api';
import * as Utils from '../../utils';

import PanelHeader from '../../komponenter/panelHeader/panelHeader';
import Kontaktopplysninger from '../kontaktopplysninger';
import PostAdresse from '../../komponenter/adresser/postAdresse';
import SokFullmektigOrg from './sokFullmektigOrg';
import { fagsakSelectors } from '../../ducks/fagsaker';

import './fullmektig.css';

const aktoerTemplate = {
  aktoerID: undefined,
  databaseID: 0,
  institusjonsID: undefined,
  orgnr: undefined,
  representererKode: undefined,
  rolleKode: undefined,
  utenlandskPersonID: undefined,
};

const Fullmektig = ({
  fullmektig,
  lagreFullmektig,
  redigerbart,
  databaseID,
  slettAktoer,
  slettFullmektigLokalt,
  lagreNyFullmektigOgOppdaterLokalt,
  hentOrg,
}) => {
  const [representererKode, settRepresentererKode] = useState(null);
  const [org, settOrg] = useState(null);

  const vedRolleEndring = async event => {
    try {
      if (org) await lagreFullmektig(event.target.value, org.orgnr);
      settRepresentererKode(event.target.value);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const hentOrgFraApi = async () => {
    if (fullmektig.orgnr) settOrg(await hentOrg(fullmektig.orgnr));
  };

  useEffect(() => {
    if (fullmektig.representererKode) settRepresentererKode(fullmektig.representererKode);
    hentOrgFraApi();
  }, [fullmektig.representererKode, fullmektig.orgnr]);

  const slettFullmektig = async () => {
    try {
      await slettAktoer(databaseID);
      slettFullmektigLokalt(databaseID);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const databaseIDString = databaseID.toString();

  return (
    <Nav.Row className="fullmektig">
      <Nav.Column xs="6">
        {
          org &&
          <Fragment>
            {org.navn}
            <div className="postadresse_tittel">Postadresse</div>
            <PostAdresse postadresse={org.postadresse} />
          </Fragment>
        }
        {
          !org &&
          <Fragment>
            <SokFullmektigOrg lagreNyFullmektigOgOppdaterLokalt={orgnr => lagreNyFullmektigOgOppdaterLokalt(representererKode, orgnr)} />
          </Fragment>
        }
        <Nav.Fieldset disabled={!redigerbart} legend="Hvem er dette fullmektig for?" className="radioknapper">
          <Nav.Radio
            onChange={vedRolleEndring}
            checked={representererKode === MKV.Koder.representerer.ARBEIDSGIVER}
            label="Arbeidsgiver"
            value={MKV.Koder.representerer.ARBEIDSGIVER}
            name={databaseIDString}
          />
          <Nav.Radio
            onChange={vedRolleEndring}
            checked={representererKode === MKV.Koder.representerer.BRUKER}
            label="Arbeidstaker"
            value={MKV.Koder.representerer.BRUKER}
            name={databaseIDString}
          />
          <Nav.Radio
            onChange={vedRolleEndring}
            checked={representererKode === MKV.Koder.representerer.BEGGE}
            label="Både arbeidstaker og arbeidsgiver"
            value={MKV.Koder.representerer.BEGGE}
            name={databaseIDString}
          />
        </Nav.Fieldset>
        <Nav.Knapp onClick={slettFullmektig} type="mini">&times; FJERN FULLMEKTIG</Nav.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        {
          org && <Kontaktopplysninger juridiskOrg={org} />
        }
      </Nav.Column>
    </Nav.Row>
  );
};

Fullmektig.propTypes = {
  fullmektig: PT.object,
  lagreFullmektig: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  databaseID: PT.number,
  slettAktoer: PT.func.isRequired,
  slettFullmektigLokalt: PT.func.isRequired,
  lagreNyFullmektigOgOppdaterLokalt: PT.func.isRequired,
  hentOrg: PT.func.isRequired,
};

Fullmektig.defaultProps = {
  fullmektig: {},
  databaseID: 0,
};

export class FullmektigPanel extends Component {
  state = {
    fullmektige: [],
    disableLeggTilFullmektig: false,
  };

  componentDidMount() {
    this.hentFullmektige();
  }

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

  byttUtTemplateMedLagretFullmektig = (fullmektige, lagretFullmektig) => fullmektige.map(fullmektig => {
    if (fullmektig.databaseID === 0) return { ...lagretFullmektig };
    return { ...fullmektig };
  });

  lagreFullmektig = (representererKode, orgnr) => this.props.lagreAktoer(this.props.oppsummering.saksnummer, {
    aktoerID: null,
    orgnr,
    utenlandskPersonID: null,
    institusjonsID: null,
    rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
    representererKode,
  });

  apneLeggTilFullmektigDialog = () => {
    this.setState(prevState => ({
      fullmektige: [...prevState.fullmektige, { ...aktoerTemplate }],
      disableLeggTilFullmektig: true,
    }));
  };

  hentFullmektige = async () => {
    const { saksnummer } = this.props.oppsummering;
    const { hentAktoer } = this.props;

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
    const panelIkon = Ikoner.Ferdig;

    const { redigerbart, slettAktoer, hentOrg } = this.props;

    const {
      lagreFullmektig,
      slettFullmektigLokalt,
      apneLeggTilFullmektigDialog,
      lagreNyFullmektigOgOppdaterLokalt,
    } = this;

    const { disableLeggTilFullmektig } = this.state;

    return (
      <div>
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Fullmektig" />}
          ariaTittel="Opplysninger om fullmektig">
          <Nav.Container fluid>
            {this.state.fullmektige.map(fullmektig => (
              <Fullmektig
                key={fullmektig.databaseID}
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
            <Nav.Knapp disabled={disableLeggTilFullmektig} onClick={apneLeggTilFullmektigDialog} type="mini">+ LEGG TIL FULLMEKTIG</Nav.Knapp>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

FullmektigPanel.propTypes = {
  hentOrg: PT.func.isRequired,
  hentAktoer: PT.func.isRequired,
  slettAktoer: PT.func.isRequired,
  oppsummering: PT.object.isRequired,
  lagreAktoer: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

const hentOrg = orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const hentAktoer = (saksnr, rolleKode, representererKode) => Api.Fagsaker.aktoer.hent(saksnr, rolleKode, representererKode);
const lagreAktoer = (saksnr, data) => Api.Fagsaker.aktoer.send(saksnr, data);
const slettAktoer = databaseID => Api.Fagsaker.aktoer.slett(databaseID);

const SokersFullmektigWrapper = props => (
  <FullmektigPanel
    {...props}
    lagreAktoer={lagreAktoer}
    hentAktoer={hentAktoer}
    hentOrg={hentOrg}
    slettAktoer={slettAktoer}
  />
);

export default connect(mapStateToProps)(SokersFullmektigWrapper);
