import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import * as Utils from '../utils';

import ForretningsAdresse from '../komponenter/adresser/forretningsAdresse';
import { fagsakSelectors } from '../ducks/fagsaker';

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

  vedKontaktorgnrEndring = event => this.settKontaktOrgnr(event.target.value);

  fjernResultat = () => this.setState({ sokeResultat: null });

  fjernOppforing = () => {
    this.toggleSkjulInput();
    this.fjernResultat();
  };

  validerOgLagreKontaktOgAktoer = async () => {
    const {
      lagreKontaktopplysninger,
      oppsummering: { saksnummer },
      juridiskOrg,
    } = this.props;
    const { kontaktorgnr, kontaktnavn } = this.state;
    const { visFeilmelding, fjernResultat, finnOrganisasjon } = this;

    fjernResultat();

    if (kontaktorgnr && kontaktorgnr.length !== 9) {
      visFeilmelding('Org.nr. må være 9 siffer');
      return;
    }

    const org = await finnOrganisasjon(kontaktorgnr);
    if (!org && kontaktorgnr) this.visFeilmelding('Kunne ikke finne organisasjon, organisasjonsnummer blir ikke lagret');
    this.setState({ sokeResultat: org });

    lagreKontaktopplysninger(saksnummer, juridiskOrg.orgnr, {
      kontaktnavn: kontaktnavn || null,
      kontaktorgnr: org ? kontaktorgnr : null,
    });
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
      validerOgLagreKontaktOgAktoer,
      vedKontaktorgnrEndring,
      vedKontaktnavnEndring,
      fjernOppforing,
      toggleSkjulInput,
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
            <Fragment>
              <Nav.Input
                disabled={!redigerbart}
                onChange={vedKontaktnavnEndring}
                onBlur={validerOgLagreKontaktOgAktoer}
                value={kontaktnavn}
                label="Kontaktperson"
              />
              <Nav.Input
                disabled={!redigerbart}
                feil={orgnrFeilmelding}
                onChange={vedKontaktorgnrEndring}
                onBlur={validerOgLagreKontaktOgAktoer}
                value={kontaktorgnr}
                label="Organisasjonsnummer"
              />
            </Fragment>
        }
        {
          !skjulInput && sokeResultat &&
            <Fragment>
              {sokeResultat.navn}
              <ForretningsAdresse forretningsadresse={sokeResultat.forretningsadresse} />
            </Fragment>
        }
        {
          !skjulInput &&
          <Nav.Knapp disabled={!redigerbart} mini onClick={fjernOppforing}>&times; FJERN OPPFØRING</Nav.Knapp>
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
};

KontaktOpplysninger.defaultProps = {
  redigerbart: true,
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const hentOrg = async orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const lagreKontaktopplysninger = async (saksnr, juridiskorgnr, data) => Api.Fagsaker.kontaktopplysninger.send(saksnr, juridiskorgnr, data);
const hentKontaktopplysninger = async (saksnr, juridiskorgnr) => Api.Fagsaker.kontaktopplysninger.hent(saksnr, juridiskorgnr);

const KontaktOpplysningerWrapper = props => (
  <KontaktOpplysninger
    {...props}
    hentOrg={hentOrg}
    hentKontaktopplysninger={hentKontaktopplysninger}
    lagreKontaktopplysninger={lagreKontaktopplysninger}
  />
);

export default connect(mapStateToProps)(KontaktOpplysningerWrapper);
