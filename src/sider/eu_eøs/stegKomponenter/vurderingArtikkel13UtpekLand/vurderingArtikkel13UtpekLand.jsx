import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { change, getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as MPT from "../../../../proptypes";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Hooks from "../../../../hooks";
import * as Mui from "../../../../felleskomponenter/ui";

import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import { MottakerinstitusjonvelgerFlervalg } from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import { konverterLovvalgslandTilStegData, lagLovvalgsland } from "../../../../felleskomponenter/stegvelger";

import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { utpekingsperioderOperations, utpekingsperioderSelectors } from "../../../../ducks/utpekingsperioder";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { formOperations } from "../../../../ducks/form";
import { flytSelectors } from "../../../../ducks/flyt";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingArtikkel13UtpekLandSchema from "./vurderingArtikkel13UtpekLandSchema";

import "./vurderingArtikkel13UtpekLand.css";

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
  tilbake,
  lagreUtpekingsperioder,
  landMedVesentligEllerRegistrertArbeid,
  oppdaterMottakerinstitusjoner,
  byggUtpekingsperioder: gjenopprettOpprinneligUtpekingsperiode,
  endreUtpekingsperiode,
}) => {
  const [utpekingPending, setUtpekingPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  const oppdaterUtpekingsperiode = async (fomdato, tomdato) => {
    await endreUtpekingsperiode(fomdato, tomdato);
    lagreUtpekingsperioder();
  };

  useEffect(() => {
    if (!(formValues.fomDato && formValues.tomDato)) {
      return;
    }

    if (!formValues.forkortUtpekingsperiode) {
      oppdaterUtpekingsperiode(utpekingsperiode.fomDato, utpekingsperiode.tomDato);
    } else {
      const isoTomDato = Utils.dato.formatterDatoTilISO(formValues.tomDato, null);
      if (isoTomDato) {
        oppdaterUtpekingsperiode(utpekingsperiode.fomDato, isoTomDato);
      }
    }
  }, [formValues.tomDato, formValues.forkortUtpekingsperiode]);

  // TODO usikker på om vi egentlig behøver denne her, ettersom vi i andre forms ønsker å beholde mellomlagrede datas
  useEffect(() => {
    oppdaterData(konverterLovvalgslandTilStegData(lovvalgsland));

    return () => {
      slettData();
    };
  }, []);

  const validerForm = () => {
    touchAll();
    return formIsValid;
  };

  const vedKlikkUtpek = async () => {
    if (!validerForm()) return;

    setUtpekingPending(true);

    if (formValues.forkortUtpekingsperiode) {
      await endreUtpekingsperiode(utpekingsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));
    }

    await lagreOgUtpek({
      mottakerinstitusjoner: formValues.mottakerinstitusjoner
        .filter((inst) => inst.kreverMottakerinstitusjon)
        .map((inst) => inst.id),
      fritekstSed: formValues.fritekstSed,
      fritekstBrev: formValues.fritekstOrienteringsbrev,
    });

    // Utpeking-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setUtpekingPending(false);
    }
  };

  const endreLovvalgsland = (land) => {
    if (land !== formValues.lovvalgsland) {
      oppdaterData(lagLovvalgsland(land));

      oppdaterMottakerinstitusjoner(
        [...new Set([...landMedVesentligEllerRegistrertArbeid, land])].map((landkode) =>
          KV.kodeTilObjekt(landkode, MKV.KTObjects.landkoder)
        )
      );
    }
  };

  const pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_UTPEKING_UTLAND,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        begrunnelseKode: null,
        fritekst: formValues.fritekstOrienteringsbrev,
      },
    },
    {
      sedType: EKV.Koder.sedtyper.A003,
      sedData: {
        fritekst: formValues.fritekstSed,
      },
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);
  const tom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom);

  const visLandvelger = erOffentligArbeidUtland || harLonnetArbeidAnnetLand;
  const lovvalgslandTittel = visLandvelger ? "Velg lovvalgsland" : "Lovvalgsland";
  const mottakerInstitusjonKrevesMenErIkkeSatt =
    !Utils._isEmpty(formValues.mottakerinstitusjoner) &&
    formValues.mottakerinstitusjoner.some((mottakerInstitusjon) => {
      return (
        mottakerInstitusjon.kode === lovvalgsland &&
        mottakerInstitusjon.kreverMottakerinstitusjon &&
        !mottakerInstitusjon.id
      );
    });

  return (
    <div className="vurderingArtikkel13UtpekLand">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">{overskrift}</Nav.Typo.Innholdstittel>
      <Nav.Typo.Undertittel>
        <Nav.Typo.Element className="undertittel">{lovvalgslandTittel}</Nav.Typo.Element>
      </Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          {visLandvelger && (
            <Skjema.LandVelger feltNavn="lovvalgsland" label="" disabled={!redigerbart} onChange={endreLovvalgsland} />
          )}
          {!visLandvelger && <div>{lovvalgsland && KV.kodeTilTerm(lovvalgsland, MKV.KTObjects.landkoder)}</div>}
        </Nav.Column>
      </Nav.Row>
      <Nav.Typo.Undertittel>
        <Nav.Typo.Element className="undertittel">Lovvalgsperiode</Nav.Typo.Element>
      </Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          {fom} - {tom}
        </Nav.Column>
      </Nav.Row>
      <Skjema.PeriodeForkorter
        redigerbart={redigerbart}
        fomRedigerbar={false}
        checkboxClassName="forkortUtpekingsperiode"
        checkboxLabel="Utpekingen gjelder for en kortere periode"
        checkboxFeltnavn="forkortUtpekingsperiode"
        onUncheck={gjenopprettOpprinneligUtpekingsperiode}
        forkortPeriode={formValues.forkortUtpekingsperiode}
        fomLabel="Startdato"
        fomFeltNavn="fomDato"
        minDate={Utils.dato.norskStringTilDate(fom)}
        maxDate={Utils.dato.norskStringTilDate(tom)}
        tomLabel="Sluttdato"
        tomFeltNavn="tomDato"
      />
      <Nav.Row className="fritekst">
        <Nav.Column xs="7">
          <Skjema.Textarea
            feltNavn="fritekstOrienteringsbrev"
            label="Fritekst til orienteringsbrev"
            placeholder="Skriv inn tekst til orienteringsbrevet..."
            readOnly={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {redigerbart && (
        <Nav.Row className="fritekst">
          <Nav.Column xs="7">
            <Skjema.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              feltNavn="fritekstSed"
              readOnly={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}
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
        <Nav.Column xs="7">
          {redigerbart && !mottakerInstitusjonKrevesMenErIkkeSatt && (
            <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={validerForm} />
          )}
        </Nav.Column>
      </Nav.Row>
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: vedKlikkUtpek,
          loading: utpekingPending,
          disabled: !redigerbart,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
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
  tilbake: PT.func.isRequired,
  lagreUtpekingsperioder: PT.func.isRequired,
  endreUtpekingsperiode: PT.func.isRequired,
  byggUtpekingsperioder: PT.func.isRequired,
  soknadsperiode: MPT.Periode.isRequired,
  landMedVesentligEllerRegistrertArbeid: PT.array.isRequired,
  oppdaterMottakerinstitusjoner: PT.func.isRequired,
};

VurderingArtikkel13UtpekLand.defaultProps = {
  utpekingsperiode: {},
  formValues: {},
  lovvalgsland: "",
};

const mapStateToProps = (state) => {
  const utpekingsperiodeTom = utpekingsperioderSelectors.TomDatoSelector(state);
  const erUtpekingsperiodeForkortet = () =>
    Utils.dato.datoDiffPure(mottatteOpplysningerSelectors.PeriodeSelector(state).tom, utpekingsperiodeTom, "days") !==
    0;

  const forkortUtpekingsperiode = utpekingsperiodeTom === null ? false : erUtpekingsperiodeForkortet();

  return {
    erOffentligArbeidUtland: flytSelectors.HarOffentligTjenesteAnnetLandSelector(state),
    harLonnetArbeidAnnetLand: flytSelectors.HarLonnetArbeidAnnetLand(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lovvalgsland: utpekingsperioderSelectors.LovvalgslandSelector(state),
    utpekingsperiode: utpekingsperioderSelectors.UtpekingsperiodeSelector(state),
    soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
    formIsValid: isValid(KV.Form.ARTIKKEL_13_UTPEKLAND)(state),
    formValues: getFormValues(KV.Form.ARTIKKEL_13_UTPEKLAND)(state),
    landMedVesentligEllerRegistrertArbeid:
      avklartefaktaSelectors.LandMedVesentligEllerRegistrertArbeidSelector(state) || [],
    initialValues: {
      forkortUtpekingsperiode,
      tomDato: forkortUtpekingsperiode
        ? Utils.dato.formatterDatoTilNorsk(utpekingsperioderSelectors.TomDatoSelector(state))
        : "",
      fomDato: Utils.dato.formatterDatoTilNorsk(utpekingsperioderSelectors.FomDatoSelector(state)),
      mottakerinstitusjoner: avklartefaktaSelectors.LandSomKreverSEDKTSelector(state) || [],
      fritekstOrienteringsbrev: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      kreverMottakerinstitusjon: false,
      fritekstSed: null,
      lovvalgsland: utpekingsperioderSelectors.LovvalgslandSelector(state),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARTIKKEL_13_UTPEKLAND)),
  lagreUtpekingsperioder: () => dispatch(utpekingsperioderOperations.lagre()),
  endreUtpekingsperiode: (fomdato, tomdato) => dispatch(utpekingsperioderOperations.endrePeriode(fomdato, tomdato)),
  oppdaterMottakerinstitusjoner: (mottakerinstitusjoner) =>
    dispatch(change(KV.Form.ARTIKKEL_13_UTPEKLAND, "mottakerinstitusjoner", mottakerinstitusjoner)),
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

    return lagYupToReduxformErrorMapper(VurderingArtikkel13UtpekLandSchema, settings)(values);
  },
})(VurderingArtikkel13UtpekLand);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13UtpekLand_form);
