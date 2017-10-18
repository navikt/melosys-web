import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as Nav from '../utils/navFrontend';
import { OrganisasjonerSelector } from '../ducks/saksopplysninger';
import * as MPT from '../proptypes';

import './personopplysninger.css';

class ArbeidsgiverNorge extends Component {
  static propTypes = {
    organisasjoner: MPT.OrganisasjonerPropType,
  };

  static defaultProps = {
    organisasjoner: [],
  };

  render() {
    return (
      <div className="personopplysninger panelSeksjon">
        <Nav.EkspanderbartPanel tittel="Organisasjoner" apen>
          Orgnaissjon i Norge
        </Nav.EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  organisasjoner: OrganisasjonerSelector(state),
});

const mapDispatchToProps = () => ({
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArbeidsgiverNorge));
