import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../../utils';
import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import { konverterTilStegData, hentFaktaVerdi } from '../../../../../regler/avklartefakta';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import { KodeTermSelect } from '../../../../../felleskomponenter/ui/kodeTermSelect';

import { lovvalgsperioderSelectors } from '../../../../../ducks/lovvalgsperioder';
import { redigerbartSelectors } from '../../../../../ducks/redigerbart';
import { soknadOperations } from '../../../../../ducks/soknad';

import * as Api from '../../../../../services/api';

import './vurderingEndrePeriode.css';

export class VurderingEndrePeriode extends React.Component {
  state = {
    nyTomDato: '',
    nyTomDatoFeilmelding: undefined,
    begrunnelse: hentFaktaVerdi(this.props.tilstand.aarsakEndringPeriodeAvklartfakta) || '',
    begrunnelseFeilmelding: undefined,
    fritekst: null,
    opprinneligLovvalgsperiode: { fom: undefined, tom: undefined },
  };

  componentDidMount() {
    const {
      behandlingID, redigerbart, lovvalgsPeriode, oppdaterData, tilstand: { aarsakEndringPeriodeAvklartfakta },
    } = this.props;

    oppdaterData(konverterTilStegData(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE, aarsakEndringPeriodeAvklartfakta));

    this.hentOpprinneligPeriode(behandlingID);

    if (!redigerbart) this.settSluttDato(lovvalgsPeriode.tomDato);
  }

  settSluttDato = nyTomDato => this.setState({ nyTomDato: Utils.dato.formatterDatoTilNorsk(nyTomDato) });

  hentOpprinneligPeriode = async behandlingID => {
    const opprinneligLovvalgsperiode = await Api.Lovvalgsperioder.hentOpprinnelig(behandlingID).catch(Utils.logger.error);
    this.setState(opprinneligLovvalgsperiode);
  };

  vedTomDatoEndring = event => {
    this.setState({ nyTomDato: event.target.value, nyTomDatoFeilmelding: undefined });
  };

  lagrePeriodeForForhandsvisning = () => {
    if (this.validerTomDatoOgPeriode()) {
      const { nyTomDato, opprinneligLovvalgsperiode: { fom } } = this.state;

      this.props.endreDatoOgSendLovvalgsperioderHandler(fom, Utils.dato.formatterDatoTilISO(nyTomDato));
    }
  };

  validerTomDatoOgPeriode = () => this.validerTomDato() && this.validerPeriode();

  erTomDatoGyldig = () => Utils.dato.vaskInputDato(this.state.nyTomDato);

  validerTomDato = () => {
    const tomDatoGyldig = this.erTomDatoGyldig();
    if (!tomDatoGyldig) this.setState({ nyTomDatoFeilmelding: { feilmelding: 'Ugyldig dato' } });
    return tomDatoGyldig;
  };

  erBegrunnelseGyldig = () => this.state.begrunnelse;

  validerBegrunnelse = () => {
    const begrunnelseGyldig = this.erBegrunnelseGyldig();
    if (!begrunnelseGyldig) this.setState({ begrunnelseFeilmelding: { feilmelding: 'Ugyldig begrunnelse' } });
    return begrunnelseGyldig;
  };

  erPeriodeGyldig = () => {
    const { nyTomDato } = this.state;
    const { fom, tom } = this.state.opprinneligLovvalgsperiode;
    const nyTomDatoISO = Utils.dato.formatterDatoTilISO(nyTomDato);
    return Utils.dato.erIPeriode(fom, tom, nyTomDatoISO);
  };

  validerPeriode = () => {
    const periodeGyldig = this.erPeriodeGyldig();
    if (!periodeGyldig) this.setState({ nyTomDatoFeilmelding: { feilmelding: 'Ugyldig periode' } });
    return periodeGyldig;
  };

  vedBegrunnelseEndring = event => {
    this.setState({ begrunnelse: event.target.value, begrunnelseFeilmelding: undefined });
  };

