import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import { change, getFormSyncErrors } from "redux-form";
import PT from "prop-types";

import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";

import { formSelectors } from "../../../ducks/form";
import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";
import MKV from "../../../melosyskodeverk";
import { useFeatureToggle } from "../../../featuretoggle";

import "./opprettSak.css";
import MultiSelect from "../../../felleskomponenter/skjema/input/multiselect";
import * as KV from "../../../kodeverk";

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
    journalforingSoknadsland,
    journalforingSoknadslandUkjenteEllerAlleEosLand: ukjentEllerAlleEosLand,
    journalforingGjelder,
  } = journalforingSkjemaVerdier;
  const [valgteLand, setValgteLand] = useState(journalforingSoknadsland);
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

  const skalViseSoknadsperiodeOgLand =
    journalforingGjelder !== MKV.Koder.aktoersroller.VIRKSOMHET &&
    valgtSakstype === MKV.Koder.sakstyper.EU_EOS &&
    ![
      MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED,
      MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM,
      MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
    ].includes(valgtBehandlingstema);

  const [oppdaterteFelt, setOppdaterteFelt] = useState({ land: false });
  const oppdaterFelt = (felt) => {
    const prevState = { ...oppdaterteFelt };
    prevState[felt] = true;
    setOppdaterteFelt(prevState);
  };

  const landEndret = (options) => {
    const land = options ? options.map((item) => item.value) : [];
    setValgteLand(land);
    oppdaterFelt("land");
    settFeltInnhold("journalforingSoknadsland", land);
  };

  return (
    <div className="panelramme">
      <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
        {valgbareSakstyper.map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      {sakstemaToggleEnabled && (
        <Skjema.Select feltNavn="sakstema" bredde="fullbredde" label="Sakstema">
          {MKV.KTObjects.sakstemaer.map((elem) => (
            <option key={elem.kode} value={elem.kode}>
              {elem.term}
            </option>
          ))}
        </Skjema.Select>
      )}
      <Skjema.Select
        feltNavn="opprettnysak_behandlingstema"
        bredde="fullbredde"
        label="Behandlingstema"
        onChange={() => settFeltInnhold("journalforingSoknadslandUkjenteEllerAlleEosLand", false)}
      >
        {valgbareBehandlingstemaer.map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      {sakstemaToggleEnabled && (
        <Skjema.Select feltNavn="opprettnysak_behandlingstype" bredde="fullbredde" label="Behandlingstype">
          {MKV.KTObjects.behandlinger.behandlingstyper.map((elem) => (
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
          <Nav.Fieldset>
            <Nav.Typo.Element>
              <LabelMedHjelpetekst
                label="I hvilke land skal arbeidet/næringen utføres i?"
                hjelpetekst="“Flere EØS-land/Sveits. Ikke kjent hvilke” skal kun benyttes hvis land er ukjent"
              />
            </Nav.Typo.Element>
            {valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
              <Nav.Row className="landcheckbox">
                <Skjema.Radio
                  feltNavn="journalforingSoknadslandUkjenteEllerAlleEosLand"
                  disabled={valgteLand.length > 0}
                  label="Flere EØS-land/Sveits. Ikke kjent hvilke"
                  value
                />
                <Skjema.Radio
                  feltNavn="journalforingSoknadslandUkjenteEllerAlleEosLand"
                  label="Velg land fra liste"
                  value={false}
                />
              </Nav.Row>
            )}
            <Nav.Row className="">
              <Nav.Column xs="12">
                <MultiSelect
                  values={valgteLand}
                  onChange={landEndret}
                  options={MKV.KTObjects.landkoder.map((item) => ({ value: item.kode, label: item.term }))}
                  className="multiselect"
                  redigerbart={!ukjentEllerAlleEosLand}
                  feltNavn="journalforingSoknadsland"
                />
              </Nav.Column>
            </Nav.Row>
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
