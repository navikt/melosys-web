import React, { Component, Fragment, useState } from 'react';
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

const Fullmektig = ({ fullmektig, lagreFullmektig }) => {
  const [visLeggTilKnapp, settVisLeggTilKnapp] = useState(true);
  const toggleVisLeggTilKnapp = () => settVisLeggTilKnapp(!visLeggTilKnapp);

  const [representererKode, settRepresentererKode] = useState(MKV.Koder.representerer.BRUKER);

  return (
    <Nav.Row>
      <Nav.Column xs="6">
        {
          fullmektig.org && fullmektig.org.navn
        }
        {
          fullmektig.kontaktopplysninger &&
          <Fragment>
            <div className="postadresse_tittel">Postadresse</div>
            <PostAdresse postadresse={fullmektig.org.postadresse} />
          </Fragment>
        }
        <Nav.Fieldset onChange={e => settRepresentererKode(e.target.value)} onBlur={() => lagreFullmektig(representererKode)} legend="Hvem er dette fullmektig for?" >
          <Nav.Radio label="Arbeidsgiver" name="representerer" value={MKV.Koder.representerer.ARBEIDSGIVER} />
          <Nav.Radio label="Arbeidstaker" name="representerer" value={MKV.Koder.representerer.BRUKER} />
          <Nav.Radio label="Både arbeidstaker og arbeidsgiver" name="representerer" value={MKV.Koder.representerer.BEGGE} />
        </Nav.Fieldset>
        <Nav.Knapp disabled type="mini">&times; FJERN FULLMEKTIG</Nav.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        <Kontaktopplysninger
          representererKode={fullmektig.representererKode}
          juridiskOrg={fullmektig.org}
          visLeggTilKnapp={visLeggTilKnapp}
          toggleVisLeggTilKnapp={toggleVisLeggTilKnapp}
        />
      </Nav.Column>
    </Nav.Row>
  );
};

Fullmektig.propTypes = {
  fullmektig: PT.object,
  lagreFullmektig: PT.func.isRequired,
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

  hentFullmektige = async () => {
    const { saksnummer } = this.props.oppsummering;
    const { hentAktoer, hentKontaktopplysninger, hentOrg } = this.props;

    try {
      /* eslint-disable no-param-reassign */
      const fullmektige = await hentAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT);
      fullmektige.forEach(async fullmektig => {
        fullmektig.org = await hentOrg(fullmektig.orgnr);
        fullmektig.kontaktopplysninger = await hentKontaktopplysninger(saksnummer, fullmektig.orgnr);
      });
      /* eslint-enable no-param-reassign */
      this.setState({ fullmektige });
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  render() {
    const panelIkon = Ikoner.Ferdig;
    const { lagreAktoer, oppsummering: { saksnummer } } = this.props;

    return (
      <div>
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Fullmektig" />}
          ariaTittel="Opplysninger om fullmektig">
          <Nav.Container fluid>
            {this.state.fullmektige.map(fullmektig => (
              <Fullmektig key={fullmektig.aktoerID} fullmektig={fullmektig} lagreFullmektig={representererKode => lagreAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT, representererKode)} />
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
  hentKontaktopplysninger: PT.func.isRequired,
  lagreAktoer: PT.func.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});
const mapDispatchToProps = () => ({});

const hentOrg = async orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const hentAktoer = async (saksnr, rolleKode, representererKode) => Api.Fagsaker.aktoer.hent(saksnr, rolleKode, representererKode);
const hentKontaktopplysninger = async (saksnummer, juridiskorgnr) => Api.Fagsaker.kontaktopplysninger.hent(saksnummer, juridiskorgnr);
const lagreAktoer = async (saksnr, rolleKode, representererKode) => Api.Fagsaker.aktoer.send(saksnr, rolleKode, representererKode);

const SokersFullmektigWrapper = props => <SokersFullmektig {...props} lagreAktoer={lagreAktoer} hentAktoer={hentAktoer} hentOrg={hentOrg} hentKontaktopplysninger={hentKontaktopplysninger} />;

export default connect(mapStateToProps, mapDispatchToProps)(SokersFullmektigWrapper);
