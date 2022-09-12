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

import "./opprettSak.css";
import { nullstillSak, SakFormData } from "../../../felleskomponenter/skjema/hooks/nullstillsak";

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

export const OpprettSakTittel = () => (
  <div className="enkeltSak__meta">
    <Nav.Typo.Element>Opprett ny sak</Nav.Typo.Element>
  </div>
);

export const OpprettSak = (props) => {
  const { journalforingSkjemaVerdier, sakstemaToggleEnabled, settFeltInnhold } = props;
  const {
    opprettnysak_behandlingstema: valgtBehandlingstema,
    sakstype: valgtSakstype,
    sakstema: valgtSakstema,
    journalforingSoknadsland: valgteLand,
    journalforingSoknadslandUkjenteEllerAlleEosLand: ukjentEllerAlleEosLand,
    journalforingGjelder,
  } = journalforingSkjemaVerdier;
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
    if (!sakstemaToggleEnabled) return;

    Api.LovligeKombinasjoner.hentSakstyper().then((muligeSakstyper) => {
      setSakstyper(muligeSakstyper);
    });
  }, [sakstemaToggleEnabled]);

  useEffect(() => {
    if (!sakstemaToggleEnabled) return;

    if (valgtSakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(journalforingGjelder, valgtSakstype).then((muligeSakstemaer) => {
        setSakstemaer(muligeSakstemaer);
      });
    }
  }, [sakstemaToggleEnabled, journalforingGjelder, valgtSakstype]);

  useEffect(() => {
    if (!sakstemaToggleEnabled) return;
    if (valgtSakstema && valgtSakstype) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(journalforingGjelder, valgtSakstype, valgtSakstema).then(
        (muligeBehandlingstemaer) => {
          setBehandlingstemaer(muligeBehandlingstemaer);
        }
      );
    }
  }, [sakstemaToggleEnabled, journalforingGjelder, valgtSakstype, valgtSakstema]);

  useEffect(() => {
    if (!sakstemaToggleEnabled) return;

    if (valgtSakstema && valgtSakstype && valgtBehandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        journalforingGjelder,
        valgtSakstype,
        valgtSakstema,
        valgtBehandlingstema
      ).then((muligeBehandlingstyper) => {
        setBehandlingstyper(muligeBehandlingstyper);
      });
    }
  }, [sakstemaToggleEnabled, journalforingGjelder, valgtSakstype, valgtSakstema, valgtBehandlingstema]);

  useEffect(() => {
    if (!sakstemaToggleEnabled) return;

    if (valgtSakstema && valgtSakstype && journalforingGjelder === MKV.Koder.aktoersroller.VIRKSOMHET) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(journalforingGjelder, valgtSakstype, valgtSakstema).then(
        (muligeBehandlingstyper) => {
          setBehandlingstyper(muligeBehandlingstyper);
        }
      );
    }
  }, [sakstemaToggleEnabled, journalforingGjelder, valgtSakstype, valgtSakstema]);

  const skalViseSoknadsperiodeOgLand =
    journalforingGjelder !== MKV.Koder.aktoersroller.VIRKSOMHET &&
    valgtSakstype === MKV.Koder.sakstyper.EU_EOS &&
    ![
      MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED,
      MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM,
      MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
    ].includes(valgtBehandlingstema);

  const visMuligeBehandlingstema = sakstemaToggleEnabled
    ? journalforingGjelder === MKV.Koder.aktoersroller.BRUKER
    : true;
  return (
    <div className="panelramme">
      <Skjema.Select
        feltNavn="sakstype"
        bredde="fullbredde"
        label="Sakstype"
        onChange={() => nullstillSak(SakFormData.sakstype, settFeltInnhold)}
      >
        {(sakstemaToggleEnabled ? sakstyper : valgbareSakstyper).map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      {sakstemaToggleEnabled && (
        <Skjema.Select
          feltNavn="sakstema"
          bredde="fullbredde"
          label="Sakstema"
          onChange={() => nullstillSak(SakFormData.sakstema, settFeltInnhold)}
        >
          {sakstemaer.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      {visMuligeBehandlingstema && (
        <Skjema.Select
          feltNavn="behandlingstema"
          bredde="fullbredde"
          label="Behandlingstema"
          onChange={() => {
            nullstillSak(SakFormData.behandlingstema, settFeltInnhold);
            settFeltInnhold("journalforingSoknadslandUkjenteEllerAlleEosLand", false);
          }}
        >
          {(sakstemaToggleEnabled ? behandlingstemaer : valgbareBehandlingstemaer).map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      {sakstemaToggleEnabled && (
        <Skjema.Select
          feltNavn="behandlingstype"
          bredde="fullbredde"
          label="Behandlingstype"
          onChange={() => nullstillSak(SakFormData.behandlingstype, settFeltInnhold)}
        >
          {behandlingstyper.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      {skalViseSoknadsperiodeOgLand && (
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
                hjelpetekst="“Flere EØS-land/Sveits. Ikke kjent hvilke” skal kun benyttes hvis land er ukjent"
              />
            }
          >
            {valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
              <Nav.Row className="land_radiobtn">
                <Skjema.Radio
                  feltNavn="journalforingSoknadslandUkjenteEllerAlleEosLand"
                  label="Flere EØS-land/Sveits. Ikke kjent hvilke"
                  disabled={valgteLand.length > 0}
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
  errors: PT.object,
  settFeltInnhold: PT.func.isRequired,
  sakstemaToggleEnabled: PT.bool.isRequired,
};

OpprettSak.defaultProps = {
  journalforingSkjemaVerdier: {},
  errors: {},
};
const mapStateToProps = (state) => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change(KV.Form.JOURNALFORING, feltNavn, verdi)),
});
export default connect(mapStateToProps, mapDispatchToProps)(OpprettSak);
