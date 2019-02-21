import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import * as MPT from '../../proptypes';

import PdfLenkeListe from '../pdfLenkeListe';
import { KodeTermSelect } from '../kodeTermSelect';
import { fagsakSelectors } from '../../ducks/fagsaker';

import * as Nav from '../../utils/navFrontend';

import './dialogboksHenlegg.css';


export class DialogboksHenleggSak extends Component {
  state = {
    begrunnelseKode: '',
    feilmeldingSelect: undefined,
    feilmeldingFritekst: undefined,
    fritekst: '',
  };

  velgBegrunnelseHandle = event => {
    const begrunnelseKode = event.target.value;
    this.setState({ begrunnelseKode, feilmeldingSelect: undefined });
  };

  erBegrunnelseValgt = () => this.state.begrunnelseKode !== '';

  vedKlikkLenke = async () => {
    const begrunnelsePassertValidering = this.validerBegrunnelse();
    const fritekstPassertValidering = this.validerFritekst();

    return begrunnelsePassertValidering && fritekstPassertValidering;
  };

  validerBegrunnelse = () => {
    const { erBegrunnelseValgt } = this;
    if (!erBegrunnelseValgt()) {
      this.setState({ feilmeldingSelect: { feilmelding: 'Ingen begrunnelse valgt' } });
    }
    return erBegrunnelseValgt();
  };

  validerFritekst = () => {
    const { fritekstValgt, fritekstTom } = this;
    const fritekstValideringPassert = !(fritekstValgt() && fritekstTom());
    if (!fritekstValideringPassert) {
      this.setState({ feilmeldingFritekst: { feilmelding: 'Mangler fritekst' } });
    }
    return fritekstValideringPassert;
  };

  fritekstValgt = () => this.state.begrunnelseKode === MKV.Koder.henleggelsesgrunner.ANNET;

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

    const { begrunnelseKode } = this.state;
    let { fritekst } = this.state;
    if (fritekst === '') fritekst = null;
    this.props.henleggHandle({
      begrunnelseKode,
      fritekst,
    });
  };

  render() {
    const {
      avbryt,
      oppsummering,
      redigerbart,
      ariaHideApp,
    } = this.props;

    const {
      begrunnelseKode,
      feilmeldingSelect,
      fritekst,
      feilmeldingFritekst,
    } = this.state;

    const {
      vedKlikkHenlegg,
      erBegrunnelseValgt,
    } = this;

    const data = erBegrunnelseValgt() ? {
      begrunnelseKode,
      fritekst: fritekst === '' ? null : fritekst,
      mottaker: MKV.Koder.aktoersroller.BRUKER,
    } : {};
    const dokumenter = [{
      navn: 'Forhåndsvis brev',
      type: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
      data,
    }];

    const visTekstFelt = begrunnelseKode === MKV.Koder.henleggelsesgrunner.ANNET;

    return (
      <Nav.Modal
        className="dialogboksHenlegg"
        isOpen
        contentLabel="Henlegg sak"
        onRequestClose={avbryt}
        closeButton={false}
        shouldCloseOnOverlayClick
        ariaHideApp={ariaHideApp}>
        <div>
          <Nav.Systemtittel className="overskrift">Henlegg saken</Nav.Systemtittel>
          <KodeTermSelect
            feil={feilmeldingSelect}
            onChange={this.velgBegrunnelseHandle}
            label="Begrunnelse"
            value={begrunnelseKode}
            koder={MKV.KTObjects.henleggelsesgrunner}
            disableForsteValg={erBegrunnelseValgt()}
            redigerbar={redigerbart}
          />
          {
            visTekstFelt && <Nav.Textarea feil={feilmeldingFritekst} label="Fritekst" onChange={this.fritekstOnchange} value={fritekst} />
          }
          <PdfLenkeListe
            behandlingID={oppsummering.behandlingID}
            dokumenter={dokumenter}
            vedKlikk={this.vedKlikkLenke}
          />
          <div className="dialogboksHenlegg__container__knapperad">
            <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            <Nav.Hovedknapp
              disabled={!erBegrunnelseValgt()}
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
  redigerbart: PT.bool.isRequired,
  ariaHideApp: PT.bool,
};

DialogboksHenleggSak.defaultProps = {
  oppsummering: {},
  ariaHideApp: true,
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

export default connect(mapStateToProps, null)(DialogboksHenleggSak);
