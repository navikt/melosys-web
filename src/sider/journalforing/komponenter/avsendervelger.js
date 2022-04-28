import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import PT from "prop-types";
import MKV from "../../../melosyskodeverk";

import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import { journalforingSelectors } from "../../../ducks/journalforing";

import { AvsenderOrganisasjon, AvsenderUtenlanskTrygdemyndighet, AvsenderFullmektig } from "./avsendere";
import "./avsendervelger.css";

const AvsenderVelger = ({
  className,
  kopierBrukerTilAvsender,
  kopierVirksomhetTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  hentOgVisRepresentant,
}) => {
  const avsenderTypeEndret = (avsenderType) => {
    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case KV.AvsenderTyper.VIRKSOMHET: {
        kopierVirksomhetTilAvsender();
        break;
      }
      case KV.AvsenderTyper.ANNET:
      case KV.AvsenderTyper.FULLMEKTIG:
      case KV.AvsenderTyper.ARBEIDSGIVER:
      case KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG:
      case MKV.Koder.avsendertyper.ORGANISASJON:
      case MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET: {
        tomAvsender();
        break;
      }
      default:
        throw new Error("Ukjent avsenderType");
    }
  };

  useEffect(() => {
    if (formValues.avsenderType) avsenderTypeEndret(formValues.avsenderType);
  }, [formValues.avsenderType]);

  const fullmektigLandEndret = (landkode = "") => {
    const avsenderNavn = landkode ? `Trygdemyndighet i ${KV.kodeTilTerm(landkode, MKV.KTObjects.landkoder)}` : null;

    settFeltInnhold("avsenderID", landkode);
    settFeltInnhold("avsenderNavn", avsenderNavn);
  };
  const journalføresPåVirksomhet = formValues.journalføresPå === KV.Koder.JournalføringRolle.VIRKSOMHET;

  return (
    <div className={className}>
      <Skjema.RadioGruppe feltNavn="avsenderType" label="Hvem er avsender?">
        {journalføresPåVirksomhet ? (
          <Skjema.Radio
            feltNavn="avsenderType"
            label="Virksomhet"
            value={KV.AvsenderTyper.VIRKSOMHET}
            className="avsendervelger__radio"
          />
        ) : (
          <Skjema.Radio
            feltNavn="avsenderType"
            label="Bruker"
            value={MKV.Koder.avsendertyper.PERSON}
            className="avsendervelger__radio"
          />
        )}
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Fullmektig"
          value={KV.AvsenderTyper.FULLMEKTIG}
          className="avsendervelger__radio"
        />
        {formValues.avsenderType === KV.AvsenderTyper.FULLMEKTIG && (
          <AvsenderFullmektig
            avsenderID={formValues.avsenderID}
            journalføresPåVirksomhet={journalføresPåVirksomhet}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        )}
        {!journalføresPåVirksomhet && (
          <>
            <Skjema.Radio
              feltNavn="avsenderType"
              label="Arbeidsgiver"
              value={KV.AvsenderTyper.ARBEIDSGIVER}
              className="avsendervelger__radio"
            />
            {formValues.avsenderType === KV.AvsenderTyper.ARBEIDSGIVER && (
              <AvsenderOrganisasjon
                avsenderID={formValues.avsenderID}
                avsenderType={formValues.avsenderType}
                settFeltInnhold={settFeltInnhold}
                hentOgVisRepresentant={hentOgVisRepresentant}
                journalføresPåVirksomhet={journalføresPåVirksomhet}
              />
            )}
            <Skjema.Radio
              feltNavn="avsenderType"
              label="Arbeidsgiver som er fullmektig"
              value={KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG}
              className="avsendervelger__radio"
            />
            {formValues.avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG && (
              <AvsenderOrganisasjon
                avsenderID={formValues.avsenderID}
                avsenderType={formValues.avsenderType}
                settFeltInnhold={settFeltInnhold}
                hentOgVisRepresentant={hentOgVisRepresentant}
                journalføresPåVirksomhet={journalføresPåVirksomhet}
              />
            )}
            <Skjema.Radio
              feltNavn="avsenderType"
              label="Utenlandsk trygdemyndighet"
              value={MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET}
              className="avsendervelger__radio"
            />
            {formValues.avsenderType === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET && (
              <AvsenderUtenlanskTrygdemyndighet
                utenlandskTrygdemyndighetLandkode={formValues.utenlandskTrygdemyndighetLandkode}
                fullmektigLandEndret={fullmektigLandEndret}
              />
            )}
          </>
        )}
      </Skjema.RadioGruppe>
    </div>
  );
};

AvsenderVelger.propTypes = {
  className: PT.string,
  kopierBrukerTilAvsender: PT.func.isRequired,
  kopierVirksomhetTilAvsender: PT.func.isRequired,
  tomAvsender: PT.func.isRequired,
  formValues: PT.object,
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  journalforingAvsenderID: PT.string,
  journalforingAvsenderNavn: PT.string,
};

AvsenderVelger.defaultProps = {
  className: undefined,
  formValues: {},
  journalforingAvsenderID: undefined,
  journalforingAvsenderNavn: undefined,
};

const mapStateToProps = (state) => ({
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  journalforingAvsenderID: journalforingSelectors.AvsenderIDSelector(state),
  journalforingAvsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
});

export default connect(mapStateToProps)(AvsenderVelger);
