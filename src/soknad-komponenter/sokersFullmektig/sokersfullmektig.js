import React, { Component, Fragment } from 'react';
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

import './sokersfullmektig.css';

const Fullmektig = ({ fullmektig, lagreFullmektig, redigerbart }) => {
  const vedRolleEndring = event => lagreFullmektig(event.target.value, fullmektig.org.orgnr);

  return (
    <Nav.Row>
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
        <Nav.Fieldset disabled={!redigerbart} onChange={vedRolleEndring} legend="Hvem er dette fullmektig for?" >
          <Nav.Radio label="Arbeidsgiver" name="representerer" value={MKV.Koder.representerer.ARBEIDSGIVER} />
          <Nav.Radio label="Arbeidstaker" name="representerer" value={MKV.Koder.representerer.BRUKER} />
          <Nav.Radio label="Både arbeidstaker og arbeidsgiver" name="representerer" value={MKV.Koder.representerer.BEGGE} />
        </Nav.Fieldset>
        <Nav.Knapp disabled type="mini">&times; FJERN FULLMEKTIG</Nav.Knapp>
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
};

Fullmektig.defaultProps = {
  fullmektig: {},
};

export class SokersFullmektig extends Component {
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

  render() {
    const panelIkon = Ikoner.Ferdig;
    const { redigerbart } = this.props;

    return (
      <div>
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Fullmektig" />}
          ariaTittel="Opplysninger om fullmektig">
          <Nav.Container fluid>
            {this.state.fullmektige.map(fullmektig => (
              <Fullmektig
                key={fullmektig.aktoerID}
                redigerbart={redigerbart}
                fullmektig={fullmektig}
                lagreFullmektig={this.lagreFullmektig}
              />
            ))}
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

SokersFullmektig.propTypes = {
  hentOrg: PT.func.isRequired,
  hentAktoer: PT.func.isRequired,
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

const SokersFullmektigWrapper = props => (
  <SokersFullmektig
    {...props}
    lagreAktoer={lagreAktoer}
    hentAktoer={hentAktoer}
    hentOrg={hentOrg}
  />
);

export default connect(mapStateToProps)(SokersFullmektigWrapper);
