import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid, reduxForm } from 'redux-form';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as Validering from '../../skjema/validering';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';

import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';
import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';
import { behandlingsresultatSelectors } from '../../../ducks/behandlingsresultat';
import { vedtakSelectors } from '../../../ducks/vedtak';

import PdfLenkeListe from '../../pdfLenkeListe';
import DatoOmrade from '../../datoOmrade/datoOmrade';
import VedtaktypeSkjema from '../../../sider/saksbehandling/komponenter/vedtaktypeskjema';
import VedtaketypeBegrunnelseSkjema from '../../../sider/saksbehandling/komponenter/vedtaktypebegrunnelseskjema';
import Mottakerinstitusjonvelger from '../../mottakerinstitusjonvelger';

import './vurderingVedtak.css';

const VurderingVedtak = ({
  lovvalgsperioder,
  soknadsland,
  redigerbart,
  behandlingID,
  lagreOgFatteVedtak,
  behandlingstype,
  touch,
  formIsValid,
  formValues,
  form,
  vedtakLastes,
  visAntallManederUtland,
  pdfDokumenter,
}) => {
  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgsbestemmelse,
  } = lovvalget;

  const antallManederMenneskelig = Utils.dato.datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, MKV.Kodekombinasjoner.alleLovvalg);
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const fattVedtakDisabled = !redigerbart;

  const validerForm = () => {
    touch('tomDato');
    touch('vedtakstype');
    touch('vedtakstypebegrunnelse');
    touch('mottakerinstitusjon');
    return formIsValid;
  };

  const fattVedtak = () => {
    if (!validerForm()) return;

    lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      mottakerinstitusjoner: [formValues.mottakerinstitusjon],
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: formValues.vedtakstypebegrunnelse,
    });
  };

  return (
    <div className="vedtak">
      <Nav.typo.Undertittel>Omfattet av norsk trygdelovgivning etter { KV.objektTilTerm(lovvalgSomKodeTerm) }</Nav.typo.Undertittel>
      <div>
        <Nav.Row className="lovvalgsperiode">
          <Nav.Column xs="6">
            <DatoOmrade periode={{ fom: lovvalget.fomDato, tom: lovvalget.tomDato }} label="Lovvalgsperiode" />
          </Nav.Column>
        </Nav.Row>
        {
          visAntallManederUtland &&
          <Nav.Row className="vedtak__oppsummering">
            <Nav.Column xs="6">
              <Nav.typo.Element type="element">Antall måneder i utlandet</Nav.typo.Element>
              <Nav.typo.Normaltekst>{antallManederMenneskelig}</Nav.typo.Normaltekst>
            </Nav.Column>
          </Nav.Row>
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
          <Nav.Column xs="12">
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
        <Nav.Row className="mottakerinstitusjoner">
          <Nav.Column xs="7">
            <Mottakerinstitusjonvelger
              form={form}
              redigerbart={redigerbart}
              landkode={soknadsland[0]}
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_04}
              data_cy="mottakerinstitusjoner"
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Hovedknapp spinner={vedtakLastes} disabled={fattVedtakDisabled} onClick={fattVedtak}>Fatt vedtak</Nav.Hovedknapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  lagreOgFatteVedtak: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  soknadsland: PT.arrayOf(PT.string).isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
  behandlingstype: PT.string.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  form: PT.string.isRequired,
  vedtakLastes: PT.bool.isRequired,
  visAntallManederUtland: PT.bool,
  pdfDokumenter: MPT.DokumentMetadataListe.isRequired,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: '',
  formValues: {},
  visAntallManederUtland: true,
};

const mapStateToProps = state => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
  vedtakLastes: vedtakSelectors.ErPendingSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_12_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_12_VEDTAK)(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    mottakerinstitusjon: '',
    kreverMottakerinstitusjon: false,
  },
});

const VurderingVedtakForm = reduxForm({
  form: KV.Form.ARTIKKEL_12_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.artikkel12_vedtak, {
    context: {
      behandlingstype: props.behandlingstype,
    },
  })(values),
})(VurderingVedtak);

export default connect(mapStateToProps)(VurderingVedtakForm);
