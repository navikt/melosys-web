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
    kontaktorgnrTouched: false,
    orgnrFeilmelding: undefined,
    kontaktnavn: '',
  };

  componentDidMount() {
    this.hentOgVisKontaktOpplysninger();
  }

  settKontaktOrgnrTouched = () => this.setState({ kontaktorgnrTouched: true });

  settKontaktOrgnr = orgnr => this.setState({ kontaktorgnr: orgnr, orgnrFeilmelding: undefined });

  settKontaktNavn = navn => this.setState({ kontaktnavn: navn });

  hentOgVisKontaktOpplysninger = async () => {
    const { hentKontaktopplysninger, juridiskOrg, oppsummering } = this.props;
    const kontaktopplysninger = await hentKontaktopplysninger(oppsummering.saksnummer, juridiskOrg.orgnr);
    this.setState({ kontaktorgnr: kontaktopplysninger.kontaktorgnr, kontaktnavn: kontaktopplysninger.kontaktnavn });
  };

  visFeilmelding = feilmelding => this.setState({ orgnrFeilmelding: { feilmelding } });

  vedKontaktnavnEndring = event => this.settKontaktNavn(event.target.value);

  vedKontaktorgnrEndring = event => this.settKontaktOrgnr(event.target.value);

  fjernResultat = () => this.setState({ sokeResultat: null });

  fjernOppforing = () => {
    this.props.toggleVisLeggTilKnapp();
    this.fjernResultat();
  };

  validerOgLagreKontaktOgAktoer = async () => {
    const {
      hentOrg,
      lagreKontaktopplysninger,
      oppsummering: { saksnummer },
      juridiskOrg,
    } = this.props;
    const { kontaktorgnr, kontaktnavn, kontaktorgnrTouched } = this.state;
    const { visFeilmelding, fjernResultat } = this;

    fjernResultat();

    if (!kontaktnavn || !kontaktorgnrTouched) return;

    if (!kontaktorgnr || kontaktorgnr.length !== 9) {
      visFeilmelding('Org.nr. må være 9 siffer');
      return;
    }

    try {
      const resultat = await hentOrg(kontaktorgnr);

      if (resultat.navn) {
        this.setState({ sokeResultat: resultat });
        lagreKontaktopplysninger(saksnummer, juridiskOrg.orgnr, { kontaktnavn, kontaktorgnr });
      } else {
        visFeilmelding('Kunne ikke finne organisasjon');
      }
    } catch (e) {
      Utils.logger.error(e);
      this.setState({ sokeResultat: null });
      visFeilmelding('Kunne ikke finne organisasjon');
    }
  };

  render() {
    const { sokeResultat, orgnrFeilmelding } = this.state;

    const {
      validerOgLagreKontaktOgAktoer,
      vedKontaktorgnrEndring,
      vedKontaktnavnEndring,
      settKontaktOrgnrTouched,
      fjernOppforing,
    } = this;

    const {
      redigerbart,
      visLeggTilKnapp,
      toggleVisLeggTilKnapp,
    } = this.props;

    const { kontaktorgnr, kontaktnavn } = this.state;

    return (
      <Fragment>
        {
          visLeggTilKnapp &&
          <Nav.Knapp mini onClick={toggleVisLeggTilKnapp}>+ LEGG TIL KONTAKTOPPLYSNINGER</Nav.Knapp>
        }
        {
          !visLeggTilKnapp &&
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
                onClick={settKontaktOrgnrTouched}
                feil={orgnrFeilmelding}
                onChange={vedKontaktorgnrEndring}
                onBlur={validerOgLagreKontaktOgAktoer}
                value={kontaktorgnr}
                label="Organisasjonsnummer"
              />
            </Fragment>
        }
        {
          !visLeggTilKnapp && sokeResultat &&
            <Fragment>
              {sokeResultat.navn}
              <ForretningsAdresse forretningsadresse={sokeResultat.forretningsadresse} />
            </Fragment>
        }
        {
          !visLeggTilKnapp &&
          <Nav.Knapp mini onClick={fjernOppforing}>&times; FJERN OPPFØRING</Nav.Knapp>
        }
      </Fragment>
    );
  }
}

KontaktOpplysninger.propTypes = {
  lagreKontaktopplysninger: PT.func.isRequired,
  hentOrg: PT.func.isRequired,
  redigerbart: PT.bool,
  visLeggTilKnapp: PT.bool.isRequired,
  toggleVisLeggTilKnapp: PT.func.isRequired,
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
