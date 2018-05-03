import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Konstanter from '../../constants';

import './informasjon.css';
import { PersonSelectors } from '../../ducks/person';
import { OrganisasjonSelectors } from '../../ducks/organisasjon';

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = { spinner: {} };

  erGyldigBrukerID = (id, value) => id === 'brukersID' && (value.length === Konstanter.ANTALL_TALL_I_DNR || value.length === Konstanter.ANTALL_TALL_I_FNR);

  erGyldigAvsenderID = (id, value) => id === 'avsendersID' && (
    value.length === Konstanter.ANTALL_TALL_I_ORGNR ||
    value.length === Konstanter.ANTALL_TALL_I_DNR || value.length === Konstanter.ANTALL_TALL_I_FNR
  );

  IDFeltTastOppHandler = event => {
    const { id, value } = event.target;
    const { hentBruker, hentAvsender } = this.props;

    if (this.erGyldigBrukerID(id, value)) {
      hentBruker(value, id);
      this.toggleSpinner('brukersNavn');
    } else if (this.erGyldigAvsenderID(id, value)) {
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
      case 'avsenderNavn': { return journalforingSkjemaVerdier.avsenderID !== ''; }
      case 'avsenderID': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      default: return false;
    }
  };

  render() {
    const { valgbareDokumentTitler, valgbareVedleggsTitler } = this.props;
    const { spinner: { brukersNavn: visBrukerSpinner }, spinner: { avsenderNavn: visAvsenderSpinner } } = this.state;
    const { skalFeltetDisables } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
          <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderID" label="Avsenders fnr, dnr eller orgnr:" disabled={skalFeltetDisables('avsenderID')} onKeyUp={this.IDFeltTastOppHandler} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn eller firmanavn:" disabled={skalFeltetDisables('avsenderNavn')} />
          { visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
          <Skjema.Input feltNavn="mottattDato" label="Dokument mottatt:" disabled />
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
