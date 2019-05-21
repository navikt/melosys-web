import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';
import { TextareaControlled } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';

import { behandlingerSelectors } from '../ducks/behandlinger/';
import './sideKommentarer.css';

const SideKommentarer = props => {
  const { redigerbart } = props;
  return (
    <div className="sideKommentar panelSeksjon">
      <Panel>
        <form onSubmit={event => event.preventDefault()}>
          <Undertittel>Kommentarer:</Undertittel>
          <TextareaControlled disabled={!redigerbart} textareaClass="kommentar__tekst" label="" />
          <p className="kommentar__advarsel">Merk: Fremtidige innsynskrav vil også medføre utlevering av kommentarer. Ta hensyn til dette når du skriver.</p>
          <Knapp type="hoved" disabled={!redigerbart}>Lagre kommentar</Knapp>
        </form>
      </Panel>
    </div>
  );
};
SideKommentarer.propTypes = {
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideKommentarer);
