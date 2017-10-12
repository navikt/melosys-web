import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';

import SideDialogHistorikk from './sideDialogHistorikk';
import SideDialogMelding from './sideDialogMelding';
import SideDialogDokumenter from './sideDialogDokumenter';

import './sideDialog.css';

const Fane = function(props) {
  return (
    <div className="dialog__fane">{props.children}</div>
  );
};

class SideDialog extends Component {
  static propTypes = {
    historikk: PT.object,
  };
  static defaultProps = {
    historikk: {

    },
  };

  render() {
    return (
      <div className="dialog panelSeksjon">
        <Panel>
          <div className="dialog__meny" role="navigation">
            <button className="meny__element meny__element--aktiv">Historikk</button>
            <button className="meny__element">Send melding</button>
            <button className="meny__element">Dokumenter</button>
          </div>
          <Fane id="historikk">
            <SideDialogHistorikk />
            <SideDialogMelding />
            <SideDialogDokumenter />
          </Fane>
        </Panel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialog);
