import { Dispatch, useEffect, useState } from "react";
import { connect } from "react-redux";
import { change, FormAction } from "redux-form";
import { KTObject } from "@navikt/melosys-kodeverk";
import { useDispatch } from "../../hooks";

import * as Skjema from "../skjema";
import * as Nav from "../../navFrontend";
import { journalforingOperations, journalforingTypes, PrepareKnyttTilSakFormResult } from "../../ducks/journalforing";
import * as Utils from "../../utils";

import "./knyttTilSak.less";
import { harFlerePågåendeBehandlinger } from "../../melosyskodeverk/utils";
import MKV from "../../melosyskodeverk/index.js";

type Sak = journalforingTypes.Sak;
type FeltNavn = journalforingTypes.FeltNavn;

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
  // Første behandling (eldste) skal være førende for behandlingstema ved årsavregning
  const førsteBehandling = behandlingOversikter[behandlingOversikter.length - 1];
  const dispatch = useDispatch();

  // Sjekk om det er andregangsbehandling (saken har eksisterende behandlinger)
  const erAndregangsbehandling = (behandlingOversikter?.length ?? 0) > 0;

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

  // Sjekk om valgt behandlingstype er årsavregning, eller om årsavregning er eneste valg
  const kunÅrsavregningTilgjengelig =
    state.muligeBehandlingstyper.length === 1 &&
    state.muligeBehandlingstyper[0]?.kode === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING;
  const erÅrsavregning =
    behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING || kunÅrsavregningTilgjengelig;

  // Behandlingstema skal låses ved årsavregning på sak med eksisterende behandlinger
  const erAndregangsÅrsavregning = erAndregangsbehandling && erÅrsavregning;

  // Hovedeffect: Kaller operasjonen når sak eller journalforingGjelder endres
  useEffect(() => {
    let isMounted = true;
    setState((prev) => ({ ...prev, isLoading: true }));

    (
      dispatch(
        journalforingOperations.prepareKnyttTilSakForm(sak, erJournalføring, journalforingGjelder as string, feltNavn),
      ) as Promise<PrepareKnyttTilSakFormResult>
    )
      .then((result: PrepareKnyttTilSakFormResult) => {
        if (!isMounted) return; // Ignorer resultatet hvis komponenten er unmounted
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
      })
      .catch((error) => {
        if (!isMounted) return; // Ignorer feil hvis komponenten er unmounted
        // eslint-disable-next-line no-console
        console.error("Feil ved lasting av saksdata:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      });

    return () => {
      isMounted = false; // Marker komponenten som unmounted
    };
  }, [sak.saksnummer, journalforingGjelder, erJournalføring, feltNavn, dispatch]);

  // Håndterer brukerinteraksjoner: Oppdatering av behandlingstema
  useEffect(() => {
    // Ved årsavregning på andregangsbehandling: Tving arv av behandlingstema fra første behandling
    if (opprettBehandling && erAndregangsÅrsavregning && førsteBehandling?.behandlingstema?.kode) {
      if (behandlingstema !== førsteBehandling.behandlingstema.kode) {
        changeField(feltNavn.formNavn, feltNavn.behandlingstema, førsteBehandling.behandlingstema.kode);
      }
    }
    // Nullstill behandlingstype når opprettBehandling er false
    if (!opprettBehandling && !Utils._isEmpty(behandlingstype)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    }
  }, [opprettBehandling, behandlingstype, erAndregangsÅrsavregning]);

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

  if (state.isLoading) {
    return (
      <div className="knyttTilSak__behandlingspanel">
        <Nav.Loader size="large" title="Laster saksdata..." />
      </div>
    );
  }

  if (state.sakKanIkkeViderebehandles) {
    return (
      <div className="knyttTilSak__behandlingspanel">
        {erJournalføring ? (
          <Nav.Alert variant="info" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er
            opphørt/henlagt/bortfalt/annullert/videresendt i Melosys, men du kan knytte dokumentet til den avsluttede
            behandlingen
          </Nav.Alert>
        ) : (
          <Nav.Alert variant="warning" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er
            opphørt/henlagt/bortfalt/annullert/videresendt i Melosys
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
              disabled={state.harBehandlingMedTrygdeavgift || erAndregangsÅrsavregning}
              className={state.harBehandlingMedTrygdeavgift || erAndregangsÅrsavregning ? "select__slim" : undefined}
            >
              {state.muligeBehandlingstemaer?.map((elem) => (
                <option key={elem.kode} value={elem.kode} label={elem.term ?? undefined} />
              ))}
            </Skjema.Select>
            {(state.harBehandlingMedTrygdeavgift || erAndregangsÅrsavregning) && (
              <Nav.Detail className="behandlingstema__label">
                Du kan ikke endre behandlingstema når saken har en tilknyttet fakturaserie eller en eksisterende
                behandling.
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
