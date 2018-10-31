import React, { Component } from 'react';
import PT from 'prop-types';
import * as MPT from '../../proptypes/';
import { dokumenterOperations } from '../../ducks/dokumenter';
import * as Nav from '../../utils/navFrontend';

import './pdfLinkListe.css';

const uuid = require('uuid/v4');

class Index extends Component {
  state = { feilmelding: false };

    klikk = async dokument => {
      const { behandlingID } = this.props;
      const fileURL = await dokumenterOperations.forhandsvisPDF(behandlingID, dokument.type, dokument.data);
      if (fileURL) {
        window.open(fileURL);
        this.setState({ feilmelding: false });
      } else {
        this.setState({ feilmelding: 'Det oppstod en feil da brevet skulle forhåndsvises!' });
      }
    };

    lagDokumentLink(dokument) {
      return (<button onClick={() => this.klikk(dokument)} key={uuid()}>{dokument.navn}</button>);
    }

    render() {
      const { dokumenter } = this.props;
      return (
        <div className="pdfLinkListe">
          { dokumenter.map(dokument => this.lagDokumentLink(dokument)) }
          { this.state.feilmelding &&
            <Nav.AlertStripe type="advarsel" className="varsel">{this.state.feilmelding}</Nav.AlertStripe>
          }
        </div>
      );
    }
}

Index.propTypes = {
  behandlingID: PT.number.isRequired,
  dokumenter: MPT.DokumentMetadataListe.isRequired,
};

export default Index;
