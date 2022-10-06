import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import { change, getFormSyncErrors } from "redux-form";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";

import { formSelectors } from "../../../ducks/form";
import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";
import { useFeatureToggle } from "../../../featuretoggle";
import { skalViseTomFlytEllerErSedBehandling } from "../../../routing";

import "./opprettSak.css";

const euEosBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }) =>
    kode === MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER ||
    kode === MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG ||
    kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG ||
    kode === MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV ||
    kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND ||
    kode === MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED ||
    kode === MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM ||
    kode === MKV.Koder.behandlinger.behandlingstema.TRYGDETID
);

const ftrlBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }) => kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
);

const trygdeavtaleBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }) => kode === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
);

const { JOURNALFORING_VALUES: FormValues } = KV.Form;

export const nullstillVerdier = (steg, endreFelt) => {
  switch (steg) {
    case FormValues.sakstype:
      endreFelt(FormValues.sakstema, null);
      endreFelt(FormValues.opprettnysak_behandlingstema, null);
      endreFelt(FormValues.opprettnysak_behandlingstype, null);
      break;
    case FormValues.sakstema:
      endreFelt(FormValues.opprettnysak_behandlingstema, null);
      endreFelt(FormValues.opprettnysak_behandlingstype, null);
      break;
    case FormValues.opprettnysak_behandlingstema:
      endreFelt(FormValues.opprettnysak_behandlingstype, null);
      break;
    case FormValues.opprettnysak_behandlingstype:
    default:
      break;
  }
};

export const skalViseSoknadsperiodeOgLand = (sakstype, behandlingstema, behandlingstype) =>
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  behandlingstema &&
  behandlingstype &&
  !skalViseTomFlytEllerErSedBehandling(sakstype, behandlingstema, behandlingstype);

export const skalViseSoknadsperiodeOgLandDeprecated = (hovedpart, sakstype, behandlingstema) =>
  hovedpart !== MKV.Koder.aktoersroller.VIRKSOMHET &&
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  ![
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED,
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM,
    MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
  ].includes(behandlingstema);

export const OpprettSakTittel = () => (
  <div className="enkeltSak__meta">
    <Nav.Typo.Element>Opprett ny sak</Nav.Typo.Element>
  </div>
);

