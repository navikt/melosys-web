import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Konstanter from '../../constants';

import EnkeltDato from '../datoOmrade/enkeltDato';

import './informasjon.css';
import { PersonSelectors } from '../../ducks/person';
import { OrganisasjonSelectors } from '../../ducks/organisasjon';

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = { spinner: {} };

  gyldigBruker = (id, value) => id === 'brukersID' && (value.length === Konstanter.ANTALL_TALL_I_DNR || value.length === Konstanter.ANTALL_TALL_I_FNR);

  gyldigAvsender = (id, value) => id === 'avsendersID' && (
    value.length === Konstanter.ANTALL_TALL_I_ORGNR ||
    value.length === Konstanter.ANTALL_TALL_I_DNR || value.length === Konstanter.ANTALL_TALL_I_FNR
  );

  vedIDFeltTastOpp = event => {
    const { id, value } = event.target;
    const { hentBruker, hentAvsender } = this.props;

    if (this.gyldigBruker(id, value)) {
      hentBruker(value, id);
      this.toggleSpinner('brukersNavn');
    } else if (this.gyldigAvsender(id, value)) {
      hentAvsender(value, id);
      this.toggleSpinner('avsenderNavn');
    }
  };

  /** Toggle spinneren av og på. Når spinner skjules, sett en timeout på 500ms.
   * Dette sikrer at spinneren ikke bare flasher dersom kallet til API går raskt. Dataene vises.
   * umiddelbart fra payload, men spinneren har en levetid på minimum 500 ms som gir brukeren
   * tid til å tolke grensesnittet, dvs spinneren.
   * @param navn {String} Navnet på spinneren
   */
  toggleSpinner = navn => {
    this.setState({ spinner: { ...this.state.spinner, [navn]: true } });

    setTimeout(() => {
      this.setState({ spinner: { ...this.state.spinner, [navn]: false } });
    }, 1000);
  };

  /** Noen felter skal disables dersom andre felter er fylt inn eller andre
   * forutsetninger for disabling er tilstede.
   * @param feltNavn {string} Navnet på feltet som skal disables.
   * @returns {boolean} Hvorvidt feltet skal disables eller ikke
   */
  skalFeltetDisables = feltNavn => {
    const { journalforingSkjemaVerdier } = this.props;

    switch (feltNavn) {
      case 'avsendersNavn': { return journalforingSkjemaVerdier.avsenderFnrOrgnr !== ''; }
      case 'avsendersID': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      default: return false;
    }
  };

  render() {
    const { journalforing, valgbareDokumentTitler, valgbareVedleggsTitler } = this.props;
    const { dokument = {} } = journalforing;
    const { spinner: { brukersNavn: visBrukerSpinner }, spinner: { avsenderNavn: visAvsenderSpinner } } = this.state;
    const { skalFeltetDisables } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.vedIDFeltTastOpp} />
          <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderID" label="Avsenders fnr, dnr eller orgnr:" disabled={skalFeltetDisables('avsendersID')} onKeyUp={this.vedIDFeltTastOpp} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn eller firmanavn:" disabled={skalFeltetDisables('avsendersNavn')} />
          { visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
          { dokument.url && <Link to={dokument.url} target="_blank" className="informasjon__dokumentlenke"><EnkeltDato dato={dokument.mottattDato} />: {dokument.tittel.term}</Link> }
          <Skjema.ListeVelger
            feltNavn="dokumentTittel"
            label="Tittel på hoveddokument:"
            placeholder="(velg eller skriv inn egen tittel)"
            muligeValg={valgbareDokumentTitler}
          />
          <Skjema.ListeVelger
            feltNavn="vedleggsTitler"
            label="Titler på vedlegg:"
            multiListe
            muligeValg={valgbareVedleggsTitler}
            placeholder="(Velg eller skriv inn egen tittel)"
          />
        </Nav.Fieldset>
      </div>
    );
  }
}

Informasjon.propTypes = {
  journalforing: MPT.Journalforing.isRequired,
  valgbareDokumentTitler: PT.arrayOf(MPT.Kodeverk),
  valgbareVedleggsTitler: PT.arrayOf(MPT.Kodeverk),
  journalforingSkjemaVerdier: PT.object, // TODO: Vurdere MPT.
  hentBruker: PT.func.isRequired,
  hentAvsender: PT.func.isRequired,
};

Informasjon.defaultProps = {
  journalforingSkjemaVerdier: {},
  valgbareDokumentTitler: [],
  valgbareVedleggsTitler: [],
};

const mapStateToProps = state => ({
  person: PersonSelectors.personSelector(state),
  organisasjon: OrganisasjonSelectors.organisasjonSelector(state),
});

export default connect(mapStateToProps)(Informasjon);
