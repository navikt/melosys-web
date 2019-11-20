import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as Utils from '../../../../../utils';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';
import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as KV from '../../../../../kodeverk';
import * as MPT from '../../../../../proptypes';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import VedtaktypeSkjema from '../../vedtaktypeskjema';
import VedtaketypeBegrunnelseSkjema from '../../vedtaktypebegrunnelseskjema';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { behandlingsresultatSelectors } from '../../../../../ducks/behandlingsresultat';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../../../../../ducks/lovvalgsperioder';
import { redigerbartSelectors } from '../../../../../ducks/redigerbart';
import { soknadSelectors } from '../../../../../ducks/soknad';

import './vurderingArtikkel13_1_vedtak.css';

export const VurderingArtikkel13_1_Vedtak = ({
  redigerbart,
  behandlingID,
  lovvalgsperiode,
  lagreOgFatteVedtak,
  formIsValid,
  formValues,
  touch,
  endreLovvalgsPeriode,
  tilstand: { overskrift },
  lagreLovvalgsperioder,
  byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  behandlingstype,
}) => {
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const vedCheck = e => {
    if (!e.target.checked) {
      gjenopprettOpprinneligLovvalgsperiode();
    }
  };

  const validerForm = () => {
    touch('tomDato');
    touch('vedtakstype');
    touch('vedtakstypebegrunnelse');
    return formIsValid;
  };

  const forkortLovvalgsperiode = () => endreLovvalgsPeriode(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));

  const vedKlikkVedtak = async () => {
    if (!validerForm()) return;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      mottakerinstitusjon: null,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: formValues.vedtakstypebegrunnelse,
    });
  };

  const vedKlikkForhandsvis = async () => {
    if (!validerForm()) return false;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    lagreLovvalgsperioder();

    return true;
  };

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV_FLERE_LAND,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
    {
      navn: 'Forhåndsvis A1',
      type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
      data: {
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
      },
    },
    {
      navn: 'Forhåndsvis SED A003',
      type: EKV.Koder.sedtyper.A003,
      erSed: true,
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);

  return (
    <Fragment>
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      {
        redigerbart &&
        <Fragment>
          <Nav.typo.Element className="undertittel">Lovvalgsperiode</Nav.typo.Element>
          <Nav.Row className="lovvalgsperiode">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
      <Nav.Row className="forkortLovvalgsperiode">
        <Nav.Column xs="6">
          <Skjema.Checkbox feltNavn="forkortLovvalgsperiode" label="Lovvalgsperioden er avkortet." disabled={!redigerbart} onClick={vedCheck} />
        </Nav.Column>
      </Nav.Row>
      {
        formValues.forkortLovvalgsperiode &&
        <Fragment>
          <Nav.Row>
            <Nav.Column xs="3">
              <Skjema.Input
                bredde="fullbredde"
                label="Startdato"
                disabled
                feltNavn="fomDato"
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Skjema.Input
                bredde="fullbredde"
                label="Sluttdato"
                disabled={!redigerbart}
                feltNavn="tomDato"
                datoFelt
              />
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
      {
        erNyVurdering &&
        <Nav.Row>
          <Nav.Column xs="6">
            <VedtaktypeSkjema
              redigerbart={redigerbart}
            />
            <VedtaketypeBegrunnelseSkjema
              redigerbart={redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      }
      <Nav.Row className="fritekst">
        <Nav.Column xs="8">
          <Skjema.Textarea
            feltNavn="vedtaksbrevFritekst"
            label="Fritekst til vedtaksbrev"
            placeholder="Skriv inn tekst til vedtaksbrevet..."
            maxLength={500}
            visTellerFra={500}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikkVedtak} disabled={!redigerbart} type="hoved">FATT VEDTAK</Nav.Hovedknapp>
    </Fragment>
  );
};

VurderingArtikkel13_1_Vedtak.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: MPT.Periode,
  lagreOgFatteVedtak: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  byggLovvalgsperioder: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
};

VurderingArtikkel13_1_Vedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};

const mapStateToProps = (state, ownProps) => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_13_1_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_13_1_VEDTAK)(state),
  initialValues: {
    forkortLovvalgsperiode: Utils.dato.datoDiffPure(
      soknadSelectors.SoknadsperiodeSelector(state).tom,
      lovvalgsperioderSelectors.TomDatoSelector(state),
      'days'
    ) !== 0,
    tomDato: ownProps.redigerbart ? '' : Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
    fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
  },
});

const mapDispatchToProps = dispatch => ({
  endreLovvalgsPeriode: (fomdato, tomdato) => dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
});

const VurderingArtikkel13_1_vedtak_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_1_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.artikkel13_1_vedtak, {
    context: {
      lovvalgsperiode: props.lovvalgsperiode,
      behandlingstype: props.behandlingstype,
    },
  })(values),
})(VurderingArtikkel13_1_Vedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_1_vedtak_form);
