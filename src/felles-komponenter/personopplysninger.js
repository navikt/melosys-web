import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PT from 'prop-types';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';
import { PersonSelector, hentSaksopplysninger } from '../ducks/saksopplysninger';
import './personopplysninger.less';

class Personopplysninger extends Component {
  static propTypes = {
    person: PT.object.isRequired,
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
      bostedsadresse: { gateadresse: { gatenavn: '', husnummer: '', husbokstav: '' }, postnr: '', poststed: '', land: '' },
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


    const { poststed, postnr, land, gateadresse: { gatenavn, husnummer, husbokstav } } = bostedsadresse;

    return (
      <div className="personopplysninger panelSeksjon">
        <EkspanderbartPanel tittel={sammensattNavn} apen>
          <Container fluid>
            {/* START PERSONINFO */}
            <Row>
              <Column xs="6">
                <section aria-label="Fornavn">
                  <Undertittel type="undertittel">Fornavn:</Undertittel>
                  <Normaltekst>{fornavn}</Normaltekst>
                </section>
                <section aria-label="Etternavn">
                  <Undertittel type="undertittel">Etternavn:</Undertittel>
                  <Normaltekst>{etternavn}</Normaltekst>
                </section>
                <section aria-label="Fødselsnummer">
                  <Undertittel type="undertittel">Fødselsnummer:</Undertittel>
                  <Normaltekst>{fnr}</Normaltekst>
                </section>
                <section aria-label="Kjønn">
                  <Undertittel type="undertittel">Kjønn:</Undertittel>
                  <Normaltekst>{kjoenn}</Normaltekst>
                </section>
                <section aria-label="Fødselsdato">
                  <Undertittel type="undertittel">Fødselsdato:</Undertittel>
                  <Normaltekst>{foedselsdato}</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section aria-label="Statsborgerskap">
                  <Undertittel type="undertittel">Statsborgerskap:</Undertittel>
                  <Normaltekst>{statsborgerskap}</Normaltekst>
                </section>
                <section aria-label="Sivilstand">
                  <Undertittel type="undertittel">Sivilstand:</Undertittel>
                  <Normaltekst>{sivilstand}</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT PERSONINFO */}
            {/* START ADRESSE */}
            <Row>
              <Column xs="6">
                <section arial-label="Adresse">
                  <Undertittel type="undertittel">Bostedsadresse</Undertittel>
                  <Normaltekst>{`${gatenavn} ${husnummer}${husbokstav}`}</Normaltekst>
                  <Normaltekst>{`${postnr} ${poststed}`}</Normaltekst>
                  <Normaltekst>{`${land}`}</Normaltekst>
                </section>
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
