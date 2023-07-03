import { SyntheticEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";
import { change } from "redux-form";

import MKV from "../../../melosyskodeverk";
import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";

import Komponent from "./komponent";
import { formSelectors } from "../../../ducks/form";
import { journalforingSelectors } from "../../../ducks/journalforing";

import "./journalforingGjelder.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;
const { JOURNALFORING_VALUES: FormValues } = KV.Form;

const mapStateToProps = (state: RootState) => ({
  journalforingGjelder: formSelectors.JournalforingFormSelector(state).values?.journalforingGjelder,
  journalpostBrukerID: journalforingSelectors.BrukerIDSelector(state),
  journalpostVirksomhetOrgnr: journalforingSelectors.VirksomhetOrgnrSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterFelt: (felt: string, verdi: string | boolean | null) => dispatch(change(KV.Form.JOURNALFORING, felt, verdi)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const JournalforingGjelder = ({
  journalforingGjelder,
  oppdaterFelt,
  journalpostBrukerID,
  journalpostVirksomhetOrgnr,
}: PropsFromRedux) => {
  const handleClick = (event: SyntheticEvent<EventTarget>, value: string) => {
    oppdaterFelt("journalforingGjelder", value);
    oppdaterFelt(FormValues.sakstype, null);
    oppdaterFelt(FormValues.sakstema, null);
    oppdaterFelt(FormValues.behandlingstema, null);
    oppdaterFelt(FormValues.behandlingstype, null);
    oppdaterFelt(FormValues.opprettnysak_behandlingstema, null);
    oppdaterFelt(FormValues.opprettnysak_behandlingstype, null);
    if (value === BRUKER) {
      oppdaterFelt("ikkeSendForvaltingsmelding", false);
      oppdaterFelt("brukerID", journalpostBrukerID);
      oppdaterFelt("virksomhetOrgnr", null);
      oppdaterFelt("virksomhetNavn", null);
    } else {
      oppdaterFelt("ikkeSendForvaltingsmelding", true);
      oppdaterFelt("virksomhetOrgnr", journalpostVirksomhetOrgnr);
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
          name="journalforingGjelder"
          legend=""
          radios={[
            { label: KV.kodeTilTerm(BRUKER, MKV.KTObjects.aktoersroller), value: BRUKER, id: BRUKER },
            { label: KV.kodeTilTerm(VIRKSOMHET, MKV.KTObjects.aktoersroller), value: VIRKSOMHET, id: VIRKSOMHET },
          ]}
          checked={journalforingGjelder}
          onChange={handleClick}
          className="journalforingGjelder"
        />
      }
    />
  );
};

export default connector(JournalforingGjelder);
