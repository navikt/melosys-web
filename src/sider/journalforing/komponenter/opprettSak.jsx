import { Fragment, useEffect, useState } from "react";
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
import { skalViseIngenFlyt } from "../../../url";

import "./opprettSak.css";

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
  sakstema &&
  behandlingstema &&
  behandlingstype &&
  behandlingstema !== MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV &&
  behandlingstema !== MKV.Koder.behandlinger.behandlingstema.A1_ANMODNING_OM_UNNTAK_PAPIR &&
  !skalViseIngenFlyt(sakstype, sakstema, behandlingstema, behandlingstype, false, false);

export const OpprettSak = (props) => {
  const { settFeltInnhold, formValues, feltNavn } = props;
  const {
    valgtSakstype,
    valgtSakstema,
    valgtBehandlingstema,
    valgtBehandlingstype,
    soknadsland,
    flereLandUkjentHvilke,
    hovedpart,
    periodeFraOgMed,
  } = {
    valgtSakstype: formValues[feltNavn.sakstype],
    valgtSakstema: formValues[feltNavn.sakstema],
    valgtBehandlingstema: formValues[feltNavn.opprettnysak_behandlingstema],
    valgtBehandlingstype: formValues[feltNavn.opprettnysak_behandlingstype],
    soknadsland: formValues[feltNavn.soknadsland],
    flereLandUkjentHvilke: formValues[feltNavn.soknadslandFlereLandUkjentHvilke],
    hovedpart: formValues[feltNavn.hovedpart],
    periodeFraOgMed: formValues[feltNavn.periodeFraOgMed],
  };

  const [sakstyper, setSakstyper] = useState([]);
  const [sakstemaer, setSakstemaer] = useState([]);
  const [behandlingstemaer, setBehandlingstemaer] = useState([]);
  const [behandlingstyper, setBehandlingstyper] = useState([]);
  const { formNavn } = feltNavn;

  useEffect(() => {
    Api.LovligeKombinasjoner.hentSakstyper().then((muligeSakstyper) => {
      setSakstyper(muligeSakstyper);
    });
  }, []);

  useEffect(() => {
    if (valgtSakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(hovedpart, valgtSakstype).then((muligeSakstemaer) => {
        setSakstemaer(muligeSakstemaer);
      });
      setBehandlingstemaer([]);
      setBehandlingstyper([]);
    }
  }, [hovedpart, valgtSakstype]);

  useEffect(() => {
    if (valgtSakstype && valgtSakstema) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(hovedpart, valgtSakstype, valgtSakstema).then(
        (muligeBehandlingstemaer) => {
          setBehandlingstemaer(muligeBehandlingstemaer);
        }
      );
      setBehandlingstyper([]);
    }
  }, [hovedpart, valgtSakstype, valgtSakstema]);

  useEffect(() => {
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
  }, [hovedpart, valgtSakstype, valgtSakstema, valgtBehandlingstema]);

  const visArbeidFlereLandEllerUkjent =
    valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;
  const disableSakstype =
    !Utils._isEmpty(formValues?.utenlandskTrygdemyndighetLandkode) &&
    !KV.erKodeIListe(
      formValues.utenlandskTrygdemyndighetLandkode,
      MKV.Kodekombinasjoner.landSomErTrygdeavtaleMyndighetslandOgEuEøsLand
    );

  return (
    <div className="opprettSak">
      <Skjema.Select
        feltNavn={feltNavn.sakstype}
        bredde="fullbredde"
        label="Sakstype"
        onChange={() => nullstillVerdier(feltNavn.sakstype, settFeltInnhold, feltNavn)}
        disabled={disableSakstype}
      >
        {sakstyper.map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
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
      <Skjema.Select
        feltNavn={feltNavn.opprettnysak_behandlingstema}
        bredde="fullbredde"
        label="Behandlingstema"
        onChange={() => {
          nullstillVerdier(feltNavn.opprettnysak_behandlingstema, settFeltInnhold, feltNavn);
          settFeltInnhold(formNavn, feltNavn.soknadslandFlereLandUkjentHvilke, false);
        }}
      >
        {behandlingstemaer.map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
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
      {skalViseSoknadsperiodeOgLand(valgtSakstype, valgtSakstema, valgtBehandlingstema, valgtBehandlingstype) && (
        <Fragment>
          <Nav.Fieldset legend="Søknadsperiode:" className="opprettnysak__soknadsperiode">
            <Nav.Row className="">
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Fra" feltNavn={feltNavn.periodeFraOgMed} />
              </Nav.Column>
              <Nav.Column xs="6">
                <Skjema.Datovelger
                  label="Til"
                  feltNavn={feltNavn.periodeTilOgMed}
                  minDate={Utils.dato.norskStringTilDate(periodeFraOgMed)}
                />
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          <Nav.Fieldset
            legend={
              <LabelMedHjelpetekst
                label="I hvilke land skal arbeidet/næringen utføres i?"
                hjelpetekst={
                  visArbeidFlereLandEllerUkjent
                    ? '"Flere land. Ikke kjent hvilke” skal kun benyttes hvis land er ukjent'
                    : undefined
                }
              />
            }
          >
            {visArbeidFlereLandEllerUkjent && (
              <Nav.Row className="land_radiobtn">
                <Nav.RadioGroup legend="" hideLegend>
                  <Skjema.Radio
                    feltNavn={feltNavn.soknadslandFlereLandUkjentHvilke}
                    label="Flere land. Ikke kjent hvilke"
                    disabled={soknadsland?.length > 0}
                    value
                  />
                  <Skjema.Radio
                    feltNavn={feltNavn.soknadslandFlereLandUkjentHvilke}
                    label="Velg land fra liste"
                    value={false}
                  />
                </Nav.RadioGroup>
              </Nav.Row>
            )}
            {!flereLandUkjentHvilke && (
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