export const OpprettSak = (props) => {
  const { journalforingSkjemaVerdier, opprettNySakSkjemaVerdier, behandleAlleSakerToggleEnabled, settFeltInnhold } =
    props;
  const {
    opprettnysak_behandlingstema: valgtBehandlingstema_JOURNALFØRING,
    opprettnysak_behandlingstype: valgtBehandlingstype_JOURNALFØRING,
    sakstype: valgtSakstype_JOURNALFØRING,
    sakstema: valgtSakstema_JOURNALFØRING,
    journalforingSoknadsland: valgteLand_JOURNALFØRING,
    journalforingSoknadslandUkjenteEllerAlleEosLand: ukjentEllerAlleEosLand_JOURNALFØRING,
    journalforingGjelder: journalforingGjelder_JOURNALFØRING,
  } = journalforingSkjemaVerdier;

  const {
    opprettnysak_behandlingstema: valgtBehandlingstema_OPPRETT_NY,
    opprettnysak_behandlingstype: valgtBehandlingstype_OPPRETT_NY,
    sakstype: valgtSakstype_OPPRETT_NY,
    sakstema: valgtSakstema_OPPRETT_NY,
    journalforingSoknadsland: journalforingSoknadsland_OPPRETT_NY,
    journalforingSoknadslandUkjenteEllerAlleEosLand: journalforingSoknadslandUkjenteEllerAlleEosLand_OPPRETT_NY,
    hovedpart: hovedpart_OPPRETT_NY,
  } = opprettNySakSkjemaVerdier;

  const {
    valgtSakstype,
    valgtSakstema,
    valgtBehandlingstema,
    valgtBehandlingstype,
    journalforingSoknadsland,
    ukjentEllerAlleEosLand,
    journalforingGjelder,
  } = {
    valgtSakstype: valgtSakstype_JOURNALFØRING ?? valgtSakstype_OPPRETT_NY,
    valgtSakstema: valgtSakstema_JOURNALFØRING ?? valgtSakstema_OPPRETT_NY,
    valgtBehandlingstema: valgtBehandlingstema_JOURNALFØRING ?? valgtBehandlingstema_OPPRETT_NY,
    valgtBehandlingstype: valgtBehandlingstype_JOURNALFØRING ?? valgtBehandlingstype_OPPRETT_NY,
    journalforingSoknadsland: valgteLand_JOURNALFØRING ?? journalforingSoknadsland_OPPRETT_NY,
    ukjentEllerAlleEosLand:
      ukjentEllerAlleEosLand_JOURNALFØRING ?? journalforingSoknadslandUkjenteEllerAlleEosLand_OPPRETT_NY,
    journalforingGjelder: journalforingGjelder_JOURNALFØRING ?? hovedpart_OPPRETT_NY,
  };

  const [sakstyper, setSakstyper] = useState([]);
  const [sakstemaer, setSakstemaer] = useState([]);
  const [behandlingstemaer, setBehandlingstemaer] = useState([]);
  const [behandlingstyper, setBehandlingstyper] = useState([]);
  const [valgbareSakstyper, setValgbareSakstyper] = useState([]);
  const [valgbareBehandlingstemaer, setValgbareBehandlingstemaer] = useState([]);
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");

  const defaultBehandlingstema = (sakstype) => {
    switch (sakstype) {
      case MKV.Koder.sakstyper.FTRL:
        return MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET;
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV;
      default:
        return MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER;
    }
  };

  const behandlingstemaerEtterSakstype = (sakstype) => {
    switch (sakstype) {
      case MKV.Koder.sakstyper.FTRL:
        return ftrlBehandlingstemaer;
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return trygdeavtaleBehandlingstemaer;
      case MKV.Koder.sakstyper.EU_EOS:
        return euEosBehandlingstemaer;
      default:
        return [];
    }
  };

  useEffect(() => {
    if (behandleAlleSakerToggleEnabled) return;
    settFeltInnhold("opprettnysak_behandlingstema", defaultBehandlingstema(valgtSakstype));
    setValgbareBehandlingstemaer(behandlingstemaerEtterSakstype(valgtSakstype));
  }, [valgtSakstype]);

  useEffect(() => {
    setValgbareSakstyper(
      MKV.KTObjects.sakstyper.filter(
        ({ kode }) =>
          kode === MKV.Koder.sakstyper.EU_EOS ||
          (folketrygdenToggle === "enabled" && kode === MKV.Koder.sakstyper.FTRL) ||
          kode === MKV.Koder.sakstyper.TRYGDEAVTALE
      )
    );
  }, [folketrygdenToggle]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    Api.LovligeKombinasjoner.hentSakstyper().then((muligeSakstyper) => {
      setSakstyper(muligeSakstyper);
    });
  }, [behandleAlleSakerToggleEnabled]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtSakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(journalforingGjelder, valgtSakstype).then((muligeSakstemaer) => {
        setSakstemaer(muligeSakstemaer);
      });
    }
  }, [behandleAlleSakerToggleEnabled, journalforingGjelder, valgtSakstype]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtSakstema && valgtSakstype) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(journalforingGjelder, valgtSakstype, valgtSakstema).then(
        (muligeBehandlingstemaer) => {
          setBehandlingstemaer(muligeBehandlingstemaer);
        }
      );
    }
  }, [behandleAlleSakerToggleEnabled, journalforingGjelder, valgtSakstype, valgtSakstema]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtSakstema && valgtSakstype && valgtBehandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        journalforingGjelder,
        valgtSakstype,
        valgtSakstema,
        valgtBehandlingstema
      ).then((muligeBehandlingstyper) => {
        setBehandlingstyper(muligeBehandlingstyper);
        if (muligeBehandlingstyper.map((k) => k.kode).includes(MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG)) {
          settFeltInnhold(FormValues.opprettnysak_behandlingstype, MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG);
        }
      });
    }
  }, [behandleAlleSakerToggleEnabled, journalforingGjelder, valgtSakstype, valgtSakstema, valgtBehandlingstema]);

  const visArbeidFlereLandEllerUkjent =
    valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;

  return (
    <div className="opprettSak">
      <Skjema.Select
        feltNavn={FormValues.sakstype}
        bredde="fullbredde"
        label="Sakstype"
        onChange={() => {
          if (behandleAlleSakerToggleEnabled) nullstillVerdier(FormValues.sakstype, settFeltInnhold);
        }}
      >
        {(behandleAlleSakerToggleEnabled ? sakstyper : valgbareSakstyper).map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      {behandleAlleSakerToggleEnabled && (
        <Skjema.Select
          feltNavn={FormValues.sakstema}
          bredde="fullbredde"
          label="Sakstema"
          onChange={() => nullstillVerdier(FormValues.sakstema, settFeltInnhold)}
        >
          {sakstemaer.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      <Skjema.Select
        feltNavn={FormValues.opprettnysak_behandlingstema}
        bredde="fullbredde"
        label="Behandlingstema"
        onChange={() => {
          if (behandleAlleSakerToggleEnabled)
            nullstillVerdier(FormValues.opprettnysak_behandlingstema, settFeltInnhold);
          settFeltInnhold("journalforingSoknadslandUkjenteEllerAlleEosLand", false);
        }}
      >
        {(behandleAlleSakerToggleEnabled ? behandlingstemaer : valgbareBehandlingstemaer).map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      {behandleAlleSakerToggleEnabled && (
        <Skjema.Select
          feltNavn={FormValues.opprettnysak_behandlingstype}
          bredde="fullbredde"
          label="Behandlingstype"
          onChange={() => nullstillVerdier(FormValues.opprettnysak_behandlingstype, settFeltInnhold)}
        >
          {behandlingstyper.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      {(behandleAlleSakerToggleEnabled
        ? skalViseSoknadsperiodeOgLand(valgtSakstype, valgtBehandlingstema, valgtBehandlingstype)
        : skalViseSoknadsperiodeOgLandDeprecated(journalforingGjelder, valgtSakstype, valgtBehandlingstema)) && (
        <Fragment>
          <Nav.Fieldset legend="Søknadsperiode:" className="opprettnysak__soknadsperiode">
            <Nav.Row className="">
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
              </Nav.Column>
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Til" feltNavn="journalforingPeriodeTilOgMed" />
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          <Nav.Fieldset
            legend={
              <LabelMedHjelpetekst
                label="I hvilke land skal arbeidet/næringen utføres i?"
                hjelpetekst={
                  visArbeidFlereLandEllerUkjent
                    ? '"Flere EØS-land/Sveits. Ikke kjent hvilke” skal kun benyttes hvis land er ukjent'
                    : undefined
                }
              />
            }
          >
            {visArbeidFlereLandEllerUkjent && (
              <Nav.Row className="land_radiobtn">
                <Skjema.Radio
                  feltNavn="journalforingSoknadslandUkjenteEllerAlleEosLand"
                  label="Flere EØS-land/Sveits. Ikke kjent hvilke"
                  disabled={journalforingSoknadsland?.length > 0}
                  value
                />
                <Skjema.Radio
                  feltNavn="journalforingSoknadslandUkjenteEllerAlleEosLand"
                  label="Velg land fra liste"
                  value={false}
                />
              </Nav.Row>
            )}
            {!ukjentEllerAlleEosLand && (
              <Nav.Row>
                <Nav.Column xs="12">
                  <Skjema.MultiSelect
                    options={MKV.KTObjects.landkoder.map((item) => ({ value: item.kode, label: item.term }))}
                    className="multiselect"
                    feltNavn="journalforingSoknadsland"
                  />
                </Nav.Column>
              </Nav.Row>
            )}
          </Nav.Fieldset>
        </Fragment>
      )}
    </div>
  );
};
OpprettSak.propTypes = {
  journalforingSkjemaVerdier: PT.object,
  opprettNySakSkjemaVerdier: PT.object,
  errors: PT.object,
  settFeltInnhold: PT.func.isRequired,
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
};

OpprettSak.defaultProps = {
  journalforingSkjemaVerdier: {},
  opprettNySakSkjemaVerdier: {},
  errors: {},
};
const mapStateToProps = (state) => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  opprettNySakSkjemaVerdier: formSelectors.OpprettNySakFormSelector(state).values,
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change(KV.Form.JOURNALFORING, feltNavn, verdi)),
});
export default connect(mapStateToProps, mapDispatchToProps)(OpprettSak);
