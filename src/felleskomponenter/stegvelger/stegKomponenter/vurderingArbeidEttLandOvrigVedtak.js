import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import { reduxForm, isValid, getFormValues } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../utils/navFrontend";
import * as Utils from "../../../utils";
import * as Skjema from "../../skjema";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Mui from "../../ui";
import * as Hooks from "../../../hooks";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from "../../../ducks/lovvalgsperioder";
import { behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { formOperations } from "../../../ducks/form";

import PdfLenkeListe from "../../pdfLenkeListe";
import Mottakerinstitusjonvelger, { MottakerinstitusjonvelgerFlervalg } from "../../mottakerinstitusjonvelger";
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../../yup";
import {
  lagAvklartfakta,
  slettAvklartfakta,
  konverterTilStegData as konverterAvklartfaktaTilStegData,
} from "../../../regler/avklartefakta";
import { lagLovvalgsbestemmelse, konverterLovvalgsbestemmelseTilStegData } from "../../../regler/lovvalgsbestemmelser";
import { lagLovvalgsperiode } from "../../../regler/lovvalgsperiode";
import { lagTilleggBestemmelse, slettTilleggBestemmelse } from "../../../regler/tilleggbestemmelser";

import "./vurderingArbeidEttLandOvrigVedtak.css";

const InformertMyndighetVelger = ({ redigerbart, oppdaterData, slettData, informertMyndighetFakta }) => {
  useEffect(() => {
    oppdaterData(
      konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET, informertMyndighetFakta)
    );

    return () => {
      slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET));
    };
  }, []);

  const oppdaterInformertMyndighetFakta = (land) => {
    oppdaterData(
      lagAvklartfakta(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET, land, KV.Koder.SoknadslandFaktaTyper.SANN)
    );
  };

  return (
    <Skjema.LandVelger
      label="Hvilket land skal informeres?"
      feltNavn="mottakerLand"
      disabled={!redigerbart}
      onChange={oppdaterInformertMyndighetFakta}
    />
  );
};

InformertMyndighetVelger.propTypes = {
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  informertMyndighetFakta: MPT.Avklartefakta.isRequired,
};

const art11_5_ErValgt = (formValues) =>
  formValues.lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5;

const art11_3B_ErValgt = (formValues) =>
  formValues.lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

