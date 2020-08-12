import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues, change } from 'redux-form';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';
import * as Skjema from '../../skjema';

import PdfLenkeListe from '../../pdfLenkeListe';
import { MottakerinstitusjonvelgerFlervalg } from '../../mottakerinstitusjonvelger';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { utpekingsperioderSelectors, utpekingsperioderOperations } from '../../../ducks/utpekingsperioder';
import { redigerbartSelectors } from '../../../ducks/redigerbart';
import { formOperations } from '../../../ducks/form';
import { flytSelectors } from '../../../ducks/flyt';
import { behandlingsresultatSelectors } from '../../../ducks/behandlingsresultat';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import { konverterLovvalgslandTilStegData, lagLovvalgsland } from '../../../regler/lovvalgsland';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../yup';

import './vurderingArtikkel13UtpekLand.css';

export const VurderingArtikkel13UtpekLand = ({
  redigerbart,
  behandlingID,
  lovvalgsland,
  soknadsperiode,
  utpekingsperiode,
  tilstand: { overskrift },
  form,
  formIsValid,
  lagreOgUtpek,
  formValues,
  touchAll,
  erOffentligArbeidUtland,
  harLonnetArbeidAnnetLand,
  oppdaterData,
  slettData,
  lagreUtpekingsperioder,
  ikkeMarginaleArbeidsland,
  oppdaterMottakerinstitusjoner,
  byggUtpekingsperioder: gjenopprettOpprinneligUtpekingsperiode,
  endreUtpekingsperiode,
}) => {
  useEffect(() => {
    oppdaterData(konverterLovvalgslandTilStegData(lovvalgsland));

    return () => {
      slettData();
    };
  }, []);

  const forkortUtpekingsperiode = () => endreUtpekingsperiode(utpekingsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));

  const validerForm = () => {
    touchAll();
    return formIsValid;
  };

  const vedKlikkUtpek = async () => {
    if (!validerForm()) return;

    if (formValues.forkortUtpekingsperiode) {
      await endreUtpekingsperiode(utpekingsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));
    }

    lagreOgUtpek({
      mottakerinstitusjoner: formValues.mottakerinstitusjoner.filter(inst => inst.kreverMottakerinstitusjon).map(inst => inst.id),
      fritekstSed: formValues.fritekstSed,
      fritekstBrev: formValues.fritekstOrienteringsbrev,
    });
  };

  const endreLovvalgsland = land => {
    oppdaterData(lagLovvalgsland(land));

    // Henter eksisterende mottakerinstitusjoner som også er ikke marginale arbeidsland (samme som i initialValues)
    const eksisterendeIkkeMarginaleArbeidsland = formValues.mottakerinstitusjoner.filter(({ kode }) => ikkeMarginaleArbeidsland.includes(kode));

    // Skal ikke legge til ekstra mottakerinstitusjon dersom den allerede finnes
    const valgtLovvalgsland = ikkeMarginaleArbeidsland.includes(land)
      ? [] : KV.kodeTilObjekt(land, MKV.KTObjects.landkoder);

    oppdaterMottakerinstitusjoner([
      ...eksisterendeIkkeMarginaleArbeidsland,
      ...valgtLovvalgsland,
    ]);
  };

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_UTPEKING_UTLAND,
      data: {
        begrunnelseKode: null,
        fritekst: formValues.fritekstOrienteringsbrev,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis SED A003',
      type: EKV.Koder.sedtyper.A003,
      erSed: true,
      data: {
        fritekst: formValues.fritekstSed,
      },
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);
  const tom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom);

  const visLandvelger = erOffentligArbeidUtland || harLonnetArbeidAnnetLand;
  const lovvalgslandTittel = visLandvelger ? 'Velg lovvalgsland' : 'Lovvalgsland';

  const vedKlikkForhandsvis = async () => {
    const formValid = validerForm();
    if (!formValid) return false;

    if (formValues.forkortUtpekingsperiode) {
      await forkortUtpekingsperiode();
    }

    lagreUtpekingsperioder();
    return true;
  };

  return (
    <div className="vurderingArtikkel13UtpekLand">
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      <Nav.typo.Undertittel>
        <Nav.typo.Element className="undertittel">{lovvalgslandTittel}</Nav.typo.Element>
      </Nav.typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          {
            visLandvelger &&
            <Skjema.LandVelger
              feltNavn="lovvalgsland"
              label=""
              disabled={!redigerbart}
              onChange={endreLovvalgsland}
            />
          }
          {
            !visLandvelger &&
            <div>{lovvalgsland && KV.kodeTilTerm(lovvalgsland, MKV.KTObjects.landkoder)}</div>
          }
        </Nav.Column>
      </Nav.Row>
      <Nav.typo.Undertittel>
        <Nav.typo.Element className="undertittel">Lovvalgsperiode</Nav.typo.Element>
      </Nav.typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          {fom} - {tom}
        </Nav.Column>
      </Nav.Row>
      <Skjema.PeriodeForkorter
        redigerbart={redigerbart}
        checkboxClassName="forkortUtpekingsperiode"
        checkboxLabel="Utpekingen gjelder for en kortere periode"
        checkboxFeltnavn="forkortUtpekingsperiode"
        onUncheck={gjenopprettOpprinneligUtpekingsperiode}
        forkortPeriode={formValues.forkortUtpekingsperiode}
        fomLabel="Startdato"
        fomFeltNavn="fomDato"
        tomLabel="Sluttdato"
        tomFeltNavn="tomDato"
      />
      <Nav.Row className="fritekst">
        <Nav.Column xs="7">
          <Skjema.Textarea
            feltNavn="fritekstOrienteringsbrev"
            label="Fritekst til orienteringsbrev"
            placeholder="Skriv inn tekst til orienteringsbrevet..."
            maxLength={500}
            visTellerFra={500}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {
        redigerbart &&
        <Nav.Row className="fritekst">
          <Nav.Column xs="7">
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
      <Nav.Row className="mottakerinstitusjoner">
        <Nav.Column xs="7">
          <MottakerinstitusjonvelgerFlervalg
            feltnavn="mottakerinstitusjoner"
            form={form}
            redigerbart={redigerbart}
            bucType={EKV.Koder.buctyper.legislation.LA_BUC_02}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikkUtpek} disabled={!redigerbart} type="hoved">FATT VEDTAK</Nav.Hovedknapp>
    </div>
  );
};

