import React, { Fragment, useEffect } from 'react';
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

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { behandlingsresultatSelectors } from '../../../ducks/behandlingsresultat';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../../../ducks/lovvalgsperioder';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';
import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { formOperations } from '../../../ducks/form';

import PdfLenkeListe from '../../pdfLenkeListe';
import { MottakerinstitusjonvelgerFlervalg } from '../../mottakerinstitusjonvelger';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../yup';
import { lagLovvalgsbestemmelse, konverterLovvalgsbestemmelseTilStegData } from '../../../regler/lovvalgsbestemmelser';
import { lagLovvalgsperiode } from '../../../regler/lovvalgsperiode';
import { lagTilleggBestemmelse, slettTilleggBestemmelse } from '../../../regler/tilleggbestemmelser';

import './vurderingArbeidEttLandOvrigVedtak.css';

export const VurderingArbeidEttLandOvrigVedtak = ({
  redigerbart,
  behandlingID,
  lovvalgsperiode,
  formIsValid,
  formValues,
  form,
  handleSubmit,
  touchAll,
  endreLovvalgsPeriode,
  lagreLovvalgsperioder,
  byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  behandlingstype,
  lovvalgsbestemmelseSomSkalVises,
  lovvalgsbestemmelseSomSkalLagres,
  oppdaterData,
  slettData,
  behandlingsgrunnlagFom,
  behandlingsgrunnlagTom,
}) => {
  useEffect(() => {
    if (lovvalgsbestemmelseSomSkalLagres) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelseSomSkalLagres));
    }

    if (redigerbart) {
      oppdaterData(lagLovvalgsperiode({
        fomDato: behandlingsgrunnlagFom,
        tomDato: behandlingsgrunnlagTom,
      }));
    }

    return () => {
      slettData();
    };
  }, []);

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
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
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
      navn: 'Forhåndsvis SED A010',
      type: EKV.Koder.sedtyper.A010,
      erSed: true,
      data: {
        fritekst: formValues.fritekstSed,
      },
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);

  const lovvalgsbestemmelseTerm = KV.kodeTilTerm(lovvalgsbestemmelseSomSkalVises, MKV.Kodekombinasjoner.alleLovvalg);
  const overskrift = `Omfattet av norsk lovgivning etter ${lovvalgsbestemmelseTerm || '...'}`;

  const valgbareLovvalgsbestemmelser = [
    ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.filter(({ kode }) => (
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B
    )),
    ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.filter(({ kode }) => (
      kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
    )),
  ];

  useEffect(() => {
    if (formValues.lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5) {
      oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A));
      oppdaterData(lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5));
    } else if (formValues.lovvalgsbestemmelse) {
      oppdaterData(lagLovvalgsbestemmelse(formValues.lovvalgsbestemmelse));
      slettData(slettTilleggBestemmelse());
    }
  }, [formValues.lovvalgsbestemmelse]);

  return (
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      <Nav.Row className="velgLovvalgsbestemmelse">
        <Nav.Column xs="7">
          <Skjema.Select
            label="Velg en lovvalgsbestemmelse"
            feltNavn="lovvalgsbestemmelse"
            disabled={!redigerbart}
          >
            {
              valgbareLovvalgsbestemmelser.map(bestemmelse => <option key={bestemmelse.kode} value={bestemmelse.kode}>{bestemmelse.term}</option>)
            }
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
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
      {
        redigerbart &&
        <Nav.Row className="fritekstSed">
          <Nav.Column xs="8">
            <Skjema.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              feltNavn="fritekstSed"
              disabled={!redigerbart}
              visTellerFra={500}
              maxLength={500}
            />
          </Nav.Column>
        </Nav.Row>
      }
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

VurderingArbeidEttLandOvrigVedtak.propTypes = {
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
  lovvalgsbestemmelseSomSkalVises: PT.string,
  lovvalgsbestemmelseSomSkalLagres: PT.string,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  behandlingsgrunnlagFom: PT.string.isRequired,
  behandlingsgrunnlagTom: PT.string.isRequired,
};

VurderingArbeidEttLandOvrigVedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
  lovvalgsbestemmelseSomSkalVises: '',
  lovvalgsbestemmelseSomSkalLagres: '',
};

const mapStateToProps = (state, ownProps) => {
  const forkortLovvalgsperiode = ownProps.redigerbart ?
    false
    :
    Utils.dato.datoDiffPure(
      behandlingsgrunnlagSelectors.PeriodeSelector(state).tom,
      lovvalgsperioderSelectors.TomDatoSelector(state),
      'days'
    ) !== 0;

  return ({
    behandlingsgrunnlagFom: behandlingsgrunnlagSelectors.PeriodeFomSelector(state),
    behandlingsgrunnlagTom: behandlingsgrunnlagSelectors.PeriodeTomSelector(state),
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
    formIsValid: isValid(KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: ownProps.redigerbart ? '' : Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
      fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
      vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
      vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
      vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      mottakerinstitusjoner: avklartefaktaSelectors.IkkeMarginaleArbeidslandKTSelector(state) || [],
      lovvalgsbestemmelse: ownProps.lovvalgsbestemmelseSomSkalVises,
      fritekstSed: '',
    },
  });
};

const mapDispatchToProps = dispatch => ({
  endreLovvalgsPeriode: (fomdato, tomdato) => dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK)),
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

const VurderingArbeidEttLandOvrigVedtakForm = reduxForm({
  onSubmit: fattVedtak,
  form: KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => lagYupToReduxformErrorMapper(YupSkjemaer.arbeid_ett_land_ovrig_vedtak, {
    context: {
      lovvalgsperiode: props.lovvalgsperiode,
      behandlingstype: props.behandlingstype,
    },
  })(values),
})(VurderingArbeidEttLandOvrigVedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArbeidEttLandOvrigVedtakForm);
