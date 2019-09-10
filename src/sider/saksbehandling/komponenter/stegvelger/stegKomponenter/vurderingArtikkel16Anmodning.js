/* eslint-disable react/no-multi-comp */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as MPT from '../../../../../proptypes';
import * as Utils from '../../../../../utils';
import * as KV from '../../../../../kodeverk';

import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';
import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { formSelectors } from '../../../../../ducks/form';
import { anmodningsperioderSelectors } from '../../../../../ducks/anmodningsperioder';
import { behandlingsperioderSelectors } from '../../../../../ducks/behandlingsperioder';

import { datoDiffMenneskelig, formatterDatoTilNorsk } from '../../../../../utils/dato';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import ListevelgerFlervalg from '../../../../../felleskomponenter/ui/listevelgerFlervalg';

import { konverterTilStegData, lagBegrunnelse } from '../../../../../regler/vilkar';
import { konverterLovvalgsbestemmelseTilStegData } from '../../../../../regler/lovvalgsbestemmelser';

import './vurderingArtikkel16Anmodning.css';

const uuid = require('uuid/v4');

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.forordning_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.forordning_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tillegg,
];

const TidligereMedlemPeriodeLinje = ({
  perm, onChange, checked, redigerbart, feil,
}) => {
  const { periodeID, periode } = perm;
  const label = `Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`;

  return (
    <Fragment>
      <Nav.Checkbox feil={feil} disabled={!redigerbart} onChange={() => onChange(periodeID)} label={label} value="something" checked={checked} />
    </Fragment>
  );
};

TidligereMedlemPeriodeLinje.propTypes = {
  checked: PT.bool.isRequired,
  index: PT.number.isRequired,
  onChange: PT.func.isRequired,
  perm: MPT.MedlemskapEnkeltPeriode.isRequired,
  redigerbart: PT.bool.isRequired,
  feil: PT.object,
};

TidligereMedlemPeriodeLinje.defaultProps = {
  feil: undefined,
};

class TidligereMedlemskapPerioder extends Component {
  onChange = async periodeID => {
    const { fields, oppdaterOgLagreBehandlinger } = this.props;
    const { push, remove } = fields;
    const alleValgtePeriodeID = fields.getAll() || [];
    const eksistererVedPosisjon = alleValgtePeriodeID.findIndex(valgt => valgt === periodeID);

    if (eksistererVedPosisjon === -1) {
      await push(periodeID);
    } else {
      await remove(eksistererVedPosisjon);
    }

    oppdaterOgLagreBehandlinger().catch(e => Utils.logger.error(e));
  };

  render() {
    const {
      medlemskap,
      fields,
      redigerbart,
      feil,
    } = this.props;
    const alleValgtePeriodeID = fields.getAll() || [];
    const { onChange } = this;

    const { perioderMed } = medlemskap;
    return (
      <div>
        {
          perioderMed && perioderMed.map((perm, index) => {
            const isChecked = alleValgtePeriodeID.includes(perm.periodeID);
            return <TidligereMedlemPeriodeLinje feil={feil} redigerbart={redigerbart} onChange={onChange} checked={isChecked} key={uuid()} perm={perm} index={index} />;
          })
        }
      </div>
    );
  }
}

TidligereMedlemskapPerioder.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  feil: PT.object,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
};

TidligereMedlemskapPerioder.defaultProps = {
  feil: undefined,
};

const TidligereMedlemskap = props => (<div><FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapPerioder} props={props.feil} {...props} /></div>);

TidligereMedlemskap.propTypes = {
  feil: PT.object,
};

TidligereMedlemskap.defaultProps = {
  feil: undefined,
};

class VurderingArtikkel16Anmodning extends Component {
  state = {
    lovvalgFeilmelding: undefined,
    begrunnelserFeilmelding: undefined,
    fritekstFeilmelding: undefined,
  };