VurderingArtikkel13UtpekLand.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsland: PT.string,
  utpekingsperiode: MPT.Periode,
  form: PT.string.isRequired,
  formValues: PT.object,
  formIsValid: PT.bool.isRequired,
  lagreOgUtpek: PT.func.isRequired,
  touchAll: PT.func.isRequired,
  erOffentligArbeidUtland: PT.bool.isRequired,
  harLonnetArbeidAnnetLand: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  lagreUtpekingsperioder: PT.func.isRequired,
  endreUtpekingsperiode: PT.func.isRequired,
  byggUtpekingsperioder: PT.func.isRequired,
  soknadsperiode: MPT.Periode.isRequired,
  ikkeMarginaleArbeidsland: PT.array.isRequired,
  oppdaterMottakerinstitusjoner: PT.func.isRequired,
};

VurderingArtikkel13UtpekLand.defaultProps = {
  utpekingsperiode: {},
  formValues: {},
  lovvalgsland: '',
};

const mapStateToProps = state => {
  const utpekingsperiodeTom = utpekingsperioderSelectors.TomDatoSelector(state);
  const erUtpekingsperiodeForkortet = () => Utils.dato.datoDiffPure(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom,
    utpekingsperiodeTom,
    'days'
  ) !== 0;

  const forkortUtpekingsperiode = utpekingsperiodeTom === null ? false : erUtpekingsperiodeForkortet();

  return {
    erOffentligArbeidUtland: flytSelectors.HarOffentligTjenesteAnnetLandSelector(state),
    harLonnetArbeidAnnetLand: flytSelectors.HarLonnetArbeidAnnetLand(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lovvalgsland: utpekingsperioderSelectors.LovvalgslandSelector(state),
    utpekingsperiode: utpekingsperioderSelectors.UtpekingsperiodeSelector(state),
    soknadsperiode: behandlingsgrunnlagSelectors.PeriodeSelector(state),
    formIsValid: isValid(KV.Form.ARTIKKEL_13_UTPEKLAND)(state),
    formValues: getFormValues(KV.Form.ARTIKKEL_13_UTPEKLAND)(state),
    ikkeMarginaleArbeidsland: avklartefaktaSelectors.IkkeMarginaleArbeidslandSelector(state) || [],
    initialValues: {
      forkortUtpekingsperiode,
      tomDato: forkortUtpekingsperiode ? Utils.dato.formatterDatoTilNorsk(utpekingsperioderSelectors.TomDatoSelector(state)) : '',
      fomDato: Utils.dato.formatterDatoTilNorsk(utpekingsperioderSelectors.FomDatoSelector(state)),
      mottakerinstitusjoner: avklartefaktaSelectors.LandSomKreverSEDKTSelector(state),
      fritekstOrienteringsbrev: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      kreverMottakerinstitusjon: false,
      fritekstSed: null,
      lovvalgsland: utpekingsperioderSelectors.LovvalgslandSelector(state),
    },
  };
};

const mapDispatchToProps = dispatch => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARTIKKEL_13_UTPEKLAND)),
  lagreUtpekingsperioder: () => dispatch(utpekingsperioderOperations.lagre()),
  endreUtpekingsperiode: (fomdato, tomdato) => dispatch(utpekingsperioderOperations.endrePeriode(fomdato, tomdato)),
  oppdaterMottakerinstitusjoner: mottakerinstitusjoner => dispatch(change(KV.Form.ARTIKKEL_13_UTPEKLAND, 'mottakerinstitusjoner', mottakerinstitusjoner)),
});

const VurderingArtikkel13UtpekLand_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_UTPEKLAND,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => {
    const settings = {
      context: {
        soknadsperiode: props.soknadsperiode,
        validerLovvalgsland: props.erOffentligArbeidUtland || props.harLonnetArbeidAnnetLand,
      },
    };

    return lagYupToReduxformErrorMapper(YupSkjemaer.artikkel13_utpek, settings)(values);
  },
})(VurderingArtikkel13UtpekLand);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13UtpekLand_form);
