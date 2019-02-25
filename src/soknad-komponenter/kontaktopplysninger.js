import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';

import ForretningsAdresse from '../komponenter/adresser/forretningsAdresse';

export class KontaktOpplysninger extends Component {
  state = {
    visLeggTilKnapp: true,
    sokeResultat: null,
    sokeString: null,
    orgnrFeilmelding: undefined,
  };

  vedFokusFlyttetHandler = async () => {
    const { sok, lagreFelter } = this.props;
    const { sokeString } = this.state;
    const { visFeilmelding } = this;

    lagreFelter();

    if (sokeString.length !== 9) {
      visFeilmelding('Org.nr. må være 9 siffer');
      return;
    }

    try {
      const resultat = await sok(sokeString);

      if (resultat.navn) this.setState({ sokeResultat: resultat });
      else {
        visFeilmelding('Kunne ikke finne organisasjon');
      }
    }
    catch (error) {
      this.setState({ sokeResultat: null });
      visFeilmelding('Kunne ikke finne organisasjon');
    }
  };

  visFeilmelding = feilmelding => this.setState({ orgnrFeilmelding: { feilmelding } });

  toggleVisLeggTilKnapp = () => {
    this.setState(gammelState => ({
      visLeggTilKnapp: !gammelState.visLeggTilKnapp,
    }));
  };

  vedOrgnrEndring = event => this.setState({ sokeString: event.target.value, orgnrFeilmelding: undefined });

  render() {
    const { visLeggTilKnapp, sokeResultat, orgnrFeilmelding } = this.state;
    const { toggleVisLeggTilKnapp, vedFokusFlyttetHandler, vedOrgnrEndring } = this;


    return (
      <Fragment>
        {
          visLeggTilKnapp &&
          <Nav.Knapp onClick={toggleVisLeggTilKnapp}>+ Legg til kontaktopplysninger</Nav.Knapp>
        }
        {
          !visLeggTilKnapp &&
            <Fragment>
              <Nav.Input label="Kontaktperson" />
              <Nav.Input feil={orgnrFeilmelding} onChange={vedOrgnrEndring} onBlur={vedFokusFlyttetHandler} label="Organisasjonsnummer" />
            </Fragment>
        }
        {
          sokeResultat &&
            <div>
              {sokeResultat.navn}
              <ForretningsAdresse forretningsadresse={sokeResultat.forretningsadresse} />
            </div>
        }
      </Fragment>
    );
  }
}

KontaktOpplysninger.propTypes = {
  lagreFelter: PT.func.isRequired,
  sok: PT.func.isRequired,
  kontaktPerson: PT.string.isRequired,
  orgnr: PT.string.isRequired,
};

const mapDispatchToProps = dispatch => ({
  lagreFelter: dispatch => ({}),
});

const sok = async orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);

const KontaktOpplysningerMedSok = props => <KontaktOpplysninger {...props} sok={sok} />;

export default connect(null, mapDispatchToProps)(KontaktOpplysningerMedSok);
