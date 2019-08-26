import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import * as RegistreringContext from '../state/registreringContext';
import ListevelgerFlervalg from '../../../../felleskomponenter/ui/listevelgerFlervalg';
import Medlemskap from '../../../../felleskomponenter/medlemskap';

import { lovvalgsperioderOperations } from '../../../../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../../ducks/avklartefakta';

import { createValidator } from '../../../../felleskomponenter/skjema/validering/skjemaer/createValidator';

import './saksopplysninger.css';

const uuid = require('uuid/v4');

class Saksopplysninger extends Component {
  state = {
    begrunnelseFritekst: '',
  };
  overstyrSubmit = event => {
    event.preventDefault();
  };
  textAreaOnChange = event => {
    const begrunnelseFritekst = event.target.value;
    this.setState({ begrunnelseFritekst });
  };
  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, redigerbart,
    } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }
    return (
      <div>
        <form name="anmodningunntak" id="anmodningunntak" onSubmit={this.overstyrSubmit}>
          <div className="stegvelger panelSeksjon">
            <div className="panel stegFane steg0 stegFane--aktiv">
              <Nav.Systemtittel>Behandle anmoding om unntak</Nav.Systemtittel>
              <br />
              <p>TODO land etc</p>
            </div>
          </div>
        </form>
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}


Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: PT.object, // TODO prop-type
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
