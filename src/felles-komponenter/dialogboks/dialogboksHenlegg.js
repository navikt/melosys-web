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
const { MELDING_HENLAGT_SAK } = kodeset.brev.produserbareDokumenter;
const { HENLEGGELSE } = kodeset.behandlinger.behandlingsresultattyper;

class DialogboksHenleggSak extends Component {
  state = {
    erBegrunnelseValgt: false,
    begrunnelseKode: '',
    feilmelding: undefined,
    fritekst: '',
  };

  velgBegrunnelseHandle = event => {
    if (!this.state.erBegrunnelseValgt) this.setState({ erBegrunnelseValgt: true });

    const begrunnelseKode = event.target.value;
    this.setState({ begrunnelseKode, feilmelding: undefined });
  };

  validerBegrunnelse = async () => {
    const { erBegrunnelseValgt, fritekst } = this.state;
    const { fritekstValgt } = this;

    if (!erBegrunnelseValgt) {
      this.setState({ feilmelding: { feilmelding: 'Ingen begrunnelse valgt' } });
    }
    if (fritekstValgt && fritekst === 'undefined') {
      this.setState({ feilmelding: { feilmelding: 'Mangler fritekst' } });
    }

    return erBegrunnelseValgt;
  };

  fritekstValgt = () => this.state.begrunnelseKode === 'ANNET';

  oppdaterTekst = event => {
    const fritekst = event.target.value;
    this.setState({ fritekst });
  };

  render() {
    const {
      henleggHandle, avbryt, oppsummering,
    } = this.props;

    const {
      begrunnelseKode,
      erBegrunnelseValgt,
      feilmelding,
      fritekst,
    } = this.state;


    const data = erBegrunnelseValgt ? {
      begrunnelse: begrunnelseKode,
      fritekst: fritekst === '' ? null : fritekst,
    } : {};
    const dokumenter = [{
      navn: 'Forhåndsvis brev',
      type: MELDING_HENLAGT_SAK,
      data,
    }];

    const visTekstFelt = begrunnelseKode === kodeset.henleggelsesgrunner.ANNET;

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
              <option key={henleggelsesGrunn.kode} value={henleggelsesGrunn.kode}>{henleggelsesGrunn.term}</option>
            ))}
          </Nav.Select>
          {
            visTekstFelt && <Nav.Textarea label="Fritekst" onChange={this.oppdaterTekst} value={fritekst} />
          }
          <PdfLenkeListe
            behandlingID={oppsummering.behandlingID}
            dokumenter={dokumenter}
            vedKlikk={this.validerBegrunnelse} />
          <div className="dialogboksHenlegg__container__knapperad">
            <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            <Nav.Hovedknapp
              disabled={!erBegrunnelseValgt}
              onClick={() => henleggHandle({
                behandlingsresultattype: HENLEGGELSE,
                begrunnelse: begrunnelseKode,
                fritekst,
              })}
            >
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
