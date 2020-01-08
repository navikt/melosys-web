import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid, reduxForm } from 'redux-form';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../../../melosyskodeverk';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';
import * as Utils from '../../../../../utils';

import { soknadSelectors } from '../../../../../ducks/soknad';
import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../../../ducks/lovvalgsperioder';
import { behandlingsresultatSelectors } from '../../../../../ducks/behandlingsresultat';
import { vilkarSelectors } from '../../../../../ducks/vilkar';
import { vedtakSelectors } from '../../../../../ducks/vedtak';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';
import VedtaktypeSkjema from '../../vedtaktypeskjema';
import VedtaketypeBegrunnelseSkjema from '../../vedtaktypebegrunnelseskjema';
import Mottakerinstitusjonvelger from '../../../../../felleskomponenter/mottakerinstitusjonvelger';

import './vurderingVedtak.css';

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
];

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
  artikkel12ErOppfylt,
  vedtakLastes,
}) => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)

  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgsbestemmelse,
  } = lovvalget;

  const antallManederMenneskelig = Utils.dato.datoDiffMenneskelig(fomDato, tomDato);
  const antallMaaneder = Math.ceil(Utils.dato.datoDiff(fomDato, tomDato, 'months'));
  const periodeErOver24mnd = antallMaaneder > 24;
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, alleLovvalg);
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const fattVedtakDisabled = !redigerbart || periodeErOver24mnd;

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev og A1',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  const visSedLenkeForLovvalgsbestemmelser = [
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
  ];

  if (lovvalgSomKodeTerm &&
      visSedLenkeForLovvalgsbestemmelser.includes(lovvalgSomKodeTerm.kode) &&
      !erNyVurdering) {
    pdfDokumenter.push({
      navn: 'Orienteringsbrev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    });
  }

  if (formValues.kreverMottakerinstitusjon) {
    pdfDokumenter.push({ navn: 'Forhåndsvis SED A009', type: EKV.Koder.sedtyper.A009, erSed: true });
  }

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
      mottakerinstitusjon: formValues.mottakerinstitusjon,
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
        <Nav.Row className="vedtak__oppsummering">
          <Nav.Column xs="6">
            <Nav.typo.Element type="element">Antall måneder i utlandet</Nav.typo.Element>
            <Nav.typo.Normaltekst>{antallManederMenneskelig}</Nav.typo.Normaltekst>
            {
              artikkel12ErOppfylt && periodeErOver24mnd &&
              <Nav.AlertStripeAdvarsel className="periode__advarsel">Perioden er over 24 måneder.</Nav.AlertStripeAdvarsel>
            }
          </Nav.Column>
        </Nav.Row>
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
  artikkel12ErOppfylt: PT.bool.isRequired,
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
};

VurderingVedtak.defaultProps = {
  lovvalgsland: '',
  formValues: {},
};

const mapStateToProps = state => ({
  artikkel12ErOppfylt: vilkarSelectors.Artikkel12OppfyltSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  soknadsland: soknadSelectors.SoknadslandSelector(state),
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
