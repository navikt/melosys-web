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
import { EnkelNavBox } from "../../../felleskomponenter/enkelNavBox";
import { HStack } from "@navikt/ds-react";

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
  const handleClick = (value: string) => {
    oppdaterFelt("journalforingGjelder", value);
    oppdaterFelt(FormValues.sakstype, null);
    oppdaterFelt(FormValues.sakstema, null);
    oppdaterFelt(FormValues.behandlingstema, null);
    oppdaterFelt(FormValues.behandlingstype, null);
    oppdaterFelt(FormValues.opprettnysak_behandlingstema, null);
    oppdaterFelt(FormValues.opprettnysak_behandlingstype, null);
    if (value === BRUKER) {
      oppdaterFelt("forvaltningsmeldingMottaker", MKV.Koder.forvaltningsmeldingMottaker.BRUKER);
      oppdaterFelt("brukerID", journalpostBrukerID);
      oppdaterFelt("virksomhetOrgnr", null);
      oppdaterFelt("virksomhetNavn", null);
    } else {
      oppdaterFelt("forvaltningsmeldingMottaker", MKV.Koder.forvaltningsmeldingMottaker.INGEN);
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
        <Nav.RadioGroup
          onChange={handleClick}
          defaultValue={journalforingGjelder}
          legend=""
          hideLegend
          size="medium"
          className="horisontal_radiogruppe"
        >
          <HStack gap="3" justify="space-between">
            <EnkelNavBox focused={journalforingGjelder === BRUKER}>
              <Nav.Radio value={BRUKER} id={BRUKER}>
                {KV.kodeTilTerm(BRUKER, MKV.KTObjects.aktoersroller)}
              </Nav.Radio>
            </EnkelNavBox>
            <EnkelNavBox focused={journalforingGjelder === VIRKSOMHET}>
              <Nav.Radio value={VIRKSOMHET} id={VIRKSOMHET}>
                {KV.kodeTilTerm(VIRKSOMHET, MKV.KTObjects.aktoersroller)}
              </Nav.Radio>
            </EnkelNavBox>
          </HStack>
        </Nav.RadioGroup>
      }
    />
  );
};

export default connector(JournalforingGjelder);
