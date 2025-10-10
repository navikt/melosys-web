import { Dispatch, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { change, FormAction } from "redux-form";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import { journalforingOperations } from "../../../ducks/journalforing";
import * as Utils from "../../../utils";

import "./knyttTilSak.less";
import { harFlerePågåendeBehandlinger } from "../../../melosyskodeverk/utils";
import MKV from "../../../melosyskodeverk/index.js";
import { BehandlingOversikt } from "../../../services/modules/types/fagsak";

export interface Sak {
  saksnummer: string;
  sakstype: KTObject;
  sakstema: KTObject;
  saksstatus: KTObject;
  behandlingOversikter: BehandlingOversikt[];
}

export interface FeltNavn {
  formNavn: string;
  opprettBehandling: string;
  behandlingstema: string;
  behandlingstype: string;
  hovedpart: string;
}

export interface KnyttTilSakProps {
  sak: Sak;
  erJournalføring: boolean;
  changeField: (formNavn: string, feltNavn: string, verdi: unknown) => void;
  feltNavn: FeltNavn;
  formValues: {
    [key: string]: unknown;
  };
}

interface KnyttTilSakState {
  muligeBehandlingstemaer: KTObject[];
  muligeBehandlingstyper: KTObject[];
  harBehandlingMedTrygdeavgift: boolean;
  sisteBehandlingErInaktiv: boolean;
  sakKanIkkeViderebehandles: boolean;
  sisteBehandlingErPågåendeArtikkel16Sak: boolean;
  sisteBehandlingKanOpprettesAndregangsbehandlingPå: boolean;
  isLoading: boolean;
}

interface PrepareKnyttTilSakFormResult {
  muligeBehandlingstemaer: KTObject[];
  muligeBehandlingstyper: KTObject[];
  harBehandlingMedTrygdeavgift: boolean;
  sisteBehandlingErInaktiv?: boolean;
  sakKanIkkeViderebehandles?: boolean;
  sisteBehandlingErPågåendeArtikkel16Sak?: boolean;
  sisteBehandlingKanOpprettesAndregangsbehandlingPå?: boolean;
}

export function KnyttTilSak(props: KnyttTilSakProps) {
  const { sak, erJournalføring, changeField, feltNavn, formValues } = props;
  const { behandlingstema, behandlingstype, journalforingGjelder, opprettBehandling } = {
    opprettBehandling: formValues[feltNavn.opprettBehandling],
    behandlingstema: formValues[feltNavn.behandlingstema],
    behandlingstype: formValues[feltNavn.behandlingstype],
    journalforingGjelder: formValues[feltNavn.hovedpart],
  };
  const { behandlingOversikter, sakstype } = sak;
  const sisteBehandling = behandlingOversikter[0];
  const dispatch = useDispatch();

  // State for data fra operasjonen
  const [state, setState] = useState<KnyttTilSakState>({
    muligeBehandlingstemaer: [],
    muligeBehandlingstyper: [],
    harBehandlingMedTrygdeavgift: false,
    sisteBehandlingErInaktiv: false,
    sakKanIkkeViderebehandles: false,
    sisteBehandlingErPågåendeArtikkel16Sak: false,
    sisteBehandlingKanOpprettesAndregangsbehandlingPå: false,
    isLoading: true,
  });

  // Hovedeffect: Kaller operasjonen når sak eller journalforingGjelder endres
  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Thunk operation - dispatch returnerer Promise
    const thunk = journalforingOperations.prepareKnyttTilSakForm(
      sak,
      erJournalføring,
      journalforingGjelder as string,
      feltNavn,
    );

    // Type assertion for thunk dispatch som returnerer Promise
    const dispatchResult = dispatch(thunk as never) as Promise<PrepareKnyttTilSakFormResult>;

    dispatchResult.then((result: PrepareKnyttTilSakFormResult) => {
      setState({
        muligeBehandlingstemaer: result.muligeBehandlingstemaer || [],
        muligeBehandlingstyper: result.muligeBehandlingstyper || [],
        harBehandlingMedTrygdeavgift: result.harBehandlingMedTrygdeavgift || false,
        sisteBehandlingErInaktiv: result.sisteBehandlingErInaktiv || false,
        sakKanIkkeViderebehandles: result.sakKanIkkeViderebehandles || false,
        sisteBehandlingErPågåendeArtikkel16Sak: result.sisteBehandlingErPågåendeArtikkel16Sak || false,
        sisteBehandlingKanOpprettesAndregangsbehandlingPå:
          result.sisteBehandlingKanOpprettesAndregangsbehandlingPå || false,
        isLoading: false,
      });
    });
  }, [sak.saksnummer, journalforingGjelder, erJournalføring, feltNavn, dispatch]);

  // Håndterer brukerinteraksjoner: Oppdatering av behandlingstema
  useEffect(() => {
    if (opprettBehandling && Utils._isEmpty(behandlingstema)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, sisteBehandling.behandlingstema.kode);
    }
    // Nullstill behandlingstype når opprettBehandling er false
    if (!opprettBehandling && !Utils._isEmpty(behandlingstype)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    }
  }, [opprettBehandling]);

  // Cleanup ved unmount
  useEffect(() => {
    return () => {
      if (erJournalføring) changeField(feltNavn.formNavn, "vurderDokument", undefined);
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, undefined);
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    };
  }, []);

  function VurderDokumentCheckbox() {
    return <Skjema.Checkbox feltNavn="vurderDokument" label={`Oppdater behandlingsstatus til "Vurder dokument"`} />;
  }

  if (state.sakKanIkkeViderebehandles) {
    return (
      <div className="knyttTilSak__behandlingspanel">
        {erJournalføring ? (
          <Nav.Alert variant="info" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er opphørt/henlagt/bortfalt/annullert i
            Melosys, men du kan knytte dokumentet til den avsluttede behandlingen
          </Nav.Alert>
        ) : (
          <Nav.Alert variant="warning" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er opphørt/henlagt/bortfalt/annullert i
            Melosys
          </Nav.Alert>
        )}
      </div>
    );
  }

  if (state.sisteBehandlingKanOpprettesAndregangsbehandlingPå) {
    return (
      <div className="knyttTilSak__panelramme">
        {state.sisteBehandlingErPågåendeArtikkel16Sak && (
          <Nav.Alert variant="warning" className="anmodningSvarSendt">
            Hvis du har mottatt svar på anmodning om unntak skal du <b>ikke</b> opprette en ny behandling.
          </Nav.Alert>
        )}
        {state.sisteBehandlingErInaktiv && (
          <Nav.Alert variant="info" className="tidligereBehandlingAvsluttet">
            Tidligere behandling er avsluttet.
          </Nav.Alert>
        )}

        {erJournalføring && (
          <div className="panelElement">
            <Nav.Heading size="xsmall" className="overskrift">
              Velg hva du vil gjøre med dokumentet
            </Nav.Heading>
            <Skjema.RadioGroup legend="" name={feltNavn.opprettBehandling}>
              <Nav.Radio value>Opprett ny behandling</Nav.Radio>
              <Nav.Radio value={false}>Uten å opprette behandling</Nav.Radio>
            </Skjema.RadioGroup>
          </div>
        )}
        {(opprettBehandling as boolean) && (
          <div className="panelElement">
            <Nav.Heading size="xsmall" className="overskrift">
              Velg tema og type for ny behandling
            </Nav.Heading>
            <Skjema.Select
              feltNavn={feltNavn.behandlingstema}
              label="Behandlingstema"
              emptyFieldDisabled={!!(behandlingstema as { kode?: string })?.kode}
              disabled={state.harBehandlingMedTrygdeavgift}
              className={state.harBehandlingMedTrygdeavgift ? "select__slim" : undefined}
            >
              {state.muligeBehandlingstemaer?.map((elem) => (
                <option key={elem.kode} value={elem.kode} label={elem.term ?? undefined} />
              ))}
            </Skjema.Select>
            {state.harBehandlingMedTrygdeavgift && (
              <Nav.Detail className="behandlingstema__label">
                Du kan ikke endre behandlingstema når saken har en tilknyttet fakturaserie.
              </Nav.Detail>
            )}
            <Skjema.RadioGroup legend="Behandlingstype" name={feltNavn.behandlingstype}>
              {state.muligeBehandlingstyper?.map((elem) => (
                <Nav.Radio key={elem.kode} value={elem.kode}>
                  {elem.term}
                </Nav.Radio>
              ))}
            </Skjema.RadioGroup>
          </div>
        )}
        {opprettBehandling === false && state.sisteBehandlingErPågåendeArtikkel16Sak && (
          <div className="panelElement vurderDokument">
            <VurderDokumentCheckbox />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {erJournalføring && !harFlerePågåendeBehandlinger(behandlingOversikter.map((b) => b.behandlingsstatus.kode)) && (
        <div className="knyttTilSak__behandlingspanel">
          <VurderDokumentCheckbox />
        </div>
      )}

      {!erJournalføring && sakstype.kode !== MKV.Koder.sakstyper.FTRL && (
        <div className="knyttTilSak__behandlingspanel">
          <Nav.Alert variant="warning" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling
          </Nav.Alert>
        </div>
      )}
    </>
  );
}

const mapDispatchToProps = (dispatch: Dispatch<FormAction>) => ({
  changeField: (feltNavn: string, felt: string, verdi: unknown) => dispatch(change(feltNavn, felt, verdi)),
});

export default connect(null, mapDispatchToProps)(KnyttTilSak);
