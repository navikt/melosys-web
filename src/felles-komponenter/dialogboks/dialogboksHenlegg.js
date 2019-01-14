import React, { Component } from 'react';
import PT from 'prop-types';
import Kodeverk from 'melosys-kodeverk';
import { connect } from 'react-redux';

import * as MPT from '../../proptypes';

import PdfLenkeListe from '../../felles-komponenter/pdfLenkeListe';
import { fagsakSelectors } from '../../ducks/fagsaker';

import * as Nav from '../../utils/navFrontend';

import './dialogboksHenlegg.css';

const { kodeset, kodeverk } = Kodeverk;
const { henleggelsesgrunner } = kodeverk;
const MELDING_HENLAGT_SAK = Object.keys(kodeset.brev.produserbareDokumenter)[4];
const HENLEGGELSE = Object.keys(kodeset.behandlinger.behandlingsresultattyper)[2];

class DialogboksHenleggSak extends Component {
  state = {
    erBegrunnelseValgt: false,
    begrunnelseKode: '',
    feilmelding: undefined,
    tekst: '',
  };

  velgBegrunnelseHandle = event => {
    if (!this.state.erBegrunnelseValgt) this.setState({ erBegrunnelseValgt: true });

    const begrunnelseTerm = event.target.value;
    const begrunnelseKode = henleggelsesgrunner.find(grunn => grunn.term === begrunnelseTerm).kode;
    this.setState({ begrunnelseKode, feilmelding: undefined });
  };

  validerBegrunnelse = async () => {
    if (!this.state.erBegrunnelseValgt) {
      this.setState({ feilmelding: { feilmelding: 'Ingen begrunnelse valgt' } });
    }
    return this.state.erBegrunnelseValgt;
  };

  oppdaterTekst = event => {
    const tekst = event.target.value;
    this.setState({ tekst });
  };

  render() {
    const {
      henleggHandle, avbryt, oppsummering,
    } = this.props;

    const {
      begrunnelseKode,
      erBegrunnelseValgt,
      feilmelding,
      tekst,
    } = this.state;

    const dokumenter = [{
      navn: 'Forhåndsvis brev',
      type: MELDING_HENLAGT_SAK,
    }];
    if (erBegrunnelseValgt) {
      Object.assign(dokumenter[0], {
        data: {
          begrunnelse: begrunnelseKode,
          tekst,
        },
      });
    }

    const visTekstFelt = begrunnelseKode === henleggelsesgrunner[2].kode;

    return (
      <Nav.Modal
        className="dialogboksHenlegg"
        isOpen
        contentLabel="Henlegg sak"
        onRequestClose={avbryt}
        closeButton={false}
        shouldCloseOnOverlayClick>
        <div>
          <Nav.Systemtittel className="overskrift">Henlegg saken</Nav.Systemtittel>
          <Nav.Select
            feil={feilmelding}
            onChange={this.velgBegrunnelseHandle}
            label="Begrunnelse">
            <option key="VELG" value="VELG" disabled={erBegrunnelseValgt}>Velg begrunnelse</option>
            {henleggelsesgrunner.map(henleggelsesGrunn => (
              <option key={henleggelsesGrunn.kode}>{henleggelsesGrunn.term}</option>
            ))}
          </Nav.Select>
          {
            visTekstFelt && <Nav.Textarea label="Fritekst" onChange={this.oppdaterTekst} value={tekst} />
          }
          <PdfLenkeListe
            behandlingID={oppsummering.behandlingID}
            dokumenter={dokumenter}
            vedKlikk={this.validerBegrunnelse} />
          <div className="dialogboksHenlegg__container__knapperad">
            <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            <Nav.Hovedknapp
              disabled={!erBegrunnelseValgt}
              onClick={() => henleggHandle({ behandlingsresultattype: HENLEGGELSE, tekst })}>
              Henlegg saken
            </Nav.Hovedknapp>
          </div>
        </div>
      </Nav.Modal>
    );
  }
}

DialogboksHenleggSak.propTypes = {
  henleggHandle: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
};

DialogboksHenleggSak.defaultProps = {
  oppsummering: {},
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

export default connect(mapStateToProps, null)(DialogboksHenleggSak);
