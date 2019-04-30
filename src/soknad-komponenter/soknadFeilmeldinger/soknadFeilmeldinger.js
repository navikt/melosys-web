import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { formSelectors } from '../../ducks/form';

import * as Nav from '../../utils/navFrontend';

import './soknadFeilmeldinger.css';


const SoknadFeilmeldinger = ({ panelerMedFeil }) => {
  if (panelerMedFeil.length === 0) return null;

  return (
    <Nav.AlertStripe className="feilmelding" type="advarsel" >
      En feil har oppstått. Sjekk følgende panel(er):
      <ul>
        {
          panelerMedFeil.map(panelnavn => (
            <li key={panelnavn}>{panelnavn}</li>
          ))
        }
      </ul>
    </Nav.AlertStripe>
  );
};

SoknadFeilmeldinger.propTypes = {
  panelerMedFeil: PT.arrayOf(PT.string),
};

SoknadFeilmeldinger.defaultProps = {
  panelerMedFeil: [],
};

const mapStateToProps = state => ({
  panelerMedFeil: formSelectors.PanelerMedFeilSelector(state),
});

export default connect(mapStateToProps)(SoknadFeilmeldinger);
