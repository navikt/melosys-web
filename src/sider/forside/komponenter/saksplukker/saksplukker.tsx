import { MouseEvent, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useSearchParams } from "react-router";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Nav from "../../../../navFrontend";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Routing from "../../../../url";
import { oppgaverOperations } from "../../../../ducks/oppgaver";

import saksplukkerSchema from "./saksplukkerSchema";
import { gyldigeValg, SaksplukkerFormData, TOMT_SKJEMA } from "./gyldigeValg";
import {
  useLovligeBehandlingstemaer,
  useLovligeSakstemaer,
  useLovligeSakstyper,
} from "../../../../services/api/lovligeKombinasjoner";
import "./saksplukker.less";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_PENSJONIST, MELOSYS_PENSJONIST_EØS } from "../../../../featuretoggle/toggleNavn";

const compareTerm = (a: KTObject, b: KTObject) => {
  if (!a.term) return 1;
  if (!b.term) return -1;

  return a.term.localeCompare(b.term);
};

const FELTER = ["sakstype", "sakstema", "behandlingstema"] as const;

export function Saksplukker() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visIngenOppgaveFunnetAlert, setVisIngenOppgaveFunnetAlert] = useState(false);
  const [antallOppgaver, setAntallOppgaver] = useState(0);
  const erPensjonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);
  const erPensjonistEØSToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST_EØS);

  const { control, handleSubmit, getValues, setValue, reset, watch } = useForm({
    resolver: yupResolver<FieldValues, unknown, FieldValues>(saksplukkerSchema),
    defaultValues: {
      sakstype: searchParams.get("sakstype") ?? "",
      sakstema: searchParams.get("sakstema") ?? "",
      behandlingstema: searchParams.get("behandlingstema") ?? "",
    },
  });
  const sakstype = watch("sakstype");
  const sakstema = watch("sakstema");
  const { data: muligeSakstyper } = useLovligeSakstyper();
  const { data: muligeSakstemaer } = useLovligeSakstemaer(sakstype);
  const { data: muligeBehandlingstemaer } = useLovligeBehandlingstemaer(sakstype, sakstema);

  const oppdaterUrl = () => {
    const verdier = getValues();
    const params = new URLSearchParams();
    FELTER.filter((felt) => verdier[felt]).forEach((felt) => params.set(felt, verdier[felt]));
    setSearchParams(params, { replace: true });
  };

  const tømFelter = (...felter: (keyof SaksplukkerFormData)[]) => {
    felter.forEach((felt) => setValue(felt, ""));
    oppdaterUrl();
  };

  // Forhåndsvalg fra URL-en kan være ulovlige. Valg gjort i skjemaet tømmer feltene under i onChange.
  useEffect(() => {
    const valg = getValues() as SaksplukkerFormData;
    const gyldige = gyldigeValg(valg, {
      sakstyper: muligeSakstyper,
      sakstemaer: muligeSakstemaer,
      behandlingstemaer: muligeBehandlingstemaer,
    });
    const ugyldigeFelter = FELTER.filter((felt) => gyldige[felt] !== valg[felt]);
    if (ugyldigeFelter.length > 0) {
      tømFelter(...ugyldigeFelter);
    }
  }, [muligeSakstyper, muligeSakstemaer, muligeBehandlingstemaer]);

  const plukkOgVideresend = async (formValues: FieldValues) => {
    const response = await oppgaverOperations.plukkSak(formValues);
    const { saksnummer, behandlingID, behandlingstema, behandlingstype, antallUtildelteOppgaver } = response;

    if (!saksnummer) {
      setAntallOppgaver(antallUtildelteOppgaver);
      setVisIngenOppgaveFunnetAlert(true);
    } else {
      const redirectURL = Routing.lagUrl(
        saksnummer,
        behandlingID,
        formValues.sakstype,
        formValues.sakstema,
        behandlingstema,
        behandlingstype,
        erPensjonistToggleEnabled,
        erPensjonistEØSToggleEnabled,
      );

      navigate(redirectURL);
    }
  };

  const nullstill = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setVisIngenOppgaveFunnetAlert(false);
    reset(TOMT_SKJEMA);
    oppdaterUrl();
  };

  return (
    <div className="panel saksplukker">
      <Nav.Heading size="small">Behandle sak</Nav.Heading>
      <p>Velg sakstype, saks- og behandlingstema for å få tildelt en sak.</p>

      <form className="saksplukker__skjema" onSubmit={handleSubmit(plukkOgVideresend)}>
        <Nav.Row>
          <Nav.Column md="12" lg="4">
            <Forms.Select
              name="sakstype"
              control={control}
              label="Sakstype"
              emptyFieldDisabled
              onChange={() => tømFelter("sakstema", "behandlingstema")}
            >
              {(muligeSakstyper ?? []).map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
          <Nav.Column md="12" lg="4">
            <Forms.Select
              name="sakstema"
              control={control}
              label="Sakstema"
              emptyFieldDisabled
              onChange={() => tømFelter("behandlingstema")}
            >
              {(muligeSakstemaer ?? []).map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
          <Nav.Column md="12" lg="4">
            <Forms.Select
              name="behandlingstema"
              control={control}
              label="Behandlingstema"
              emptyFieldDisabled
              onChange={oppdaterUrl}
            >
              {[...(muligeBehandlingstemaer ?? [])].sort(compareTerm).map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
        {visIngenOppgaveFunnetAlert && (
          <Nav.Row>
            <Nav.Column md="12">
              <Nav.Alert variant="warning">
                Det fins ingen saker for valgt type/tema kombinasjon blant de {antallOppgaver} eldste sakene
              </Nav.Alert>
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row className="saksplukker__knapperad">
          <Nav.Column xs="12">
            <Nav.Button variant="secondary">Behandle sak</Nav.Button>
            <Nav.Button variant="tertiary" onClick={nullstill}>
              Nullstill
            </Nav.Button>
          </Nav.Column>
        </Nav.Row>
      </form>
    </div>
  );
}

export default Saksplukker;
