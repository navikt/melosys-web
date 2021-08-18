import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import * as Skjema from "../../../felleskomponenter/skjema/";
import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes/";
import { formSelectors } from "../../../ducks/form";
import MKV from "../../../melosyskodeverk";
import { FeatureToggle, useFeatureToggle } from "../../../featuretoggle";

import "./opprettSak.css";

export const OpprettSakTittel = () => (
  <div className="enkeltSak__meta">
    <Nav.Typo.Element>Opprett ny sak</Nav.Typo.Element>
  </div>
);
const OpprettFagsak = (props) => {
  const { sakstyper, behandlingstemaer } = props;
  const { journalforingSkjemaVerdier } = props;
  const { settFeltInnhold } = props;
  const {
    opprettnysak_behandlingstema: valgtBehandlingstema,
    sakstype: valgtSakstype,
    journalforingSoknadsland: valgteLand,
    journalforingSoknadslandUkjenteEllerAlleEosLand: ukjentEllerAlleEosLand,
  } = journalforingSkjemaVerdier;

  useEffect(() => {
    settFeltInnhold(
      "opprettnysak_behandlingstema",
      valgtSakstype === MKV.Koder.sakstyper.FTRL
        ? MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
        : MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER
    );
  }, [valgtSakstype]);

  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");

  if (folketrygdenToggle === "fetching") return null;

  if (folketrygdenToggle === "enabled") {
    if (sakstyper.findIndex((sakstype) => sakstype.kode === MKV.Koder.sakstyper.FTRL) === -1) {
      sakstyper.push(MKV.KTObjects.sakstyper.find(({ kode }) => kode === MKV.Koder.sakstyper.FTRL));
    }
    if (
      behandlingstemaer.findIndex(
        (behandlingstema) => behandlingstema.kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
      ) === -1
    ) {
      behandlingstemaer.push(
        MKV.KTObjects.behandlinger.behandlingstema.find(
          ({ kode }) => kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
        )
      );
    }
  }

  const skalViseSoknadsperiodeOgLand = (behandlingstema) =>
    ![
      MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED,
      MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM,
      MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
    ].includes(behandlingstema);

  return (
    <div className="panelramme">
      <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
        {sakstyper.map((elem) => (
          <option key={elem.kode} value={elem.kode}>
            {elem.term}
          </option>
        ))}
      </Skjema.Select>
      <Skjema.Select
        feltNavn="opprettnysak_behandlingstema"
        bredde="fullbredde"
        label="Behandlingstema"
        onChange={() => settFeltInnhold("journalforingSoknadslandUkjenteEllerAlleEosLand", false)}
      >
        {behandlingstemaer &&
          behandlingstemaer
            .filter((elem) =>
              valgtSakstype === MKV.Koder.sakstyper.FTRL
                ? elem.kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
                : elem.kode !== MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
            )
            .map((elem) => (
              <option key={elem.kode} value={elem.kode}>
                {elem.term}
              </option>
            ))}
      </Skjema.Select>
      {skalViseSoknadsperiodeOgLand(valgtBehandlingstema) && (
        <Fragment>
          {valgtBehandlingstema !== MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET && (
            <Fragment>
              <Nav.Fieldset legend="Søknadsperiode:" className="opprettnysak__soknadsperiode">
                <Nav.Row className="">
                  <Nav.Column xs="6">
                    <FeatureToggle togglename="melosys.input.DATOFELT">
                      {(status) =>
                        status === "enabled" ? (
                          <Skjema.Datovelger label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
                        ) : (
                          <Skjema.Input datoFelt label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
                        )
                      }
                    </FeatureToggle>
                  </Nav.Column>
                  <Nav.Column xs="6">
                    <FeatureToggle togglename="melosys.input.DATOFELT">
                      {(status) =>
                        status === "enabled" ? (
                          <Skjema.Datovelger label="Til" feltNavn="journalforingPeriodeTilOgMed" />
                        ) : (
                          <Skjema.Input datoFelt label="Til" feltNavn="journalforingPeriodeTilOgMed" />
                        )
                      }
                    </FeatureToggle>
                  </Nav.Column>
                </Nav.Row>
              </Nav.Fieldset>
              <Nav.Fieldset legend="Land:">
                {valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
                  <Nav.Row className="landcheckbox">
                    <Skjema.Checkbox
                      feltNavn="journalforingSoknadslandUkjenteEllerAlleEosLand"
                      disabled={valgteLand.length > 0}
                      label={
                        <div>
                          Flere EØS-land/Sveits. Ikke kjent hvilke
                          <Nav.Hjelpetekst className="hjelpetekst" tittel="tittel" type={Nav.PopoverOrientering.Hoyre}>
                            Når søker ikke vet hvilke land arbeidet/næringen skal utføres i, krysser du av her.
                            <br />
                            Det er ikke mulig å legge til andre land i tillegg.
                          </Nav.Hjelpetekst>
                        </div>
                      }
                    />
                  </Nav.Row>
                )}
                <Nav.Row className="">
                  <Nav.Column xs="12">
                    <Skjema.LandVelger
                      feltNavn="journalforingSoknadsland"
                      multiLand
                      errorConfig={{ submitFailed: true }}
                      disabled={ukjentEllerAlleEosLand}
                    />
                  </Nav.Column>
                </Nav.Row>
              </Nav.Fieldset>
            </Fragment>
          )}
        </Fragment>
      )}
    </div>
  );
};
OpprettFagsak.propTypes = {
  behandlingstemaer: PT.arrayOf(MPT.Kodeverk).isRequired,
  sakstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  journalforingSkjemaVerdier: PT.object,
  settFeltInnhold: PT.func.isRequired,
};

OpprettFagsak.defaultProps = {
  journalforingSkjemaVerdier: {},
};
const mapStateToProps = (state) => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change("journalforing", feltNavn, verdi)),
});
export default connect(mapStateToProps, mapDispatchToProps)(OpprettFagsak);
