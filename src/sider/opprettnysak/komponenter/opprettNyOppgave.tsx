import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../melosyskodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";

export const OpprettNyOppgave = ({ behandlingsaarsakType }: { behandlingsaarsakType: string }) => (
  <>
    <Skjema.Datovelger
      feltNavn="mottaksdato"
      label={<Nav.Typo.Element>Mottaksdato</Nav.Typo.Element>}
      className="mottaksdato"
    />
    <Skjema.Select feltNavn="behandlingsaarsakType" label="Behandlingsårsak" bredde="m">
      {MKV.KTObjects.behandlinger.behandlingsaarsaktyper
        .filter((aarsak: KTObject) => aarsak.kode !== MKV.Koder.behandlinger.behandlingsaarsaktyper.ANNET)
        .map((aarsak: KTObject) => (
          <option key={aarsak.kode} value={aarsak.kode} label={aarsak.term || ""} />
        ))}
    </Skjema.Select>
    {behandlingsaarsakType === MKV.Koder.behandlinger.behandlingsaarsaktyper.FRITEKST && (
      <Skjema.Input feltNavn="behandlingsaarsakFritekst" label="Velg behandlingsårsak" />
    )}
  </>
);
