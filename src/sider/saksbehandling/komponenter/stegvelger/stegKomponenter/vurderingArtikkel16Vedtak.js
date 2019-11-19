import React, { Fragment, useCallback } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';
import * as KV from '../../../../../kodeverk';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';

import Begrunnelser from '../../begrunnelser';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';
import VedtaktypeSkjema from '../../vedtaktypeskjema';
import VedtaketypeBegrunnelseSkjema from '../../vedtaktypebegrunnelseskjema';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { behandlingsresultatSelectors } from '../../../../../ducks/behandlingsresultat';
import { anmodningsperioderSelectors } from '../../../../../ducks/anmodningsperioder';
import { anmodningsperiodesvarSelectors } from '../../../../../ducks/anmodningsperiodesvar';
import { vilkarSelectors } from '../../../../../ducks/vilkar';

import useEventTargetValueState from '../../../../../hooks/useEventTargetValueState';

import './vurderingArtikkel16Vedtak.css';

export const VurderingArtikkel16VedtakBegrunnelser = ({
  art12_1_begrunnelser,
  art12_2_begrunnelser,
  vilkarBegrunnelser,
}) => {
  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  return (
    <Fragment>
      {
        art12_1_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 1."
          valgteBegrunnelser={[...art12_1_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.art12_1_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      }
      { art12_2_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 2."
          valgteBegrunnelser={[...art12_2_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.art12_2_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      }
      <Begrunnelser
        label="Søkeren fyller ikke kriteriene for artikkel 16 nr. 1."
        fritekst="Utenlandske trygdemyndigheter har avslått anmodningen om unntak"
      />
    </Fragment>
  );
};

VurderingArtikkel16VedtakBegrunnelser.propTypes = {
  art12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
};

export const Innvilgelse = ({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  renderFritekstFelt,
  vedtaksbrevFritekst,
}) => {
  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev og A1',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        fritekst: vedtaksbrevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1.</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          { renderFritekstFelt() }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

Innvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  vedtaksbrevFritekst: PT.string.isRequired,
  renderFritekstFelt: PT.func.isRequired,
};

export const DelvisInnvilgelse = ({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  renderBegrunnelser,
}) => {
  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev og A1',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        fritekst: vedtaksbrevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1. i deler av søknadsperioden</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          { renderBegrunnelser() }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          { renderFritekstFelt() }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

DelvisInnvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  vedtaksbrevFritekst: PT.string.isRequired,
  renderFritekstFelt: PT.func.isRequired,
  renderBegrunnelser: PT.func.isRequired,
};

export const Avslag = ({
  redigerbart,
  behandlingID,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  renderBegrunnelser,
}) => {
  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
      data: {
        fritekst: vedtaksbrevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Avslag</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          { renderBegrunnelser() }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          { renderFritekstFelt() }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

Avslag.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  vedtaksbrevFritekst: PT.string.isRequired,
  renderFritekstFelt: PT.func.isRequired,
  renderBegrunnelser: PT.func.isRequired,
};

export const VurderingArtikkel16Vedtak = ({
  lagreOgFatteVedtak,
  redigerbart,
  behandlingID,
  anmodningsperiodesvar,
  anmodningsperiode,
  art_12_1_begrunnelser,
  art_12_2_begrunnelser,
  formIsValid,
  formValues,
  vilkarBegrunnelser,
  behandlingstype,
  touch,
  lagretFritekst,
}) => {
  const [vedtaksbrevFritekst, setVedtaksbrevFritekst] = useEventTargetValueState(lagretFritekst || '');

  const { anmodningsperiodeSvarType, endretPeriode } = anmodningsperiodesvar;

  const validerForm = () => {
    touch('vedtakstype');
    touch('vedtakstypebegrunnelse');
    return formIsValid;
  };

  const vedKlikk = () => {
    if (!validerForm()) return;

    lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: vedtaksbrevFritekst,
      mottakerinstitusjon: null,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: formValues.vedtakstypebegrunnelse,
    });
  };

  const renderBegrunnelser = useCallback(() => (
    <VurderingArtikkel16VedtakBegrunnelser
      art12_1_begrunnelser={art_12_1_begrunnelser}
      art12_2_begrunnelser={art_12_2_begrunnelser}
      vilkarBegrunnelser={vilkarBegrunnelser}
    />
  ), [
    art_12_1_begrunnelser,
    art_12_2_begrunnelser,
    vilkarBegrunnelser,
  ]);

  const renderFritekstFelt = useCallback(() => (
    <Nav.Textarea
      label="Fritekst til vedtaksbrev"
      placeholder="Skriv inn tekst til vedtaksbrevet..."
      value={vedtaksbrevFritekst}
      onChange={setVedtaksbrevFritekst}
      maxLength={500}
      disabled={!redigerbart}
    />
  ), [
    vedtaksbrevFritekst,
    redigerbart,
  ]);

  const finnVedtakInnhold = svarType => {
    switch (svarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return <Innvilgelse
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          renderFritekstFelt={renderFritekstFelt}
          vedtaksbrevFritekst={vedtaksbrevFritekst}
          gjeldendePeriode={{ fom: anmodningsperiode.fomDato, tom: anmodningsperiode.tomDato }}
        />;
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        return <DelvisInnvilgelse
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          renderFritekstFelt={renderFritekstFelt}
          vedtaksbrevFritekst={vedtaksbrevFritekst}
          gjeldendePeriode={endretPeriode}
          renderBegrunnelser={renderBegrunnelser}
        />;
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        return <Avslag
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          renderFritekstFelt={renderFritekstFelt}
          vedtaksbrevFritekst={vedtaksbrevFritekst}
          renderBegrunnelser={renderBegrunnelser}
        />;
      default:
        throw new Error('AnmodningsperiodeSvarType må være satt');
    }
  };

  const vedtakInnhold = finnVedtakInnhold(anmodningsperiodeSvarType);

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  return (
    <Fragment>
      { vedtakInnhold }
      <Nav.Row>
        <Nav.Column xs="7" className="fane__fot">
          {
            erNyVurdering &&
            <Nav.Row className="vedtakstype">
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
          <Nav.Hovedknapp disabled={!redigerbart} onClick={vedKlikk}>FATT VEDTAK</Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16Vedtak.propTypes = {
  anmodningsperiode: MPT.Periode.isRequired,
  anmodningsperiodesvar: PT.object,
  behandlingID: PT.number.isRequired,
  behandlingstype: PT.string.isRequired,
  formIsValid: PT.bool.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  lagretFritekst: PT.string,
  redigerbart: PT.bool.isRequired,
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
  art_12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art_12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
  touch: PT.func.isRequired,
  formValues: PT.object,
};

VurderingArtikkel16Vedtak.defaultProps = {
  formValues: {},
  anmodningsperiodesvar: {},
  lagretFritekst: '',
};

const VurderingArtikkel16VedtakForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_1_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.artikkel16_vedtak, {
    context: {
      behandlingstype: props.behandlingstype,
    },
  })(values),
})(VurderingArtikkel16Vedtak);

const mapStateToProps = state => ({
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lagretFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
  anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
  vilkarBegrunnelser: vilkarSelectors.vilkarBegrunnelserSelector(state),
  art_12_1_begrunnelser: vilkarSelectors.art12_1_begrunnelserSelector(state),
  art_12_2_begrunnelser: vilkarSelectors.art12_2_begrunnelserSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_16_1_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_16_1_VEDTAK)(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  },
});

export default connect(mapStateToProps)(VurderingArtikkel16VedtakForm);
