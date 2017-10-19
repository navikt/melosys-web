import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as Nav from '../utils/navFrontend';
import { PersonSelector } from '../ducks/saksopplysninger';
import * as MPT from '../proptypes';

import './personopplysninger.css';

class Personopplysninger extends Component {
  static propTypes = {
    person: MPT.PersonPropType,
  };

  static defaultProps = {
    person: {
      fnr: '',
      sivilstand: '',
      statsborgerskap: '',
      kjoenn: '',
      fornavn: '',
      etternavn: '',
      sammensattNavn: '',
      foedselsdato: '',
      bostedsadresse: { gateadresse: { gatenavn: '', husnummer: 0, husbokstav: '' }, postnr: '', poststed: '', land: '' },
    },
  };

  render() {
    const { fnr,
      sivilstand,
      statsborgerskap,
      kjoenn,
      fornavn,
      etternavn,
      sammensattNavn,
      foedselsdato,
      bostedsadresse } = this.props.person;

    // Påkrevde felter fra API
    const { poststed, postnr, land, gateadresse: { gatenavn, husnummer, husbokstav = '' } } = bostedsadresse;

    return (
      <div className="personopplysninger panelSeksjon">
        <Nav.EkspanderbartPanel tittel={sammensattNavn} apen>
          <Nav.Container fluid>
            {/* START PERSONINFO */}
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="6">
                <dl className="person__detaljer">
                  <dt>Fornavn:</dt><dd>{fornavn}</dd>
                  <dt>Etternavn:</dt><dd>{etternavn}</dd>
                  <dt>Fødselsnummer:</dt><dd>{fnr}</dd>
                  <dt>Kjønn:</dt><dd>{kjoenn}</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="6">
                <dl className="person__detaljer">
                  <dt>Fødselsdato:</dt><dd>{foedselsdato}</dd>
                  <dt>Statsborgerskap:</dt><dd>{statsborgerskap}</dd>
                  <dt>Sivilstand:</dt><dd>{sivilstand}</dd>
                </dl>
              </Nav.Column>
            </Nav.Row>
            {/* SLUTT PERSONINFO */}
            {/* START ADRESSE */}
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="6">
                <dl className="person__detaljer">
                  <dt>Bostedsadresse</dt>
                  <dd>{`${gatenavn} ${husnummer} ${husbokstav}`}</dd>
                  <dd>{`${postnr} ${poststed}`}</dd>
                  <dd>{`${land}`}</dd>
                </dl>
              </Nav.Column>
            </Nav.Row>
            {/* SLUTT ADRESSE */}
          </Nav.Container>
        </Nav.EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  person: PersonSelector(state),
});

const mapDispatchToProps = () => ({});

// withRouter required, to provide; this.props.match.params;
export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
