import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PT from 'prop-types';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Container, Row, Column } from 'nav-frontend-grid';
import { PersonSelector, hentSaksopplysninger } from '../ducks/saksopplysninger';
import { PersonPropType } from '../proptypes';
import './personopplysninger.css';

class Personopplysninger extends Component {
  static propTypes = {
    person: PersonPropType,
    match: PT.object.isRequired,
    hentSaksopplysninger: PT.func.isRequired,
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

  componentWillMount() {
    const { saksnr } = this.props.match.params;
    this.props.hentSaksopplysninger(saksnr);
  }

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
        <EkspanderbartPanel tittel={sammensattNavn} apen>
          <Container fluid>
            {/* START PERSONINFO */}
            <Row className="person__seksjon">
              <Column xs="6">
                <dl className="person__detaljer">
                  <dt>Fornavn:</dt><dd>{fornavn}</dd>
                  <dt>Etternavn:</dt><dd>{etternavn}</dd>
                  <dt>Fødselsnummer:</dt><dd>{fnr}</dd>
                  <dt>Kjønn:</dt><dd>{kjoenn}</dd>
                </dl>
              </Column>
              <Column xs="6">
                <dl className="person__detaljer">
                  <dt>Fødselsdato:</dt><dd>{foedselsdato}</dd>
                  <dt>Statsborgerskap:</dt><dd>{statsborgerskap}</dd>
                  <dt>Sivilstand:</dt><dd>{sivilstand}</dd>
                </dl>
              </Column>
            </Row>
            {/* SLUTT PERSONINFO */}
            {/* START ADRESSE */}
            <Row className="person__seksjon">
              <Column xs="6">
                <dl className="person__detaljer">
                  <dt>Bostedsadresse</dt>
                  <dd>{`${gatenavn} ${husnummer} ${husbokstav}`}</dd>
                  <dd>{`${postnr} ${poststed}`}</dd>
                  <dd>{`${land}`}</dd>
                </dl>
              </Column>
            </Row>
            {/* SLUTT ADRESSE */}
          </Container>
        </EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  person: PersonSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentSaksopplysninger: saksnr => dispatch(hentSaksopplysninger(saksnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Personopplysninger));