  componentDidMount() {
    const { oppdaterData, tilstand: { art16_1 } } = this.props;
    oppdaterData(konverterTilStegData('art16_1_anmodning', art16_1));
    oppdaterData(konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART16_1));
  }

  componentWillUnmount() {
    this.props.slettData();
  }

  lagreBehandlingerOgBestillAnmodningsperioder = async () => {
    const { oppdaterOgLagreBehandlinger, lagreOgBestillAnmodningsperioder } = this.props;
    try {
      await oppdaterOgLagreBehandlinger();
      lagreOgBestillAnmodningsperioder();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  lagreAnmodningsperioder = async () => {
    const { byggAnmodningsperioderHandler, lagreAnmodningsperioderHandler } = this.props;

    await byggAnmodningsperioderHandler();
    await lagreAnmodningsperioderHandler();

    this.setState({ lovvalgFeilmelding: undefined });
  };

  lagreVilkar = () => {
    this.props.lagreVilkarHandler().catch(e => Utils.logger.error(e));
  };

  lagreBehandlinger = () => {
    this.props.oppdaterOgLagreBehandlinger().catch(e => Utils.logger.error(e));
  };

  fritekstEndretHandler = event => {
    this.setState({ fritekstFeilmelding: undefined });

    const { oppdaterData } = this.props;
    const { id, value } = event.target;

    oppdaterData(lagBegrunnelse(id, null, value));
  };

  fritekstFokusFlyttetHandler = () => {
    this.lagreVilkar();
  };

  begrunnelserEndringHandler = async event => {
    this.setState({ begrunnelserFeilmelding: undefined });

    const { oppdaterData } = this.props;

    await oppdaterData(lagBegrunnelse('art16_1_anmodning', event.value));
    this.lagreVilkar();
  };

  validerLovvalg = () => {
    const valid = this.props.unntakFraBestemmelse;
    if (!valid) this.setState({ lovvalgFeilmelding: { feilmelding: 'Velg lovvalg' } });
    return valid;
  };

  validerBegrunnelser = () => {
    const { tilstand } = this.props;
    const valid = tilstand.art16_1.begrunnelseKoder.length !== 0;
    if (!valid) this.setState({ begrunnelserFeilmelding: 'Velg begrunnelser' });
    return valid;
  };

  validerFritekst = () => {
    const valid = this.props.tilstand.art16_1.begrunnelseFritekst;
    if (!valid) this.setState({ fritekstFeilmelding: { feilmelding: 'Fyll inn fritekst' } });
    return valid;
  };

  validerAlt = () => {
    const { tilstand } = this.props;

    const lovvalgValid = this.validerLovvalg();
    const begrunnelserValid = this.validerBegrunnelser();
    const fritekstValid = tilstand.art16_1.begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN) ? this.validerFritekst() : true;

    return lovvalgValid && begrunnelserValid && fritekstValid;
  };

  validerOgLagreBehandling = async () => {
    if (this.validerAlt()) {
      await this.lagreAnmodningsperioder();
      this.lagreBehandlingerOgBestillAnmodningsperioder();
    }
  };

  render() {
    const {
      anmodningsperiode,
      behandlingID,
      gyldigeSoknadsland,
      medlemskap,
      redigerbart,
      tilstand,
    } = this.props;

    const {
      begrunnelserEndringHandler,
      validerAlt,
      validerOgLagreBehandling,
      fritekstFokusFlyttetHandler,
      fritekstEndretHandler,
      lagreAnmodningsperioder,
    } = this;

    const {
      begrunnelserFeilmelding,
      fritekstFeilmelding,
      lovvalgFeilmelding,
    } = this.state;

    const antallManeder = datoDiffMenneskelig(anmodningsperiode.fomDato, anmodningsperiode.tomDato);

    const landSomTekstListe = gyldigeSoknadsland.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ');

    const dokumenter = [
      { navn: 'Forhåndsvis orienteringsbrev til bruker', type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
      { navn: 'Forhåndsvis anmodning til utenlandsk myndighet', type: MKV.Koder.brev.produserbaredokumenter.ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.MYNDIGHET } },
      { navn: 'Forhåndsvis SED A001', type: EKV.Koder.sedtyper.A001, erSed: true },
    ];

    const visFritekstfelt = tilstand.art16_1.begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN);

    const { art16_1, art16_1: { begrunnelseFritekst } } = tilstand;

    const art16fritekst = begrunnelseFritekst || '';

    /* eslint-disable max-len */
    return (
      <div>
        <Nav.Undertittel>Anmodning om unntak etter artikkel 16.1</Nav.Undertittel>
        <div className="artikkel16">
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Element type="element">Det lands lovgivning det søkes unntak fra:</Nav.Element>
              <Nav.Normaltekst>{landSomTekstListe}</Nav.Normaltekst>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.Element type="element">Antall måneder:</Nav.Element>
              <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
              <DatoOmrade periode={{ fom: anmodningsperiode.fomDato, tom: anmodningsperiode.tomDato }} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              <Skjema.Select
                feil={lovvalgFeilmelding}
                onBlur={lagreAnmodningsperioder}
                disabled={!redigerbart}
                feltNavn="unntakFraBestemmelse"
                label="Artikkelen det søkes unntak fra:"
              >
                { alleLovvalg.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              <ListevelgerFlervalg
                disabled={!redigerbart}
                feil={begrunnelserFeilmelding}
                muligeValg={MKV.KTObjects.begrunnelser.art16_1_anmodning}
                tillatFritekst={false}
                label="Legg til begrunnelse:"
                onChange={begrunnelserEndringHandler}
                defaultElementer={art16_1.begrunnelseKoder}
              />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              {
                visFritekstfelt &&
                <Nav.Textarea
                  id="art16_1_anmodning"
                  label="Begrunnelse til utenlandsk myndighet (engelsk):"
                  disabled={!redigerbart}
                  onBlur={fritekstFokusFlyttetHandler}
                  onChange={fritekstEndretHandler}
                  value={art16fritekst}
                  feil={fritekstFeilmelding}
                  maxLength={255}
                  bredde="fullbredde"
                />
              }
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="12">
              <Nav.Fieldset legend={`Velg direkte forutgående perioder i ${landSomTekstListe}:`}>
                <TidligereMedlemskap oppdaterOgLagreBehandlinger={this.props.oppdaterOgLagreBehandlinger} redigerbart={redigerbart} medlemskap={medlemskap} />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="6">
              {redigerbart && <PdfLenkeListe vedKlikk={validerAlt} behandlingID={behandlingID} dokumenter={dokumenter} />}
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Hovedknapp type="hoved" disabled={!redigerbart} onClick={validerOgLagreBehandling}>
                Send brevene
              </Nav.Hovedknapp>
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
    );
  }
}

VurderingArtikkel16Anmodning.propTypes = {
  anmodningsperiode: PT.object,
  medlemskap: MPT.Medlemskap.isRequired,
  lagreOgBestillAnmodningsperioder: PT.func.isRequired,
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgKode: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
  unntakFraBestemmelse: PT.string,
  art16begrunnelserFritekst: PT.string,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.object.isRequired,
  byggAnmodningsperioderHandler: PT.func.isRequired,
};

VurderingArtikkel16Anmodning.defaultProps = {
  art16begrunnelserFritekst: '',
  unntakFraBestemmelse: '',
  anmodningsperiode: {},
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  art16begrunnelserFritekst: formSelectors.Art16BegrunnelseFritekstSelector(state),
  unntakFraBestemmelse: formSelectors.UnntakFraBestemmelseSelector(state),
  initialValues: {
    unntakFraBestemmelse: anmodningsperioderSelectors.UnntakFraBestemmelseSelector(state),
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
  },
});

const VurderingArtikkel16AnmodningForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_ANMODNING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingArtikkel16Anmodning);

export default connect(mapStateToProps)(VurderingArtikkel16AnmodningForm);
