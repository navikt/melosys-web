import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';
import * as Mui from '../../ui';

import PdfLenkeListe from '../../pdfLenkeListe';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { behandlingsresultatSelectors } from '../../../ducks/behandlingsresultat';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../../../ducks/lovvalgsperioder';
import { redigerbartSelectors } from '../../../ducks/redigerbart';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';
import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { formOperations } from '../../../ducks/form';
import { MottakerinstitusjonvelgerFlervalg } from '../../mottakerinstitusjonvelger';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../yup';

import './vurderingArtikkel13_x_vedtak.css';

export const VurderingArtikkel13_x_vedtak = ({
  redigerbart,
  behandlingID,
  lovvalgsperiode,
  formIsValid,
  formValues,
  form,
  handleSubmit,
  touchAll,
  endreLovvalgsPeriode,
  tilstand: { overskrift },
  lagreLovvalgsperioder,
  byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  behandlingstype,
}) => {
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const forkortLovvalgsperiode = () => endreLovvalgsPeriode(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));

  const vedKlikkForhandsvis = async () => {
    if (!formIsValid) {
      touchAll();
      return false;
    }

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    lagreLovvalgsperioder();
    return formIsValid;
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
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      {
        redigerbart &&
        <Fragment>
          <Nav.typo.Element className="undertittel">Søknadsperiode</Nav.typo.Element>
          <Nav.Row className="lovvalgsperiode">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
      <Skjema.PeriodeForkorter
        redigerbart={redigerbart}
        checkboxClassName="forkortLovvalgsperiode"
        checkboxLabel="Lovvalget innvilges for en kortere periode"
        checkboxFeltnavn="forkortLovvalgsperiode"
        onUncheck={gjenopprettOpprinneligLovvalgsperiode}
        forkortPeriode={formValues.forkortLovvalgsperiode}
        fomLabel="Startdato"
        fomFeltNavn="fomDato"
        tomLabel="Sluttdato"
        tomFeltNavn="tomDato"
      />
      {
        erNyVurdering &&
        <Skjema.Vedtakstype redigerbart={redigerbart} />
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
        <Nav.Column xs="8">
          <MottakerinstitusjonvelgerFlervalg
            feltnavn="mottakerinstitusjoner"
            bucType={EKV.Koder.buctyper.legislation.LA_BUC_02}
            redigerbart={redigerbart}
            form={form}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />}
        </Nav.Column>
      </Nav.Row>
      <Mui.Knapp disabled={!redigerbart} htmlType="submit" type="hoved">FATT VEDTAK</Mui.Knapp>
    </form>
  );
};

VurderingArtikkel13_x_vedtak.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: MPT.Periode,
  lagreOgFatteVedtak: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touchAll: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  byggLovvalgsperioder: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
  form: PT.string.isRequired,
  handleSubmit: PT.func.isRequired,
};

VurderingArtikkel13_x_vedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};

const mapStateToProps = (state, ownProps) => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_13_X_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_13_X_VEDTAK)(state),
  initialValues: {
    forkortLovvalgsperiode: Utils.dato.datoDiffPure(
      behandlingsgrunnlagSelectors.PeriodeSelector(state).tom,
      lovvalgsperioderSelectors.TomDatoSelector(state),
      'days'
    ) !== 0,
    tomDato: ownProps.redigerbart ? '' : Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
    fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    mottakerinstitusjoner: avklartefaktaSelectors.IkkeMarginaleArbeidslandKTSelector(state) || [],
  },
});

const mapDispatchToProps = dispatch => ({
  endreLovvalgsPeriode: (fomdato, tomdato) => dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARTIKKEL_13_X_VEDTAK)),
});

const fattVedtak = async (values, dispatch, props) => {
  if (values.forkortLovvalgsperiode) {
    await props.endreLovvalgsPeriode(props.lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(values.tomDato));
  }

  props.lagreOgFatteVedtak({
    behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
    fritekst: values.vedtaksbrevFritekst,
    mottakerinstitusjoner: values.mottakerinstitusjoner.filter(inst => inst.kreverMottakerinstitusjon).map(inst => inst.id),
    vedtakstype: values.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    revurderBegrunnelse: values.vedtakstypebegrunnelse,
  });
};

const VurderingArtikkel13_x_vedtak_form = reduxForm({
  onSubmit: fattVedtak,
  form: KV.Form.ARTIKKEL_13_X_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: false,
  updateUnregisteredFields: true,
  validate: (values, props) => lagYupToReduxformErrorMapper(YupSkjemaer.artikkel13_x_vedtak, {
    context: {
      lovvalgsperiode: props.lovvalgsperiode,
      behandlingstype: props.behandlingstype,
    },
  })(values),
})(VurderingArtikkel13_x_vedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_x_vedtak_form);
