import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Skjema from '../../felles-komponenter/skjema';

import { formSelectors } from '../../ducks/form/';
/*
import * as Ikoner from '../resources/images';
import { TextareaControlled, SkjemaGruppe } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
*/
import * as Validering from '../skjema/validering';
import { dokumenterOperations } from '../../ducks/dokumenter';
/*
  <Nav.Tekstomrade ingenFormattering={true}>
    <h3>Dette skal stå i mangelbrevet</h3>
    <p>En beskrivelse av hvilken informasjon eller dokumentasjon som mangler for å gjøre søknaden komplett. Din tekst starter etter teksten "Dette må du sende oss:".</p>
    <p>Brevet inneholder allerede en innleding, beskrivelse av hvordan informasjon sendes inn og en avsluttende tekst. Trykk på "forhåndsvis brev" for å se brevet når du er fgerdig med å skrive.<br/>
    OBS! Det er ikke automatisk stavekontroll, så sjekk teksten to har skrevet.</p>
  </Nav.Tekstomrade>
*/
class MangelBrev extends Component {
  harFritext = () => {
    const { mangelBrevSkjemaVerdier } = this.props;
    if (!mangelBrevSkjemaVerdier) return false;
    return mangelBrevSkjemaVerdier.dokumenttypeKode === '000074';
  };

  sendBrev = () => {
    const { mangelBrevSkjemaVerdier, opprettDokument } = this.props;
    const { fritekst, mottaker, dokumenttypeKode } = mangelBrevSkjemaVerdier;
    if (this.harFritext()) {
      const dokument = { fritekst, mottaker };
      opprettDokument(4, dokumenttypeKode, dokument).then(response => console.dir(response));
    } else {
      opprettDokument(4, dokumenttypeKode, {}).then(response => console.dir(response));
    }
  };
  render () {
    const { dokumenttyper, representerer } = this.props;
    const placeholder = 'Feks: "Opplysning om antall utsendet i pperioden, "Opplysninger om den ansatt erstatter en annen utsendt ansatt""';
    // const feilmelding = {feilmelding: 'Her er det noe feil.'};
    return (
      <div>
        <Nav.Fieldset legend="Nytt brev">
          <Skjema.Select feltNavn="mottaker" bredde="fullbredde" label="Mottaker">
            {representerer && representerer.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
          </Skjema.Select>
          <Skjema.Select feltNavn="dokumenttypeKode" bredde="fullbredde" label="Type brev" >
            {dokumenttyper && dokumenttyper.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
          </Skjema.Select>
          {this.harFritext() && <Skjema.Textarea feltNavn="fritekst" label="Hva skal søker sende inn?" maxLength={200} placeholder={placeholder} visTellerFra={100} feil={undefined} />}
          <Nav.Knapp type="hoved" onClick={this.sendBrev}>Send Brev</Nav.Knapp>
        </Nav.Fieldset>
      </div>
    );
  }
}
MangelBrev.propTypes = {
  opprettDokument: PT.func.isRequired,
  representerer: PT.arrayOf(MPT.Kodeverk),
  dokumenttyper: PT.arrayOf(MPT.Kodeverk),
  mangelBrevSkjemaVerdier: PT.object,
};
MangelBrev.defaultProps = {
  mangelBrevSkjemaVerdier: {},
  representerer: [],
  dokumenttyper: [],
};

const MangelBrevForm = reduxForm({
  form: 'mangelbrev',
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Felles.byggValidering(values, props),
})(MangelBrev);

const mapStateToProps = state => ({
  mangelBrevSkjemaVerdier: formSelectors.MangelBrevFormSelector(state).values,
  dokumenttyper: state.kodeverk.data.dokumenttyper,
  representerer: state.kodeverk.data.representerer,
});

const mapDispatchToProps = dispatch => ({
  opprettDokument: (behandlingID, dokumenttypeKode, dokument) => dispatch(dokumenterOperations.opprettDokument(behandlingID, dokumenttypeKode, dokument)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MangelBrevForm);
