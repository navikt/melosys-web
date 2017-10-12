import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';

import SideDialogHistorikk from './sideDialogHistorikk';
import SideDialogMelding from './sideDialogMelding';
import SideDialogDokumenter from './sideDialogDokumenter';

import './sideDialog.css';

const uuid = require('uuid/v4');


const Fane = function(props) {
  return (
    <div className="dialog__fane">{props.children}</div>
  );
};

class SideDialog extends Component {
  static propTypes = {
    faner: PT.array,
  };

  static defaultProps = {
    faner: [
      { navn: 'historikk', tittel: 'Historikk', komponent: <SideDialogHistorikk key={uuid()} /> },
      { navn: 'melding', tittel: 'Melding', komponent: <SideDialogMelding key={uuid()} /> },
      { navn: 'dokumenter', tittel: 'dokumenter', komponent: <SideDialogDokumenter key={uuid()} /> },
    ],
  };

  state = {
    aktivFane: '',
  }

  componentWillMount() {
    this.setState({ aktivFane: this.props.faner[0].navn });
  }

  tilFane = navn => {
    this.setState({ aktivFane: navn });
  }

  render() {
    return (
      <div className="dialog panelSeksjon">
        <Panel>
          <div className="dialog__meny" role="navigation">
            { this.props.faner.map(item => (
              <button
                className={classnames({ meny__element: true, 'meny__element--aktiv': (item.navn === this.state.aktivFane) })}
                key={uuid()}
                onClick={() => this.tilFane(item.navn)}>{item.tittel}</button>))}
          </div>
          <Fane id="historikk">
            { this.props.faner.find(item => item.navn === this.state.aktivFane).komponent }
          </Fane>
        </Panel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialog);
