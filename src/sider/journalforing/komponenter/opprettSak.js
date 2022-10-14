import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import { change, getFormSyncErrors } from "redux-form";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";

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

const nullstillVerdier = (steg, endreFelt, feltNavn) => {
  switch (steg) {
    case feltNavn.sakstype:
      endreFelt(feltNavn.formNavn, feltNavn.sakstema, null);
      endreFelt(feltNavn.formNavn, feltNavn.opprettnysak_behandlingstema, null);
      endreFelt(feltNavn.formNavn, feltNavn.opprettnysak_behandlingstype, null);
      break;
    case feltNavn.sakstema:
      endreFelt(feltNavn.formNavn, feltNavn.opprettnysak_behandlingstema, null);
      endreFelt(feltNavn.formNavn, feltNavn.opprettnysak_behandlingstype, null);
      break;
    case feltNavn.opprettnysak_behandlingstema:
      endreFelt(feltNavn.formNavn, feltNavn.opprettnysak_behandlingstype, null);
      break;
    case feltNavn.opprettnysak_behandlingstype:
    default:
      break;
  }
};

export const skalViseSoknadsperiodeOgLand = (sakstype, sakstema, behandlingstema, behandlingstype) =>
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  behandlingstema &&
  behandlingstype &&
  !skalViseTomFlytEllerErSedBehandling(sakstype, sakstema, behandlingstema, behandlingstype);

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
  const { behandleAlleSakerToggleEnabled, settFeltInnhold, formValues, feltNavn } = props;

  const {
    valgtSakstype,
    valgtSakstema,
    valgtBehandlingstema,
    valgtBehandlingstype,
    soknadsland,
    ukjentEllerAlleEosLand,
    hovedpart,
  } = {
    valgtSakstype: formValues[feltNavn.sakstype],
    valgtSakstema: formValues[feltNavn.sakstema],
    valgtBehandlingstema: formValues[feltNavn.opprettnysak_behandlingstema],
    valgtBehandlingstype: formValues[feltNavn.opprettnysak_behandlingstype],
    soknadsland: formValues[feltNavn.soknadsland],
    ukjentEllerAlleEosLand: formValues[feltNavn.soknadslandUkjenteEllerAlleEosLand],
    hovedpart: formValues[feltNavn.hovedpart],
  };

  const [sakstyper, setSakstyper] = useState([]);
  const [sakstemaer, setSakstemaer] = useState([]);
  const [behandlingstemaer, setBehandlingstemaer] = useState([]);
  const [behandlingstyper, setBehandlingstyper] = useState([]);
  const [valgbareSakstyper, setValgbareSakstyper] = useState([]);
  const [valgbareBehandlingstemaer, setValgbareBehandlingstemaer] = useState([]);
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");
  const { formNavn } = feltNavn;
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
    settFeltInnhold(formNavn, "opprettnysak_behandlingstema", defaultBehandlingstema(valgtSakstype));
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
      Api.LovligeKombinasjoner.hentSakstemaer(hovedpart, valgtSakstype).then((muligeSakstemaer) => {
        setSakstemaer(muligeSakstemaer);
      });
      setBehandlingstemaer([]);
      setBehandlingstyper([]);
    }
  }, [behandleAlleSakerToggleEnabled, hovedpart, valgtSakstype]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtSakstype && valgtSakstema) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(hovedpart, valgtSakstype, valgtSakstema).then(
        (muligeBehandlingstemaer) => {
          setBehandlingstemaer(muligeBehandlingstemaer);
        }
      );
      setBehandlingstyper([]);
    }
  }, [behandleAlleSakerToggleEnabled, hovedpart, valgtSakstype, valgtSakstema]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;
    if (valgtSakstype && valgtSakstema && valgtBehandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(hovedpart, valgtSakstype, valgtSakstema, valgtBehandlingstema).then(
        (muligeBehandlingstyper) => {
          setBehandlingstyper(muligeBehandlingstyper);
          if (muligeBehandlingstyper.map((k) => k.kode).includes(MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG)) {
            settFeltInnhold(
              formNavn,
              feltNavn.opprettnysak_behandlingstype,
              MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG
            );
          }
        }
      );
    }
  }, [behandleAlleSakerToggleEnabled, hovedpart, valgtSakstype, valgtSakstema, valgtBehandlingstema]);

  const visArbeidFlereLandEllerUkjent =
    valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;
  return (
    <div className="opprettSak">
      <Skjema.Select
        feltNavn={feltNavn.sakstype}
        bredde="fullbredde"
        label="Sakstype"
        onChange={() => {
          if (behandleAlleSakerToggleEnabled) nullstillVerdier(feltNavn.sakstype, settFeltInnhold, feltNavn);
        }}
        disabled={behandleAlleSakerToggleEnabled && !Utils._isEmpty(formValues?.utenlandskTrygdemyndighetLandkode)}
      >
        {(behandleAlleSakerToggleEnabled ? sakstyper : valgbareSakstyper).map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      {behandleAlleSakerToggleEnabled && (
        <Skjema.Select
          feltNavn={feltNavn.sakstema}
          bredde="fullbredde"
          label="Sakstema"
          onChange={() => nullstillVerdier(feltNavn.sakstema, settFeltInnhold, feltNavn)}
        >
          {sakstemaer.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      <Skjema.Select
        feltNavn={feltNavn.opprettnysak_behandlingstema}
        bredde="fullbredde"
        label="Behandlingstema"
        onChange={() => {
          if (behandleAlleSakerToggleEnabled)
            nullstillVerdier(feltNavn.opprettnysak_behandlingstema, settFeltInnhold, feltNavn);
          settFeltInnhold(formNavn, feltNavn.soknadslandUkjenteEllerAlleEosLand, false);
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
          feltNavn={feltNavn.opprettnysak_behandlingstype}
          bredde="fullbredde"
          label="Behandlingstype"
          onChange={() => nullstillVerdier(feltNavn.opprettnysak_behandlingstype, settFeltInnhold, feltNavn)}
        >
          {behandlingstyper.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      {(behandleAlleSakerToggleEnabled
        ? skalViseSoknadsperiodeOgLand(valgtSakstype, valgtSakstema, valgtBehandlingstema, valgtBehandlingstype)
        : skalViseSoknadsperiodeOgLandDeprecated(hovedpart, valgtSakstype, valgtBehandlingstema)) && (
        <Fragment>
          <Nav.Fieldset legend="Søknadsperiode:" className="opprettnysak__soknadsperiode">
            <Nav.Row className="">
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Fra" feltNavn={feltNavn.periodeFraOgMed} />
              </Nav.Column>
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Til" feltNavn={feltNavn.periodeTilOgMed} />
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
                  feltNavn={feltNavn.soknadslandUkjenteEllerAlleEosLand}
                  label="Flere EØS-land/Sveits. Ikke kjent hvilke"
                  disabled={soknadsland?.length > 0}
                  value
                />
                <Skjema.Radio
                  feltNavn={feltNavn.soknadslandUkjenteEllerAlleEosLand}
                  label="Velg land fra liste"
                  value={false}
                />
              </Nav.Row>
            )}
            {!ukjentEllerAlleEosLand && (
              <Nav.Row>
                <Nav.Column xs="12">
                  <Skjema.MultiSelect
                    feltNavn={feltNavn.soknadsland}
                    options={MKV.KTObjects.landkoder.map((item) => ({ value: item.kode, label: item.term }))}
                    className="multiselect"
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
  errors: PT.object,
  formValues: PT.object.isRequired,
  feltNavn: PT.object.isRequired,
  settFeltInnhold: PT.func.isRequired,
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
};

OpprettSak.defaultProps = {
  errors: {},
};
const mapStateToProps = (state) => ({
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (formNavn, feltNavn, verdi) => dispatch(change(formNavn, feltNavn, verdi)),
});
export default connect(mapStateToProps, mapDispatchToProps)(OpprettSak);
