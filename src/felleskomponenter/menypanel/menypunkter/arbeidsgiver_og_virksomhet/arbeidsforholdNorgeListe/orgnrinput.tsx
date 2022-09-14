import React, { useState, useEffect } from "react";
import * as Nav from "../../../../../navFrontend";
import { Organisasjon } from "../../../../../services/api";
import EnkelFellesInputFnrDnrOrgnrSaksnr from "../../../../enkeltInputFnrDnrOrgnr";

const Orgnrinput = ({
  onOrgnrFunnet,
  redigerbart,
  hentOrganisasjon,
  valideringer,
  defaultOrgnr = "",
  hentVedMount = false,
  ikkeFunnetFeilmelding = "Kunne ikke finne organisasjon",
  feilVedHentingFeilmelding = "Feil ved henting av organisasjon",
}: OrgnrinputProps) => {
  const [orgnr, setOrgnr] = useState<string>(defaultOrgnr);
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const [hasFocus, setHasFocus] = useState<boolean>(false);

  const valider = (organisasjonsnummer: string) => {
    const utlostValidering = valideringer.find(({ validering }) => validering(organisasjonsnummer));

    if (utlostValidering) {
      setFeil(utlostValidering.feilmelding);
    }

    return !utlostValidering;
  };

  const leggTilOrg = async (tillagtOrgnr: string) => {
    if (!valider(tillagtOrgnr)) return;
    const action = await hentOrganisasjon(tillagtOrgnr);
    const { data } = action;
    const organisasjon = data;
    const orgFunnet = organisasjon.orgnr;
    const httpStatus = !orgFunnet && data.response.status;
    if (orgFunnet) {
      onOrgnrFunnet(organisasjon);
    } else if (httpStatus === 404) {
      setFeil(ikkeFunnetFeilmelding);
    } else {
      setFeil(feilVedHentingFeilmelding);
    }
  };

  useEffect(() => {
    if (hentVedMount) {
      leggTilOrg(orgnr);
    }
  }, [hentVedMount]);

  const onChange = (sokStreng: string) => {
    setFeil(undefined);
    setOrgnr(sokStreng);
    leggTilOrg(sokStreng);
  };

  return (
    <div>
      <EnkelFellesInputFnrDnrOrgnrSaksnr
        label={<Nav.Typo.Element>Organisasjonsnummer</Nav.Typo.Element>}
        vedEndring={onChange}
        value={orgnr}
        disabled={!redigerbart}
        bredde="fullbredde"
        placeholder="Skriv inn..."
        feil={!hasFocus && feil ? feil : undefined}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
      />
    </div>
  );
};

interface OrgnrinputProps {
  onOrgnrFunnet: (org: Organisasjon) => void;
  redigerbart: boolean;
  hentOrganisasjon: (orgNr: string) => Promise<any>;
  defaultOrgnr?: string;
  hentVedMount?: boolean;
  ikkeFunnetFeilmelding?: string;
  feilVedHentingFeilmelding?: string;
  valideringer: ValideringProps[];
}

interface ValideringProps {
  validering: (validering: string) => void;
  feilmelding: string;
}

export default Orgnrinput;
