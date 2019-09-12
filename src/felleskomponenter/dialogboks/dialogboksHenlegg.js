import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';

import PdfLenkeListe from '../pdfLenkeListe';
import { KodeTermSelect } from '../ui/kodeTermSelect';
import Knapperad from '../knapperad';

import { behandlingerSelectors } from '../../ducks/behandlinger';

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

  fritekstValgt = () => this.state.begrunnelseKode === MKV.Koder.begrunnelser.henleggelsesgrunner.ANNET;

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
      behandlingID,
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

    const pdfDokumenter = [{
      navn: 'Forhåndsvis brev',
      type: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
      data,
    }];

    const visTekstFelt = begrunnelseKode === MKV.Koder.begrunnelser.henleggelsesgrunner.ANNET;
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
            koder={MKV.KTObjects.begrunnelser.henleggelsesgrunner}
            disableForsteValg={erBegrunnelseValgt()}
            redigerbar={redigerbart}
          />
          {
            visTekstFelt && <Nav.Textarea feil={feilmeldingFritekst} label="Fritekst" onChange={this.fritekstOnchange} value={fritekst} />
          }
          {
            redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={this.vedKlikkLenke} />
          }
          <Knapperad
            bekreft={vedKlikkHenlegg}
            bekreftTekst="HENLEGG SAKEN"
            bekreftRedigerbart={erBegrunnelseValgt()}
            avbryt={avbryt}
            avbrytTekst="AVBRYT"
            redigerbart={redigerbart}
          />
        </div>
      </Nav.Modal>
    );
  }
}

DialogboksHenleggSak.propTypes = {
  henleggHandle: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  ariaHideApp: PT.bool,
};

DialogboksHenleggSak.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
});

export default connect(mapStateToProps, null)(DialogboksHenleggSak);
