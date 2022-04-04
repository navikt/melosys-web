import React, { Fragment, useEffect } from "react";
import PT from "prop-types";
import MKV from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Konstanter from "../../../constants";
import * as KV from "../../../kodeverk";

import "./avsendervelger.css";
import "./avsendere.css";

export const AvsenderOrganisasjon = ({
  settFeltInnhold,
  hentOgVisRepresentant,
  journalføresPåVirksomhet,
  avsenderID,
  avsenderType,
  children,
}) => {
  useEffect(() => {
    if (avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG) {
      settFeltInnhold("representantRepresenterer", MKV.Koder.representerer.BRUKER);
    } else if (journalføresPåVirksomhet) {
      settFeltInnhold("representantRepresenterer", MKV.Koder.representerer.ARBEIDSGIVER);
    }
    return () => {
      settFeltInnhold("representantRepresenterer", "");
    };
  }, []);

  useEffect(() => {
    if (avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG || avsenderType === KV.AvsenderTyper.FULLMEKTIG) {
      settFeltInnhold("representantID", avsenderID);
    }
    return () => {
      settFeltInnhold("representantID", "");
    };
  }, [avsenderID]);

  const erGyldigOrgnummer = (verdi) => verdi.length === Konstanter.ANTALL_TALL_I_ORGNR;

  const sjekkArbeidsgiver = async (verdi) => {
    if (erGyldigOrgnummer(verdi)) {
      // TODO await this.spinner('representantNavn');
      await hentOgVisRepresentant(verdi);
    } else {
      await settFeltInnhold("representantNavn", "");
    }
  };

  const IDFeltTastOppHandler = async (event) => {
    const { id: opprinneligFeltID, value } = event.target;
    if (opprinneligFeltID === "representantID") {
      await sjekkArbeidsgiver(value);
    }
  };

  return (
    <div className="avsender">
      <Skjema.Input
        feltNavn="avsenderID"
        label="Oppgi avsenders org.nr."
        onKeyUp={IDFeltTastOppHandler}
        className="avsendere__input"
      />
      <Skjema.Input feltNavn="avsenderNavn" label="Organisasjonsnavn" disabled className="avsendere__input" />
      {children}
    </div>
  );
};
AvsenderOrganisasjon.propTypes = {
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  journalføresPåVirksomhet: PT.bool.isRequired,
  avsenderID: PT.string,
  avsenderType: PT.string.isRequired,
  children: PT.node,
};

AvsenderOrganisasjon.defaultProps = {
  avsenderID: "",
  children: null,
};

export const AvsenderFullmektig = ({
  avsenderID,
  journalføresPåVirksomhet,
  settFeltInnhold,
  hentOgVisRepresentant,
}) => {
  const representererMap = {
    [MKV.Koder.representerer.ARBEIDSGIVER]: "Arbeidsgiver",
    [MKV.Koder.representerer.BRUKER]: "Arbeidstaker",
    [MKV.Koder.representerer.BEGGE]: "Både arbeidsgiver og arbeidstaker",
  };

  return (
    <AvsenderOrganisasjon
      avsenderID={avsenderID}
      avsenderType={KV.AvsenderTyper.FULLMEKTIG}
      journalføresPåVirksomhet={journalføresPåVirksomhet}
      settFeltInnhold={settFeltInnhold}
      hentOgVisRepresentant={hentOgVisRepresentant}
    >
      {!journalføresPåVirksomhet && (
        <Skjema.Select
          feltNavn="representantRepresenterer"
          label="Hvem er dette fullmektig for"
          className="avsendere__input"
        >
          {MKV.KTObjects.representerer.map(({ kode }) => (
            <option key={kode} value={kode}>
              {representererMap[kode]}
            </option>
          ))}
        </Skjema.Select>
      )}
    </AvsenderOrganisasjon>
  );
};

AvsenderFullmektig.propTypes = {
  avsenderID: PT.string,
  journalføresPåVirksomhet: PT.bool.isRequired,
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
};

AvsenderFullmektig.defaultProps = {
  avsenderID: "",
};

export const AvsenderUtenlanskTrygdemyndighet = ({ utenlandskTrygdemyndighetLandkode, fullmektigLandEndret }) => (
  <div className="avsender">
    <Skjema.LandVelger
      feltNavn="utenlandskTrygdemyndighetLandkode"
      label="Velg land"
      onChange={fullmektigLandEndret}
      className="avsendere__input"
    />
    {utenlandskTrygdemyndighetLandkode && (
      <Fragment>
        <Nav.Typo.Element>Avsender</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>
          Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, MKV.KTObjects.landkoder)}
        </Nav.Typo.Normaltekst>
      </Fragment>
    )}
  </div>
);

AvsenderUtenlanskTrygdemyndighet.propTypes = {
  utenlandskTrygdemyndighetLandkode: PT.string,
  fullmektigLandEndret: PT.func.isRequired,
};
AvsenderUtenlanskTrygdemyndighet.defaultProps = {
  utenlandskTrygdemyndighetLandkode: "",
};
