import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import * as Utils from '../utils';

import PostEllerForretningsAdresse from '../komponenter/adresser/postEllerForretningsAdresse';
import { fagsakSelectors } from '../ducks/fagsaker';
import { erOrgnrGyldig } from './skjema/validering/generisk/organisasjon';

import './kontaktopplysninger.css';

export class KontaktOpplysninger extends Component {
  state = {
    sokeResultat: null,
    kontaktorgnr: null,
    kontaktnavn: '',
    orgnrFeilmelding: undefined,
    skjulInput: true,
  };

  async componentDidMount() {
    const kontaktopplysninger = await this.hentOgVisKontaktOpplysninger();
    this.kalkulerSynlighetVedMount(kontaktopplysninger);
    this.finnOgVisOrganisasjon(kontaktopplysninger.kontaktorgnr);
  }

  settKontaktOrgnr = orgnr => this.setState({ kontaktorgnr: orgnr, orgnrFeilmelding: undefined });

  settKontaktNavn = navn => this.setState({ kontaktnavn: navn });

  toggleSkjulInput = () => this.setState({ skjulInput: !this.state.skjulInput });

  kalkulerSynlighetVedMount = ({ kontaktorgnr, kontaktnavn }) => this.setState({ skjulInput: !(kontaktorgnr || kontaktnavn) });

  hentOgVisKontaktOpplysninger = async () => {
    const { hentKontaktopplysninger, juridiskOrg, oppsummering } = this.props;
    const kontaktopplysninger = await hentKontaktopplysninger(oppsummering.saksnummer, juridiskOrg.orgnr);

    this.setState({ kontaktorgnr: kontaktopplysninger.kontaktorgnr, kontaktnavn: kontaktopplysninger.kontaktnavn });

    return kontaktopplysninger;
  };

  visFeilmelding = feilmelding => this.setState({ orgnrFeilmelding: { feilmelding } });

  vedKontaktnavnEndring = event => this.settKontaktNavn(event.target.value);

  vedKontaktorgnrEndring = event => {
    this.settKontaktOrgnr(event.target.value);
    this.fjernResultat();
  };

  fjernResultat = () => this.setState({ sokeResultat: null });

  fjernOppforing = async () => {
    const { oppsummering: { saksnummer }, juridiskOrg: { orgnr } } = this.props;
    try {
      await this.props.slettKontaktopplysninger(saksnummer, orgnr);
      this.toggleSkjulInput();
      this.fjernResultat();
      this.settKontaktNavn('');
      this.settKontaktOrgnr('');
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  validerOrgnr = () => {
    const { kontaktorgnr } = this.state;
    const { visFeilmelding } = this;

    if (kontaktorgnr && !erOrgnrGyldig(kontaktorgnr)) {
      visFeilmelding('Ugyldig orgnr');
      return false;
    }
    return true;
  };

  validerOgLagreKontakt = async () => {
    const {
      lagreKontaktopplysninger,
      oppsummering: { saksnummer },
      juridiskOrg,
    } = this.props;
    const { kontaktorgnr, kontaktnavn } = this.state;
    const { validerOrgnr } = this;

    if (validerOrgnr()) {
      lagreKontaktopplysninger(saksnummer, juridiskOrg.orgnr, {
        kontaktnavn: kontaktnavn || null,
        kontaktorgnr: kontaktorgnr || null,
      });
    }
  };

  vedKlikkSok = () => {
    if (this.validerOrgnr()) this.finnOgVisOrganisasjon();
  };

  finnOgVisOrganisasjon = async () => {
    const org = await this.finnOrganisasjon(this.state.kontaktorgnr);

    if (org) this.setState({ sokeResultat: org });
    else this.visFeilmelding('Kunne ikke finne organisasjon');

    return org;
  };

  finnOrganisasjon = async kontaktorgnr => {
    if (!kontaktorgnr) return null;

    try {
      const org = await this.props.hentOrg(kontaktorgnr);
      return org === null || Utils._isEmpty(org) ? null : org;
    } catch (e) {
      Utils.logger.error(e);
      return null;
    }
  };

  render() {
    const { sokeResultat, orgnrFeilmelding } = this.state;

    const {
      validerOgLagreKontakt,
      vedKontaktorgnrEndring,
      vedKontaktnavnEndring,
      fjernOppforing,
      toggleSkjulInput,
      vedKlikkSok,
    } = this;

    const { redigerbart } = this.props;

    const { kontaktorgnr, kontaktnavn, skjulInput } = this.state;

    return (
      <Fragment>
        {
          skjulInput &&
          <Nav.Knapp disabled={!redigerbart} mini onClick={toggleSkjulInput}>+ LEGG TIL KONTAKTOPPLYSNINGER</Nav.Knapp>
        }
        {
          !skjulInput &&
          <Nav.Fieldset legend="Kontaktopplysninger">
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.Input
                  disabled={!redigerbart}
                  onChange={vedKontaktnavnEndring}
                  onBlur={validerOgLagreKontakt}
                  value={kontaktnavn}
                  label="Kontaktperson"
                  placeholder="Skriv inn..."
                />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="8">
                <Nav.Input
                  disabled={!redigerbart}
                  feil={orgnrFeilmelding}
                  onChange={vedKontaktorgnrEndring}
                  onBlur={validerOgLagreKontakt}
                  value={kontaktorgnr}
                  label="Organisasjonsnummer"
                  placeholder="Skriv inn..."
                />
              </Nav.Column>
              <Nav.Column xs="4">
                <Nav.Knapp onClick={vedKlikkSok} className="sokKnapp">SØK</Nav.Knapp>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
        }
        {
          !skjulInput && sokeResultat && <PostEllerForretningsAdresse className="adresse" organisasjon={sokeResultat} />
        }
        {
          !skjulInput &&
          <Nav.Knapp className="fjernOppforingKnapp" disabled={!redigerbart} mini onClick={fjernOppforing}>&times; FJERN OPPFØRING</Nav.Knapp>
        }
      </Fragment>
    );
  }
}

KontaktOpplysninger.propTypes = {
  lagreKontaktopplysninger: PT.func.isRequired,
  hentOrg: PT.func.isRequired,
  redigerbart: PT.bool,
  oppsummering: PT.object.isRequired,
  juridiskOrg: PT.object.isRequired,
  hentKontaktopplysninger: PT.func.isRequired,
  slettKontaktopplysninger: PT.func.isRequired,
};

KontaktOpplysninger.defaultProps = {
  redigerbart: true,
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const hentOrg = orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const lagreKontaktopplysninger = (saksnr, juridiskorgnr, data) => Api.Fagsaker.kontaktopplysninger.send(saksnr, juridiskorgnr, data);
const hentKontaktopplysninger = (saksnr, juridiskorgnr) => Api.Fagsaker.kontaktopplysninger.hent(saksnr, juridiskorgnr);
const slettKontaktOpplysninger = (saksnr, juridiskorgnr) => Api.Fagsaker.kontaktopplysninger.slett(saksnr, juridiskorgnr);

const KontaktOpplysningerWrapper = props => (
  <KontaktOpplysninger
    {...props}
    hentOrg={hentOrg}
    hentKontaktopplysninger={hentKontaktopplysninger}
    lagreKontaktopplysninger={lagreKontaktopplysninger}
    slettKontaktopplysninger={slettKontaktOpplysninger}
  />
);

export default connect(mapStateToProps)(KontaktOpplysningerWrapper);
