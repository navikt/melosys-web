import React, { SyntheticEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";
import { change } from "redux-form";

import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";

import Komponent from "./komponent";
import { formSelectors } from "../../../ducks/form";
import { journalforingSelectors } from "../../../ducks/journalforing";
import { BOOLSK } from "../../../constants";

import "./dokumentetJournalføresPå.css";

const { BRUKER, VIRKSOMHET } = KV.Koder.JournalføringRolle;

const mapStateToProps = (state: RootState) => ({
  journalføresPå: formSelectors.JournalforingFormSelector(state).values?.journalføresPå,
  defaultBrukerID: journalforingSelectors.BrukerIDSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterFelt: (felt: string, verdi: string | boolean | null) => dispatch(change(KV.Form.JOURNALFORING, felt, verdi)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const DokumentetJournalføresPå = ({ journalføresPå, oppdaterFelt, defaultBrukerID }: PropsFromRedux) => {
  const handleClick = (event: SyntheticEvent<EventTarget>, value: string) => {
    oppdaterFelt("journalføresPå", value);
    if (value === BRUKER) {
      oppdaterFelt("ikkeSendForvaltingsmelding", BOOLSK.USANN);
      oppdaterFelt("brukerID", defaultBrukerID);
      oppdaterFelt("virksomhetOrgnr", null);
      oppdaterFelt("virksomhetNavn", null);
    } else {
      oppdaterFelt("ikkeSendForvaltingsmelding", BOOLSK.SANN);
      oppdaterFelt("brukerID", null);
      oppdaterFelt("brukerNavn", null);
    }
    oppdaterFelt("avsenderID", null);
    oppdaterFelt("avsenderNavn", null);
    oppdaterFelt("avsenderType", null);
  };
  return (
    <Komponent
      ikon={Ikoner.FindAccount}
      tittel="Hvem skal dokumentet journalføres på?"
      innhold={
        <Nav.RadioPanelGruppe
          name="journalføresPå"
          legend=""
          radios={[
            { label: BRUKER, value: BRUKER, id: BRUKER },
            { label: VIRKSOMHET, value: VIRKSOMHET, id: VIRKSOMHET },
          ]}
          checked={journalføresPå}
          onChange={handleClick}
          className="dokumentetJournalføresPå"
        />
      }
    />
  );
};

export default connector(DokumentetJournalføresPå);
