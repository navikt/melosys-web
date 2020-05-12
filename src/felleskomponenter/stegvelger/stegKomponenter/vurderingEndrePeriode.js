import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as EKV from 'eessi-kodeverk';
import * as UfiltrertMKV from 'melosys-kodeverk';

import MKV from '../../../melosyskodeverk';

import * as Utils from '../../../utils';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';

import { konverterTilStegData, hentFaktaVerdi } from '../../../regler/avklartefakta';

import PdfLenkeListe from '../../pdfLenkeListe';
import * as Mui from '../../ui';

import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';
import { redigerbartSelectors } from '../../../ducks/redigerbart';
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import * as Api from '../../../services/api';

import './vurderingEndrePeriode.css';

export class VurderingEndrePeriode extends React.Component {
  state = {
    nyTomDato: '',
    nyTomDatoFeilmelding: undefined,
    begrunnelse: '',
    begrunnelseFeilmelding: undefined,
    opprinneligLovvalgsperiode: { fom: undefined, tom: undefined },
    erEessiReady: false,
    fritekstSed: '',
  };

  componentDidMount() {
    const {
      behandlingID, redigerbart, lovvalgsPeriode, oppdaterData, tilstand: { aarsakEndringPeriodeAvklartfakta }, soknadsland,
    } = this.props;

    oppdaterData(konverterTilStegData(MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE, aarsakEndringPeriodeAvklartfakta));

    this.hentOpprinneligPeriode(behandlingID);

    if (!redigerbart) this.settSluttDato(lovvalgsPeriode.tomDato);
    this.setErEessiReady(soknadsland[0]);

    this.initialiserBegrunnelseState();
  }

  setErEessiReady = async landkode => this.setState({
    erEessiReady: (await Api.Eessi.mottakerinstitusjoner.hent(EKV.Koder.buctyper.legislation.LA_BUC_04, landkode)).length > 0,
  });

  settSluttDato = nyTomDato => this.setState({ nyTomDato: Utils.dato.formatterDatoTilNorsk(nyTomDato) });

  initialiserBegrunnelseState = () => {
    let begrunnelse = hentFaktaVerdi(this.props.tilstand.aarsakEndringPeriodeAvklartfakta) || '';

    if (begrunnelse === UfiltrertMKV.Koder.begrunnelser.endretperiode.ENDRINGER_ARBEIDSSITUASJON) {
      begrunnelse = KV.kodeTilTerm(begrunnelse, UfiltrertMKV.KTObjects.begrunnelser.endretperiode);
    }

    this.setState({ begrunnelse });
  };

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
    const { endreVedtak, tilForsiden } = this.props;
    const { sendEndretLovvalgsPeriode, validerAlt } = this;
    const { begrunnelse, fritekstSed } = this.state;

    if (validerAlt()) {
      await sendEndretLovvalgsPeriode();

      const data = {
        begrunnelseKode: begrunnelse,
        fritekst: null,
        fritekstSed,
      };
      await endreVedtak(data);
      tilForsiden();
    }
  };

  sendEndretLovvalgsPeriode = async () => {
    const { nyTomDato, opprinneligLovvalgsperiode: { fom } } = this.state;

    this.props.endreDatoOgSendLovvalgsperioderHandler(fom, Utils.dato.formatterDatoTilISO(nyTomDato));
  };

  validerAlt = () => {
    const validPeriode = this.validerPeriode();
    const validDato = this.validerTomDato();
    const validBegrunnelse = this.validerBegrunnelse();

    return validPeriode && validDato && validBegrunnelse;
  };

  vedKlikkPdf = async () => this.validerAlt();

  render() {
    const {
      behandlingID, redigerbart,
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
      opprinneligLovvalgsperiode: { fom, tom },
      erEessiReady,
      fritekstSed,
    } = this.state;

    const endretPeriodeBegrunnelse = begrunnelse;

    const pdfDokumenter = [
      {
        navn: 'Forhåndsvis vedtaksbrev',
        type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        data: {
          mottaker: MKV.Koder.aktoersroller.BRUKER,
          fritekst: null,
          begrunnelseKode: endretPeriodeBegrunnelse,
        },
      },
    ];

    if (!erEessiReady) {
      pdfDokumenter.push({
        navn: 'Forhåndsvis A1',
        type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
        data: {
          mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
          begrunnelseKode: endretPeriodeBegrunnelse,
        },
      });
    }

    const formattertOpprinneligFom = Utils.dato.formatterDatoTilNorsk(fom);
    const formattertOpprinneligTom = Utils.dato.formatterDatoTilNorsk(tom);

    return (
      <div className="vurderingEndrePeriode">
        <Nav.typo.Undertittel>Endre lovvalgsperiode</Nav.typo.Undertittel>
        <Nav.typo.Element className="mindreTittel">Opprinnelig lovvalgsperiode</Nav.typo.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.typo.Normaltekst>Fra {formattertOpprinneligFom}</Nav.typo.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.typo.Normaltekst>Til {formattertOpprinneligTom}</Nav.typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.typo.Element className="mindreTittel">Ny lovvalgsperiode</Nav.typo.Element>
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
            <Mui.KodeTermSelect
              feil={begrunnelseFeilmelding}
              koder={MKV.KTObjects.begrunnelser.endretperiode}
              label="Begrunnelse"
              value={begrunnelse}
              onChange={vedBegrunnelseEndring}
              redigerbart={redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {
        /**
         * Skjuler fritekstfelt inntil fritekst for endret periode støttes i brev.
         * TODO: Vise når brev er klar.
         */
        /* <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Textarea
              label="Fritekst til vedtaksbrev"
              placeholder="Skriv inn tekst til vedtaksbrevet..."
              value={vedtaksbrevFritekst}
              onChange={settVedtaksbrevFritekst}
              maxLength={500}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row> */}
        {
          redigerbart &&
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="6">
              <Nav.Textarea
                label="Ytterligere informasjon til SED (valgfri)"
                value={fritekstSed}
                onChange={e => this.setState({ fritekstSed: e.target.value })}
                disabled={!redigerbart}
                maxLength={500}
              />
            </Nav.Column>
          </Nav.Row>
        }
        {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkPdf} />}
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
  endreVedtak: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    aarsakEndringPeriodeAvklartfakta: MPT.Avklartefakta.isRequired,
  }).isRequired,
  soknadsland: PT.arrayOf(PT.string).isRequired,
};

VurderingEndrePeriode.defaultProps = {
  fomDato: '',
};

const mapStateToProps = state => ({
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  redigerbart: redigerbartSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingEndrePeriode);
