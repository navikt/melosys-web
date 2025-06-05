import { useCallback, useEffect, useState } from "react";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";
import * as Utils from "../../../../../utils";
import * as Ikoner from "../../../../../resources/images";

import * as Mui from "../../../../ui";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";
import { normalizeDate } from "../../../../../utils/normalisering";
import { hentSammensattNavn } from "../../../../../graphql/navn";

import "./redigerer.css";

function Redigerer({
  redigerbart,
  overordnetFeltNavn,
  slett,
  settVerdi,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.MedfolgendeFamilie>) {
  const [disableNavnInput, setDisableNavnInput] = useState(false);
  const [visNavnSpinner, setVisNavnSpinner] = useState(false);

  const hentNavn = async (idNummer: string) => {
    if (Utils.person.erGyldigFnr(idNummer) || Utils.person.erGyldigDnr(idNummer)) {
      setVisNavnSpinner(true);
      setDisableNavnInput(true);

      try {
        const sammensattNavn = await hentSammensattNavn(idNummer);
        settVerdi("navn", sammensattNavn);
      } catch (e) {
        setDisableNavnInput(false);
      }

      setVisNavnSpinner(false);
    }
  };

  const idNummerChangeHandler = async (ident: string) => {
    setDisableNavnInput(false);
    hentNavn(ident);
  };

  useEffect(() => {
    if (verdier.fnr) {
      hentNavn(verdier.fnr.toString());
    }
  }, []);

  const debounceNormalizeDate = useCallback(
    Utils._debounce((fnr: any) => settVerdi("fnr", normalizeDate(fnr)), 800),
    [],
  );

  useEffect(() => {
    if (verdier.fnr) {
      debounceNormalizeDate(verdier.fnr);
    }
  }, [verdier?.fnr]);

  return (
    <Nav.Row className="medfolgende-familie__redigerer">
      <Nav.Column xs="5">
        <Skjema.FellesInputFnrDnrOrgnrSaksnr
          label="F.nr./d-nr./fødselsdato"
          feltNavn={`${overordnetFeltNavn}.fnr`}
          disabled={!redigerbart}
          onChange={idNummerChangeHandler}
        />
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.Input
          label="Fullt navn"
          feltNavn={`${overordnetFeltNavn}.navn`}
          disabled={!redigerbart || disableNavnInput}
        />
        {visNavnSpinner && <Nav.Loader className="navn-spinner" />}
      </Nav.Column>
      <Nav.Column xs="2" className="slett__symbol">
        <Mui.IkonKnapp ariaLabel="Slett barn" ikon={Ikoner.Bin} onClick={slett} />
      </Nav.Column>
    </Nav.Row>
  );
}

export default Redigerer;