  vedKlikkEndrePeriode = async () => {
    const { vedtaEndretPeriode, tilForsiden } = this.props;
    const { sendEndretLovvalgsPeriode, validerAlt } = this;
    const { begrunnelse } = this.state;

    if (validerAlt()) {
      await sendEndretLovvalgsPeriode();
      await vedtaEndretPeriode(begrunnelse);
      tilForsiden();
    }
  };

  sendEndretLovvalgsPeriode = async () => {
    const { nyTomDato, opprinneligLovvalgsperiode: { fom } } = this.state;

    this.props.endreDatoOgSendLovvalgsperioderHandler(fom, Utils.dato.formatterDatoTilISO(nyTomDato));
  };

  validerAlt = () => this.validerTomDato() && this.validerPeriode() && this.validerBegrunnelse();

  vedKlikkPdf = async () => this.validerAlt();

  render() {
    const {
      behandlingID, redigerbart, tilstand: { aarsakEndringPeriodeAvklartfakta },
    } = this.props;

    const {
      vedTomDatoEndring,
      vedBegrunnelseEndring,
      vedKlikkEndrePeriode,
      vedKlikkPdf,
      lagrePeriodeForForhandsvisning,
    } = this;

    const {
      nyTomDato,
      nyTomDatoFeilmelding,
      begrunnelse,
      begrunnelseFeilmelding,
      fritekst,
      opprinneligLovvalgsperiode: { fom, tom },
    } = this.state;

    const endretPeriodeBegrunnelse = hentFaktaVerdi(aarsakEndringPeriodeAvklartfakta);

    const dokumenter = [
      {
        navn: 'Forhåndsvis vedtaksbrev',
        type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        data: {
          mottaker: MKV.Koder.aktoersroller.BRUKER,
          fritekst,
          begrunnelseKode: endretPeriodeBegrunnelse,
        },
      },
      {
        navn: 'Forhåndsvis A1',
        type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
        data: {
          mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
          fritekst,
          begrunnelseKode: endretPeriodeBegrunnelse,
        },
      },
    ];

    const formattertOpprinneligFom = Utils.dato.formatterDatoTilNorsk(fom);
    const formattertOpprinneligTom = Utils.dato.formatterDatoTilNorsk(tom);

    return (
      <div className="vurderingEndrePeriode">
        <Nav.Undertittel>Endre lovvalgsperiode</Nav.Undertittel>
        <Nav.Element className="mindreTittel">Opprinnelig lovvalgsperiode</Nav.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Normaltekst>Fra {formattertOpprinneligFom}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Normaltekst>Til {formattertOpprinneligTom}</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Element className="mindreTittel">Ny lovvalgsperiode</Nav.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Input
              bredde="fullbredde"
              label="Startdato"
              value={formattertOpprinneligFom}
              disabled
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Input
              bredde="fullbredde"
              label="Sluttdato"
              onChange={vedTomDatoEndring}
              onBlur={lagrePeriodeForForhandsvisning}
              value={nyTomDato}
              feil={nyTomDatoFeilmelding}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <KodeTermSelect
              feil={begrunnelseFeilmelding}
              koder={MKV.KTObjects.begrunnelser.endretperiode}
              label="Begrunnelse"
              value={begrunnelse}
              onChange={vedBegrunnelseEndring}
              redigerbart={redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} vedKlikk={vedKlikkPdf} />}
        <Nav.Hovedknapp disabled={!redigerbart} onClick={vedKlikkEndrePeriode} >Fatt vedtak</Nav.Hovedknapp>
      </div>
    );
  }
}

VurderingEndrePeriode.propTypes = {
  behandlingID: PT.number.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  endreDatoOgSendLovvalgsperioderHandler: PT.func.isRequired,
  fomDato: PT.string,
  tilForsiden: PT.func.isRequired,
  vedtaEndretPeriode: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    aarsakEndringPeriodeAvklartfakta: MPT.Avklartefakta.isRequired,
  }).isRequired,
};

VurderingEndrePeriode.defaultProps = {
  fomDato: '',
};

const mapStateToProps = state => ({
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  redigerbart: redigerbartSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(soknadOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingEndrePeriode);
