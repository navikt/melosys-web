import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

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

  settKontaktOrgnrTouched = () => this.setState({ kontaktorgnrTouched: true });

  settKontaktOrgnr = orgnr => this.setState({ kontaktorgnr: orgnr, orgnrFeilmelding: undefined });

  settKontaktNavn = navn => this.setState({ kontaktnavn: navn });

  visFeilmelding = feilmelding => this.setState({ orgnrFeilmelding: { feilmelding } });

  vedKontaktnavnEndring = event => this.settKontaktNavn(event.target.value);

  vedKontaktorgnrEndring = event => this.settKontaktOrgnr(event.target.value);

  fjernResultat = () => this.setState({ sokeResultat: null });

  validerOgLagreKontaktOgAktoer = async () => {
    const {
      hentOrg,
      lagreKontaktopplysninger,
      lagreAktoer,
      oppsummering: { saksnummer },
      representererKode,
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

        lagreAktoer(saksnummer, {
          aktoerID: null,
          orgnr: kontaktorgnr,
          utenlandskPersonID: null,
          institusjonsID: null,
          rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
          representererKode,
        });
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
    } = this;

    const {
      redigerbart,
      visLeggTilKnapp,
      toggleVisLeggTilKnapp,
      renderCheckbox,
    } = this.props;

    return (
      <Fragment>
        {
          visLeggTilKnapp &&
          <Nav.Knapp mini onClick={toggleVisLeggTilKnapp}>+ Legg til kontaktopplysninger</Nav.Knapp>
        }
        {
          !visLeggTilKnapp &&
            <Fragment>
              <Nav.Input
                disabled={!redigerbart}
                onChange={vedKontaktnavnEndring}
                onBlur={validerOgLagreKontaktOgAktoer}
                label="Kontaktperson"
              />
              <Nav.Input
                disabled={!redigerbart}
                onClick={settKontaktOrgnrTouched}
                feil={orgnrFeilmelding}
                onChange={vedKontaktorgnrEndring}
                onBlur={validerOgLagreKontaktOgAktoer}
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
          !visLeggTilKnapp && renderCheckbox && renderCheckbox(validerOgLagreKontaktOgAktoer)
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
  representererKode: PT.string.isRequired,
  lagreAktoer: PT.func.isRequired,
  juridiskOrg: PT.object.isRequired,
  renderCheckbox: PT.func,
};

KontaktOpplysninger.defaultProps = {
  redigerbart: true,
  renderCheckbox: null,
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const hentOrg = async orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const lagreKontaktopplysninger = async (saksnr, juridiskorgnr, data) => Api.Kontaktopplysninger.send(saksnr, juridiskorgnr, data);
const lagreAktoer = async (saksnr, data) => Api.Aktoer.send(saksnr, data);

const KontaktOpplysningerWrapper = props => <KontaktOpplysninger {...props} hentOrg={hentOrg} lagreKontaktopplysninger={lagreKontaktopplysninger} lagreAktoer={lagreAktoer} />;

export default connect(mapStateToProps)(KontaktOpplysningerWrapper);
