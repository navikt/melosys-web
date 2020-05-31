import React, { Component } from 'react';
import PT from 'prop-types';
import * as MPT from '../../proptypes';
import { dokumenterOperations } from '../../ducks/dokumenter';
import * as Nav from '../../utils/navFrontend';

import './pdfLenkeListe.css';

const uuid = require('uuid/v4');

class PdfLenkeListe extends Component {
  state = {
    feilmelding: false,
  };

  setGeneriskFeil = erSed => {
    this.setState({ feilmelding: `Det oppstod en feil da ${erSed ? 'SED' : 'brevet'} skulle forhåndsvises!` });
  };

  klikk = async dokument => {
    const { behandlingID, vedKlikk } = this.props;
    const { setGeneriskFeil } = this;

    // Avbryt forespørsel hvis validator er oppgitt og returnerer false
    if (vedKlikk) {
      const validert = await vedKlikk();
      if (!validert) {
        return;
      }
    }

    let fileURL;

    try {
      const data = dokument.data || {};

      if (dokument.erSed) {
        fileURL = await dokumenterOperations.forhandsvisSed(behandlingID, dokument.type, data);
      } else {
        fileURL = await dokumenterOperations.forhandsvisBrev(behandlingID, dokument.type, data);
      }
    } catch (e) {
      if (e.status >= 500) {
        setGeneriskFeil(dokument.erSed);
      } else if (e.status >= 400) {
        this.setState({ feilmelding: e.body.message });
      }
    }

    if (fileURL) {
      window.open(fileURL);
      this.setState({ feilmelding: false });
    }
  };

  lagDokumentLenke(dokument) {
    return (
      <button
        onClick={() => this.klikk(dokument)}
        key={uuid()}
        type="button"
      >
        {dokument.navn}
      </button>
    );
  }

  render() {
    return (
      <div className="pdfLenkeListe">
        { this.props.dokumenter.map(dokument => this.lagDokumentLenke(dokument)) }
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
