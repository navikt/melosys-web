import React from 'react';
import { connect } from 'react-redux';
import { Panel } from 'nav-frontend-paneler';
import { TextareaControlled } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';

import './sideKommentarer.css';

const SideKommentarer = () => (
  <div className="sideKommentar panelSeksjon">
    <Panel>
      <form onSubmit={event => event.preventDefault()}>
        <Undertittel>Kommentarer:</Undertittel>
        <TextareaControlled textareaClass="kommentar__tekst" label="" />
        <p className="kommentar__advarsel">Merk: Fremtidige innsynskrav vil også medføre utlevering av kommentarer. Ta hensyn til dette når du skriver.</p>
        <Knapp type="hoved">Lagre kommentar</Knapp>
      </form>
    </Panel>
  </div>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideKommentarer);
