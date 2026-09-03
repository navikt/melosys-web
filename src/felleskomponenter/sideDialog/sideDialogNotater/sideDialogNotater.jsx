import { useCallback, useEffect, useState } from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";

import MKV from "../../../melosyskodeverk";
import Notat from "./notat";
import Knapperad from "../../knapperad";

import "./sideDialogNotater.less";

const sortNotaterByOpprettetDato = (forsteNotat, andreNotat) => {
  const { endretDato: forsteEndretDato } = forsteNotat;
  const { endretDato: andreEndretDato } = andreNotat;

  const datoDiff = Utils.dato.datoDiffPure(forsteEndretDato, andreEndretDato, "seconds");
  return -datoDiff;
};

const lagNotatOverskrift = (behandlingstype, behandlingstema) => {
  const behandlingstypeString = KV.kodeTilTerm(behandlingstype, MKV.KTObjects.behandlinger.behandlingstyper);
  const behandlingstemaString = KV.kodeTilTerm(behandlingstema, MKV.KTObjects.behandlinger.behandlingstema);

  return `${behandlingstypeString} - ${behandlingstemaString}`;
};

function SideDialogNotater({ saksnummer, behandlingID, redigerbart }) {
  const [notater, setNotater] = useState([]);
  const [leggTilNotatDialogSynlig, setLeggTilNotatDialogSynlig] = useState(false);
  const [nyttNotatTekst, setNyttNotatTekst] = useState("");
  const [nyttNotatFeilmelding, setNyttNotatFeilmelding] = useState("");

  const hentNotater = useCallback(async () => {
    const hentedeNotater = await Api.Fagsaker.notater.hent(saksnummer);
    setNotater(hentedeNotater);
  }, [saksnummer]);

  useEffect(() => {
    hentNotater();
  }, [hentNotater]);

  const maksTekstLengde = 500;
  const disableLagreKnapp = nyttNotatTekst.length > maksTekstLengde;

  const oppdaterNotatState = (oppdatertNotat) => {
    setNotater((prevNotater) =>
      prevNotater.map((notat) => (notat.notatId === oppdatertNotat.notatId ? oppdatertNotat : notat)),
    );
  };

  const leggTilNotatState = (nyttNotat) => {
    setNotater((prevNotater) => [...prevNotater, nyttNotat]);
  };

  const oppdaterNotat = async (notatID, tekst) => {
    const oppdatertNotat = await Api.Fagsaker.notater.oppdater(saksnummer, notatID, { tekst });
    oppdaterNotatState(oppdatertNotat);
  };

  const visLeggTilNotatDialog = () => {
    setLeggTilNotatDialogSynlig(true);
  };

  const skjulLeggTilNotatDialog = () => {
    setLeggTilNotatDialogSynlig(false);
  };

  const avbrytLeggTilNotat = () => {
    skjulLeggTilNotatDialog();
    setNyttNotatTekst("");
    setNyttNotatFeilmelding("");
  };

  const endreNyttNotatTekst = (e) => {
    setNyttNotatTekst(e.target.value);
  };

  const opprettNotat = async () => {
    if (Utils._isEmpty(nyttNotatTekst)) return;

    setNyttNotatFeilmelding("");

    try {
      // behandlingId angir hvilken behandling notatet gjelder, slik at det havner på riktig behandling
      // når saken har flere aktive (f.eks. ny vurdering og årsavregning samtidig).
      const nyttNotat = await Api.Fagsaker.notater.opprett(saksnummer, {
        tekst: nyttNotatTekst,
        ...(behandlingID !== undefined && behandlingID !== null && { behandlingId: behandlingID }),
      });

      leggTilNotatState(nyttNotat);
      skjulLeggTilNotatDialog();
      setNyttNotatTekst("");
    } catch (e) {
      if (e.status >= 500) {
        setNyttNotatFeilmelding(
          "Det oppsto en teknisk feil. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger.",
        );
      } else if (e.status >= 400) {
        setNyttNotatFeilmelding(e.body.message);
      }
    }
  };

  const skrivInnNotatLabel =
    "Her kan du notere særlige vurderinger eller handlinger du gjør, for eksempel at du innhenter opplysninger. Notater brukes for å holde oversikt over hva som er gjort i saken, men lagres ikke som saksdokumenter.";

  return (
    <div className="panel">
      {notater.length > 0 && (
        <div className="sidedialog-notater__notater">
          {notater.sort(sortNotaterByOpprettetDato).map((notat) => {
            const overskrift = lagNotatOverskrift(notat.behandlingstypeKode, notat.behandlingstemaKode);
            const onUpdate = (tekst) => oppdaterNotat(notat.notatId, tekst);

            return (
              <Notat
                key={Utils._uuid()}
                redigerbart={notat.redigerbar}
                tekst={notat.tekst}
                opprettetDato={notat.registrertDato}
                endretDato={notat.endretDato}
                forfatter={notat.registrertAvNavn}
                onUpdate={onUpdate}
                overskrift={overskrift}
                maksTekstLengde={maksTekstLengde}
              />
            );
          })}
        </div>
      )}
      <div>
        {leggTilNotatDialogSynlig && (
          <>
            <Nav.Textarea
              label="Notat"
              description={skrivInnNotatLabel}
              value={nyttNotatTekst}
              onChange={endreNyttNotatTekst}
              maxLength={500}
            />
            <Knapperad
              avbryt={avbrytLeggTilNotat}
              avbrytTekst="Avbryt"
              bekreft={opprettNotat}
              bekreftTekst="Lagre notat"
              bekreftRedigerbart={!disableLagreKnapp}
              redigerbart
            />
            <div role="alert" className="sidedialog-notater__nytt-notat-feilmelding">
              {nyttNotatFeilmelding && <Nav.ErrorMessage>{nyttNotatFeilmelding}</Nav.ErrorMessage>}
            </div>
          </>
        )}
        {!leggTilNotatDialogSynlig && (
          <Nav.Button disabled={!redigerbart} variant="primary" onClick={visLeggTilNotatDialog}>
            Legg til nytt notat
          </Nav.Button>
        )}
      </div>
    </div>
  );
}

SideDialogNotater.propTypes = {
  saksnummer: PT.string.isRequired,
  behandlingID: PT.number,
  redigerbart: PT.bool.isRequired,
};

export default SideDialogNotater;
