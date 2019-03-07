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

  visFeilmelding = feilmelding => this.setState({ orgnrFeilmelding: { feilmelding } });

  vedKontaktorgnrEndring = event => this.setState({ kontaktorgnr: event.target.value, orgnrFeilmelding: undefined });

  vedKontaktnavnEndring = event => this.setState({ kontaktnavn: event.target.value });

  fjernResultat = () => this.setState({ sokeResultat: null });

  validerOgLagreKontaktOgAktoer = async () => {
    const {
      sok,
      lagreKontaktopplysninger,
      lagreAktoer,
      hentAktoer,
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
      const resultat = await sok(kontaktorgnr);

      if (resultat.navn) {
        this.setState({ sokeResultat: resultat });
        lagreKontaktopplysninger(saksnummer, juridiskOrg.orgnr, { kontaktnavn, kontaktorgnr });

        const aktoerer = await hentAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT);
        const { aktoerID, utenlandskPersonID, institusjonsID } = aktoerer[0];

        lagreAktoer(saksnummer, {
          aktoerID,
          orgnr: kontaktorgnr,
          utenlandskPersonID,
          institusjonsID,
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
      <div>
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
          sokeResultat &&
            <div>
              {sokeResultat.navn}
              <ForretningsAdresse forretningsadresse={sokeResultat.forretningsadresse} />
            </div>
        }
        {
          !visLeggTilKnapp && renderCheckbox && renderCheckbox(validerOgLagreKontaktOgAktoer)
        }
      </div>
    );
  }
}

KontaktOpplysninger.propTypes = {
  lagreKontaktopplysninger: PT.func.isRequired,
  sok: PT.func.isRequired,
  redigerbart: PT.bool,
  visLeggTilKnapp: PT.bool.isRequired,
  toggleVisLeggTilKnapp: PT.func.isRequired,
  oppsummering: PT.object.isRequired,
  representererKode: PT.string.isRequired,
  lagreAktoer: PT.func.isRequired,
  hentAktoer: PT.func.isRequired,
  juridiskOrg: PT.object.isRequired,
  renderCheckbox: PT.func,
};

KontaktOpplysninger.defaultProps = {
  redigerbart: true,
  renderCheckbox: () => null,
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const sok = async orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const lagreKontaktopplysninger = async (saksnr, juridiskorgnr, data) => Api.Kontaktopplysninger.send(saksnr, juridiskorgnr, data);
const lagreAktoer = async (saksnr, data) => Api.Aktoer.send(saksnr, data);
const hentAktoer = async (saksnr, rolleKode, representererKode) => Api.Aktoer.hent(saksnr, rolleKode, representererKode);

const KontaktOpplysningerWrapper = props => <KontaktOpplysninger {...props} sok={sok} lagreKontaktopplysninger={lagreKontaktopplysninger} lagreAktoer={lagreAktoer} hentAktoer={hentAktoer} />;

export default connect(mapStateToProps)(KontaktOpplysningerWrapper);
