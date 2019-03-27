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

import { fagsakSelectors } from '../../ducks/fagsaker';

import './fullmektig.css';

const Fullmektig = ({
  fullmektig,
  lagreFullmektig,
  redigerbart,
  databaseID,
  slettAktoer,
  slettFullmektigFraListe,
}) => {
  const [representererKode, settRepresentererKode] = useState(null);

  const vedRolleEndring = event => {
    lagreFullmektig(event.target.value, fullmektig.org.orgnr);
    settRepresentererKode(event.target.value);
  };

  useEffect(() => {
    settRepresentererKode(fullmektig.representererKode);
  }, []);

  const databaseIDString = databaseID.toString();

  const slettFullmektig = async () => {
    try {
      await slettAktoer(databaseID);
    } catch (e) {
      Utils.logger.error(e);
    }
    slettFullmektigFraListe(databaseID);
  };

  return (
    <Nav.Row className="fullmektig">
      <Nav.Column xs="6">
        {
          fullmektig.org && fullmektig.org.navn
        }
        {
          fullmektig.org &&
          <Fragment>
            <div className="postadresse_tittel">Postadresse</div>
            <PostAdresse postadresse={fullmektig.org.postadresse} />
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
        <Kontaktopplysninger juridiskOrg={fullmektig.org} />
      </Nav.Column>
    </Nav.Row>
  );
};

Fullmektig.propTypes = {
  fullmektig: PT.object,
  lagreFullmektig: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  databaseID: PT.number.isRequired,
  slettAktoer: PT.func.isRequired,
  slettFullmektigFraListe: PT.func.isRequired,
};

Fullmektig.defaultProps = {
  fullmektig: {},
};

export class FullmektigPanel extends Component {
  state = {
    fullmektige: [],
  };

  componentDidMount() {
    this.hentFullmektige();
  }

  lagreFullmektig = (representererKode, orgnr) => {
    const { lagreAktoer, oppsummering: { saksnummer } } = this.props;
    lagreAktoer(saksnummer, {
      aktoerID: null,
      orgnr,
      utenlandskPersonID: null,
      institusjonsID: null,
      rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
      representererKode,
    });
  };

  hentFullmektige = async () => {
    const { saksnummer } = this.props.oppsummering;
    const { hentAktoer, hentOrg } = this.props;

    try {
      /* eslint-disable no-param-reassign */
      const fullmektige = await hentAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT);
      fullmektige.forEach(async fullmektig => {
        fullmektig.org = await hentOrg(fullmektig.orgnr);
      });
      /* eslint-enable no-param-reassign */
      this.setState({ fullmektige });
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  slettFullmektigFraListe = databaseID => {
    const nyFullmektige = this.state.fullmektige.filter(fullmektig => fullmektig.databaseID !== databaseID);
    this.setState({
      fullmektige: nyFullmektige,
    });
  };

  render() {
    const panelIkon = Ikoner.Ferdig;
    const { redigerbart, slettAktoer } = this.props;
    const { slettFullmektigFraListe } = this;

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
                lagreFullmektig={this.lagreFullmektig}
                slettAktoer={slettAktoer}
                slettFullmektigFraListe={slettFullmektigFraListe}
              />
            ))}
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
