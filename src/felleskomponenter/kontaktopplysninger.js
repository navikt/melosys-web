import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as Mui from './ui';
import * as Api from '../services/api';
import * as Utils from '../utils';

import OrganisasjonsAdresse from './adresser/organisasjonsAdresse';
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
    if (kontaktopplysninger) {
      this.kalkulerSynlighetVedMount(kontaktopplysninger);
      if (kontaktopplysninger.kontaktorgnr) this.finnOgVisOrganisasjon(kontaktopplysninger.kontaktorgnr);
    }
  }

  settKontaktOrgnr = orgnr => this.setState({ kontaktorgnr: orgnr, orgnrFeilmelding: undefined });

  settKontaktNavn = navn => this.setState({ kontaktnavn: navn });

  toggleSkjulInput = () => this.setState({ skjulInput: !this.state.skjulInput });

  kalkulerSynlighetVedMount = ({ kontaktorgnr, kontaktnavn }) => this.setState({ skjulInput: !(kontaktorgnr || kontaktnavn) });

  hentOgVisKontaktOpplysninger = async () => {
    const { juridiskOrg, saksnummer } = this.props;
    const kontaktopplysninger = await this.finnKontaktopplysninger(saksnummer, juridiskOrg.orgnr);

    if (kontaktopplysninger) {
      this.setState({ kontaktorgnr: kontaktopplysninger.kontaktorgnr, kontaktnavn: kontaktopplysninger.kontaktnavn });
    }

    return kontaktopplysninger;
  };

  finnKontaktopplysninger = async (saksnummer, orgnr) => {
    if (!orgnr) return null;

    try {
      return await Api.Fagsaker.kontaktopplysninger.hent(saksnummer, orgnr);
    } catch (e) {
      if (e.response.status !== 404) {
        Utils.logger.error(e);
      }

      return null;
    }
  }

  visFeilmelding = feilmelding => this.setState({ orgnrFeilmelding: { feilmelding } });

  vedKontaktnavnEndring = event => this.settKontaktNavn(event.target.value);

  vedKontaktorgnrEndring = event => {
    this.settKontaktOrgnr(event.target.value);
    this.fjernResultat();
  };

  fjernResultat = () => this.setState({ sokeResultat: null });

  fjernOppforing = async () => {
    const { saksnummer, juridiskOrg: { orgnr } } = this.props;
    try {
      await Api.Fagsaker.kontaktopplysninger.slett(saksnummer, orgnr);
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
      saksnummer,
      juridiskOrg,
    } = this.props;
    const { kontaktorgnr, kontaktnavn } = this.state;
    const { validerOrgnr } = this;

    if (validerOrgnr()) {
      await Api.Fagsaker.kontaktopplysninger.send(saksnummer, juridiskOrg.orgnr, {
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
      return await Api.Organisasjoner.hentOrganisasjon(kontaktorgnr);
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
          <Mui.Knapp disabled={!redigerbart} mini onClick={toggleSkjulInput}>+ Legg til kontaktopplysninger</Mui.Knapp>
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
            {
              !sokeResultat &&
              <Nav.Row>
                <Nav.Column xs="6">
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
                <Nav.Column xs="6">
                  <Mui.Knapp onClick={vedKlikkSok} className="sokKnapp">Søk</Mui.Knapp>
                </Nav.Column>
              </Nav.Row>
            }
          </Nav.Fieldset>
        }
        {
          !skjulInput && sokeResultat && <OrganisasjonsAdresse className="adresse" organisasjon={sokeResultat} />
        }
        {
          !skjulInput &&
          <Mui.Knapp className="fjernOppforingKnapp" disabled={!redigerbart} mini onClick={fjernOppforing}>&times; Fjern oppføring</Mui.Knapp>
        }
      </Fragment>
    );
  }
}

KontaktOpplysninger.propTypes = {
  saksnummer: PT.string.isRequired,
  redigerbart: PT.bool,
  juridiskOrg: PT.object.isRequired,
};

KontaktOpplysninger.defaultProps = {
  redigerbart: true,
};

const mapStateToProps = state => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

export default connect(mapStateToProps)(KontaktOpplysninger);
