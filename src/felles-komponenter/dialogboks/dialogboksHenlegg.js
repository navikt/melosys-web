import React, { Component } from 'react';
import PT from 'prop-types';
import Kodeverk from 'melosys-kodeverk';
import { connect } from 'react-redux';


import * as MPT from '../../proptypes';

import PdfLenkeListe from '../../felles-komponenter/pdfLenkeListe';
import { KodeTermSelect } from '../kodeTermSelect';
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
    feilmeldingSelect: undefined,
    feilmeldingFritekst: undefined,
    fritekst: '',
  };

  velgBegrunnelseHandle = event => {
    if (!this.state.erBegrunnelseValgt) this.setState({ erBegrunnelseValgt: true });

    const begrunnelseKode = event.target.value;
    this.setState({ begrunnelseKode, feilmeldingSelect: undefined });
  };

  vedKlikkLenke = async () => {
    const begrunnelsePassertValidering = this.validerBegrunnelse();
    const fritekstPassertValidering = this.validerFritekst();

    return begrunnelsePassertValidering && fritekstPassertValidering;
  };

  validerBegrunnelse = () => {
    const { erBegrunnelseValgt } = this.state;
    if (!erBegrunnelseValgt) {
      this.setState({ feilmeldingSelect: { feilmelding: 'Ingen begrunnelse valgt' } });
    }
    return erBegrunnelseValgt;
  }

  validerFritekst = () => {
    const { fritekstValgt, fritekstTom } = this;
    const fritekstValideringPassert = !(fritekstValgt() && fritekstTom());
    if (!fritekstValideringPassert) {
      this.setState({ feilmeldingFritekst: { feilmelding: 'Mangler fritekst' } });
    }
    return fritekstValideringPassert;
  };

  fritekstValgt = () => this.state.begrunnelseKode === 'ANNET';

  fritekstTom = () => this.state.fritekst === '';

  fritekstOnchange = event => {
    const fritekst = event.target.value;
    this.oppdaterTekst(fritekst);
    this.fjernFeilmeldingFritekst();
  };

  fjernFeilmeldingFritekst = () => this.setState({ feilmeldingFritekst: undefined });

  oppdaterTekst = fritekst => this.setState({ fritekst });

  vedKlikkHenlegg = () => {
    if (!(this.validerBegrunnelse() && this.validerFritekst())) return;

    const { fritekst, begrunnelseKode } = this.state;
    this.props.henleggHandle({
      begrunnelse: begrunnelseKode,
      fritekst,
    });
  };

  render() {
    const {
      avbryt,
      oppsummering,
    } = this.props;

    const {
      begrunnelseKode,
      erBegrunnelseValgt,
      feilmeldingSelect,
      fritekst,
      feilmeldingFritekst,
    } = this.state;

    const {
      vedKlikkHenlegg,
    } = this;

    const data = erBegrunnelseValgt ? {
      begrunnelse: begrunnelseKode,
      fritekst: fritekst === '' ? null : fritekst,
      mottaker: kodeset.aktoerroller.BRUKER,
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
          <KodeTermSelect
            feil={feilmeldingSelect}
            onChange={this.velgBegrunnelseHandle}
            label="Begrunnelse"
            value={begrunnelseKode}
            koder={henleggelsesgrunner}
          />
          {
            visTekstFelt && <Nav.Textarea feil={feilmeldingFritekst} label="Fritekst" onChange={this.fritekstOnchange} value={fritekst} />
          }
          <PdfLenkeListe
            behandlingID={oppsummering.behandlingID}
            dokumenter={dokumenter}
            vedKlikk={this.vedKlikkLenke} />
          <div className="dialogboksHenlegg__container__knapperad">
            <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            <Nav.Hovedknapp
              disabled={!erBegrunnelseValgt}
              onClick={vedKlikkHenlegg}
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