const sjekkSkalSendeSed = (formValues) => {
  const { kreverMottakerinstitusjon } = formValues;

  if (art11_5_ErValgt(formValues)) {
    return kreverMottakerinstitusjon;
  } else if (art11_3B_ErValgt(formValues)) {
    return true;
  }

  return false;
};

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
  soknadsperiode,
  informertMyndighetFakta,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  useEffect(() => {
    if (lovvalgsbestemmelseSomSkalLagres) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelseSomSkalLagres));
    }

    if (redigerbart) {
      oppdaterData(
        lagLovvalgsperiode({
          fomDato: behandlingsgrunnlagFom,
          tomDato: behandlingsgrunnlagTom,
        })
      );
    }

    return () => {
      slettData();
    };
  }, []);

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const forkortLovvalgsperiode = () =>
    endreLovvalgsPeriode(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));

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

  let pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev og A1",
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  if (sjekkSkalSendeSed(formValues)) {
    pdfDokumenter = [
      ...pdfDokumenter,
      {
        navn: "Forhåndsvis SED A010",
        type: EKV.Koder.sedtyper.A010,
        erSed: true,
        data: {
          fritekst: formValues.fritekstSed,
        },
      },
    ];
  }

  const fom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);
  const tom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom);

  const lovvalgsbestemmelseTerm = KV.kodeTilTerm(lovvalgsbestemmelseSomSkalVises, MKV.Kodekombinasjoner.alleLovvalg);
  const overskrift = `Omfattet av norsk lovgivning etter ${lovvalgsbestemmelseTerm || "..."}`;

  const valgbareLovvalgsbestemmelser = [
    ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.filter(
      ({ kode }) => kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B
    ),
    ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.filter(
      ({ kode }) => kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
    ),
  ];

  useEffect(() => {
    if (
      formValues.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
    ) {
      oppdaterData(
        lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A)
      );
      oppdaterData(
        lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5)
      );
    } else if (formValues.lovvalgsbestemmelse) {
      oppdaterData(lagLovvalgsbestemmelse(formValues.lovvalgsbestemmelse));
      slettData(slettTilleggBestemmelse());
    }
  }, [formValues.lovvalgsbestemmelse]);

  const visSendSEDValg = art11_5_ErValgt(formValues);
  const visMottakerinstitusjonvelgerFlervalg = art11_3B_ErValgt(formValues);

  const skalSendeSed = sjekkSkalSendeSed(formValues);

  const fattVedtak = async (values, dispatch, props) => {
    setVedtakPending(true);

    if (values.forkortLovvalgsperiode) {
      await props.endreLovvalgsPeriode(props.lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(values.tomDato));
    }

    let mottakerinstitusjoner = null;
    if (art11_5_ErValgt(values)) {
      mottakerinstitusjoner = values.mottakerLand ? [values.mottakerinstitusjon] : [];
    } else if (art11_3B_ErValgt(values)) {
      mottakerinstitusjoner = values.mottakerinstitusjoner
        .filter((inst) => inst.kreverMottakerinstitusjon)
        .map((inst) => inst.id);
    }

    await props.lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: values.vedtaksbrevFritekst,
      mottakerinstitusjoner,
      vedtakstype: values.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: values.vedtakstypebegrunnelse,
    });

    // Vedtak-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(fattVedtak)} className="vurderingArbeidEttLandOvrigVedtak">
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      <Nav.Row className="velgLovvalgsbestemmelse">
        <Nav.Column xs="7">
          <Skjema.Select label="Velg en lovvalgsbestemmelse" feltNavn="lovvalgsbestemmelse" disabled={!redigerbart}>
            {valgbareLovvalgsbestemmelser.map((bestemmelse) => (
              <option key={bestemmelse.kode} value={bestemmelse.kode}>
                {bestemmelse.term}
              </option>
            ))}
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
      {redigerbart && (
        <Fragment>
          <Nav.typo.Element className="undertittel">Søknadsperiode</Nav.typo.Element>
          <Nav.Row className="lovvalgsperiode">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      )}
      <Skjema.PeriodeForkorter
        className="periodeForkorter"
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
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
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
      {visSendSEDValg && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.RadioGruppe
              feltNavn="informerUtenlandskTrygdemyndighet"
              label="Skal utenlandsk trygdemyndighet informeres?"
            >
              <Skjema.Radio feltNavn="informerUtenlandskTrygdemyndighet" label="Ja" value disabled={!redigerbart} />
              <Skjema.Radio
                feltNavn="informerUtenlandskTrygdemyndighet"
                label="Nei"
                value={false}
                disabled={!redigerbart}
              />
            </Skjema.RadioGruppe>
          </Nav.Column>
        </Nav.Row>
      )}
      {visSendSEDValg && formValues.informerUtenlandskTrygdemyndighet && (
        <Nav.Row>
          <Nav.Column xs="6">
            <InformertMyndighetVelger
              redigerbart={redigerbart}
              oppdaterData={oppdaterData}
              slettData={slettData}
              informertMyndighetFakta={informertMyndighetFakta}
            />
            {formValues.mottakerLand && (
              <Mottakerinstitusjonvelger
                form={form}
                redigerbart={redigerbart}
                landkode={formValues.mottakerLand}
                bucType={EKV.Koder.buctyper.legislation.LA_BUC_05}
              />
            )}
          </Nav.Column>
        </Nav.Row>
      )}
      {visMottakerinstitusjonvelgerFlervalg && (
        <Nav.Row>
          <Nav.Column xs="8">
            <MottakerinstitusjonvelgerFlervalg
              feltnavn="mottakerinstitusjoner"
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_05}
              redigerbart={redigerbart}
              form={form}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      {redigerbart && skalSendeSed && (
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
      )}
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && (
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />
          )}
        </Nav.Column>
      </Nav.Row>
      <Mui.Knapp spinner={vedtakPending} autoDisableVedSpinner disabled={!redigerbart} htmlType="submit" type="hoved">
        FATT VEDTAK
      </Mui.Knapp>
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
  behandlingsgrunnlagTom: PT.string,
  soknadsperiode: PT.shape({
    fom: PT.string.isRequired,
    tom: PT.string.isRequired,
  }).isRequired,
  informertMyndighetFakta: MPT.Avklartefakta,
};

VurderingArbeidEttLandOvrigVedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
  lovvalgsbestemmelseSomSkalVises: "",
  lovvalgsbestemmelseSomSkalLagres: "",
  behandlingsgrunnlagTom: null,
  informertMyndighetFakta: {},
};

const mapStateToProps = (state, ownProps) => {
  const forkortLovvalgsperiode = ownProps.redigerbart
    ? false
    : Utils.dato.datoDiffPure(
        behandlingsgrunnlagSelectors.PeriodeSelector(state).tom,
        lovvalgsperioderSelectors.TomDatoSelector(state),
        "days"
      ) !== 0;

  const informerUtenlandskTrygdemyndighet = !Utils._isEmpty(ownProps.informertMyndighetFakta);
  const mottakerLand = ownProps.informertMyndighetFakta.subjektID;

  return {
    behandlingsgrunnlagFom: behandlingsgrunnlagSelectors.PeriodeFomSelector(state),
    behandlingsgrunnlagTom: behandlingsgrunnlagSelectors.PeriodeTomSelector(state),
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
    soknadsperiode: behandlingsgrunnlagSelectors.PeriodeSelector(state),
    formIsValid: isValid(KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: forkortLovvalgsperiode
        ? Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state))
        : "",
      fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
      vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
      vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
      vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      mottakerinstitusjoner: avklartefaktaSelectors.IkkeMarginaleArbeidslandKTSelector(state) || [],
      lovvalgsbestemmelse: ownProps.lovvalgsbestemmelseSomSkalVises,
      fritekstSed: "",
      informerUtenlandskTrygdemyndighet,
      mottakerLand,
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  endreLovvalgsPeriode: (fomdato, tomdato) =>
    dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK)),
});

const VurderingArbeidEttLandOvrigVedtakForm = reduxForm({
  form: KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(YupSkjemaer.arbeid_ett_land_ovrig_vedtak, {
      context: {
        soknadsperiode: props.soknadsperiode,
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingArbeidEttLandOvrigVedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArbeidEttLandOvrigVedtakForm);
