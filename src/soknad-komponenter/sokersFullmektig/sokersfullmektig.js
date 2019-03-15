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
import ForretningsAdresse from '../../komponenter/adresser/forretningsAdresse';

import { fagsakSelectors } from '../../ducks/fagsaker';

import './sokersfullmektig.css';

export class SokersFullmektig extends Component {
  state = {
    fullmektigOrg: null,
    kontaktopplysninger: null,
    visLeggTilKnapp: true,
    representererKode: MKV.Koder.representerer.BRUKER,
  };

  componentDidMount() {
    this.hentLagretForretningsAdresse();
  }

  settRepresentererKode = event => {
    if (event.target.checked) {
      this.setState({ representererKode: MKV.Koder.representerer.BEGGE });
    } else {
      this.setState({ representererKode: MKV.Koder.representerer.BRUKER });
    }
  };

  toggleVisLeggTilKnapp = () => {
    this.setState(gammelState => ({
      visLeggTilKnapp: !gammelState.visLeggTilKnapp,
    }));
  };

  hentLagretForretningsAdresse = async () => {
    const { saksnummer } = this.props.oppsummering;
    const { hentAktoer, hentKontaktopplysninger, hentOrg } = this.props;
    const { representererKode } = this.state;

    try {
      const fullmektige = await hentAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT, representererKode);
      const fullmektig = fullmektige[0];

      const org = await hentOrg(fullmektig.orgnr);
      const kontaktopplysninger = await hentKontaktopplysninger(saksnummer, fullmektig.orgnr);
      this.setState({ kontaktopplysninger, fullmektigOrg: org });
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  render() {
    const {
      kontaktopplysninger,
      visLeggTilKnapp,
      fullmektigOrg,
      representererKode,
    } = this.state;
    const { toggleVisLeggTilKnapp, settRepresentererKode } = this;
    const panelIkon = Ikoner.Ferdig;

    return (
      <div>
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Søkers fullmektig" />}
          ariaTittel="Opplysninger om søkers fullmektig">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="6">
                {
                  fullmektigOrg && kontaktopplysninger.kontaktnavn
                }
                {
                  kontaktopplysninger &&
                  <Fragment>
                    <div className="postadresse_tittel">Postadresse</div>
                    <ForretningsAdresse forretningsadresse={fullmektigOrg.forretningsadresse} />
                  </Fragment>
                }
              </Nav.Column>
              <Nav.Column xs="6">
                <Kontaktopplysninger
                  representererKode={representererKode}
                  juridiskOrg={fullmektigOrg}
                  visLeggTilKnapp={visLeggTilKnapp}
                  toggleVisLeggTilKnapp={toggleVisLeggTilKnapp}
                  renderCheckbox={validerOgLagreKontaktOgAktoer => (
                    <Nav.Fieldset legend="" >
                      <Nav.Checkbox
                        onChange={settRepresentererKode}
                        onBlur={validerOgLagreKontaktOgAktoer}
                        label="Fullmektig for både arbeidstaker og arbeidsgiver"
                      />
                    </Nav.Fieldset>
                  )}
                />
              </Nav.Column>
            </Nav.Row>
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
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});
const mapDispatchToProps = () => ({});

const hentOrg = async orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const hentAktoer = async (saksnr, rolleKode, representererKode) => Api.Aktoer.hent(saksnr, rolleKode, representererKode);
const hentKontaktopplysninger = async (saksnummer, juridiskorgnr) => Api.Kontaktopplysninger.hent(saksnummer, juridiskorgnr);

const SokersFullmektigWrapper = props => <SokersFullmektig {...props} hentAktoer={hentAktoer} hentOrg={hentOrg} hentKontaktopplysninger={hentKontaktopplysninger} />;

export default connect(mapStateToProps, mapDispatchToProps)(SokersFullmektigWrapper);
