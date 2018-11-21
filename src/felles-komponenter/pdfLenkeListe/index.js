import React, { Component } from 'react';
import PT from 'prop-types';
import * as MPT from '../../proptypes/';
import { dokumenterOperations } from '../../ducks/dokumenter';
import * as Nav from '../../utils/navFrontend';

import './pdfLenkeListe.css';

const uuid = require('uuid/v4');

class PdfLenkeListe extends Component {
  state = { feilmelding: false };

  klikk = async dokument => {
    const { behandlingID, vedKlikk } = this.props;

    // Avbryt forespørsel hvis validator er oppgitt og returnerer false
    if (vedKlikk) {
      const validert = await vedKlikk();
      if (!validert) {
        return;
      }
    }

    const fileURL = await dokumenterOperations.forhandsvisPDF(behandlingID, dokument.type, dokument.data);
    if (fileURL) {
      window.open(fileURL);
      this.setState({ feilmelding: false });
    } else {
      this.setState({ feilmelding: 'Det oppstod en feil da brevet skulle forhåndsvises!' });
    }
  };

  lagDokumentLenke(dokument) {
    return (<button onClick={() => this.klikk(dokument)} key={uuid()}>{dokument.navn}</button>);
  }

  render() {
    const { dokumenter } = this.props;
    return (
      <div className="pdfLenkeListe">
        { dokumenter.map(dokument => this.lagDokumentLenke(dokument)) }
        { this.state.feilmelding &&
          <Nav.AlertStripe type="advarsel" className="varsel">{this.state.feilmelding}</Nav.AlertStripe>
        }
      </div>
    );
  }
}

PdfLenkeListe.propTypes = {
  behandlingID: PT.number.isRequired,
  dokumenter: MPT.DokumentMetadataListe.isRequired,
  vedKlikk: PT.func,
};

PdfLenkeListe.defaultProps = {
  vedKlikk: null,
};

export default PdfLenkeListe;
