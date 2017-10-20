import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TextareaControlled, SkjemaGruppe } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';

import './sideDialogMelding.css';

class SideDialogMelding extends Component {
  sendMessage = event => {
    event.preventDefault();
  };

  render() {
    return (
      <div className="sideDialogMelding">
        <form onSubmit={this.sendMessage}>
          <SkjemaGruppe>
            <TextareaControlled label="Send ny melding til søker:" />
            <Knapp type="hoved">Send melding</Knapp>
          </SkjemaGruppe>
        </form>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialogMelding);
