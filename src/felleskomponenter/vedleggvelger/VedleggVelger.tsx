import React, { useState } from "react";
import classNames from "classnames";
import { FysiskDokument } from "Domene";

import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";

import PdfLink, { lagPdfUrl } from "../pdfLink";

import "./VedleggVelger.css";

interface EnkeltVedleggProps {
  vedlegg: FysiskDokument;
  leggTilVedlegg: () => void;
  fjernVedlegg: () => void;
  slettVedlegg: () => void;
  vedleggErMarkert: boolean;
  redigerer: boolean;
}

export const EnkeltVedlegg = ({
  vedlegg,
  leggTilVedlegg,
  fjernVedlegg,
  slettVedlegg,
  vedleggErMarkert,
  redigerer,
}: EnkeltVedleggProps) => {
  const checkboxChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      leggTilVedlegg();
    } else {
      fjernVedlegg();
    }
  };

  const apnePdf = () => window.open(lagPdfUrl(vedlegg.journalpostID, vedlegg.dokumentID), "_blank");

  const cls = classNames({
    "enkeltvedlegg--border-bottom": !redigerer,
  });

  return (
    <tr className={cls}>
      {redigerer ? (
        <td>
          <Nav.Checkbox onChange={checkboxChangeHandler} checked={vedleggErMarkert} label="&nbsp;" />
        </td>
      ) : (
        <td />
      )}
      <td>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </td>
      <td>
        <span>{vedlegg.avsenderEllerMottaker}</span>
      </td>
      <td>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </td>
      <td>
        <Mui.Knapp ikon={Ikoner.Eye} onClick={apnePdf} />
      </td>
      <td>{!redigerer && <Mui.Knapp type="flat" ikon={Ikoner.Bin} onClick={slettVedlegg} />}</td>
    </tr>
  );
};

interface VedleggListeProps {
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  redigerer: boolean;
  onAvbryt: () => void;
  onLeggTil: (markerteVedlegg: string[]) => void;
  onSlettVedlegg: (vedleggID: string) => void;
}

export const VedleggListe = ({
  valgteVedlegg,
  alleVedlegg,
  redigerer,
  onAvbryt,
  onLeggTil,
  onSlettVedlegg,
}: VedleggListeProps) => {
  const [markerteVedlegg, setMarkerteVedlegg] = useState<string[]>(valgteVedlegg.map(({ id }) => id));

  const markerVedlegg = (vedleggID: string) => setMarkerteVedlegg([...markerteVedlegg, vedleggID]);
  const fjernVedlegg = (vedleggID: string) => setMarkerteVedlegg([...markerteVedlegg.filter((id) => id !== vedleggID)]);
  const vedleggErMarkert = (vedleggID: string) => markerteVedlegg.includes(vedleggID);

  const slettVedlegg = (vedleggID: string) => {
    fjernVedlegg(vedleggID);
    onSlettVedlegg(vedleggID);
  };

  const leggTilMarkerteVedleggHandler = () => {
    onLeggTil(markerteVedlegg);
  };

  const avbrytHandler = () => {
    setMarkerteVedlegg(valgteVedlegg.map(({ id }) => id));
    onAvbryt();
  };

  const hentGjeldendeVedlegg = () => (redigerer ? alleVedlegg : valgteVedlegg);

  return (
    <Nav.Row className="vedleggliste">
      <table className="vedleggvelger-tabell">
        <thead>
          <tr>
            <th aria-label="Checkbox for å inkludere vedlegg" />
            <th>
              <Nav.Typo.Element>Dokument</Nav.Typo.Element>
            </th>
            <th>
              <Nav.Typo.Element>Avsender/Mottaker</Nav.Typo.Element>
            </th>
            <th>
              <Nav.Typo.Element>Dato</Nav.Typo.Element>
            </th>
            <th aria-label="Knapp for å åpne vedlegg" />
            <th aria-label="Knapp for å slette vedlegg" />
          </tr>
        </thead>
        <tbody>
          {hentGjeldendeVedlegg().map((enkeltVedlegg) => (
            <EnkeltVedlegg
              key={enkeltVedlegg.id}
              vedlegg={enkeltVedlegg}
              leggTilVedlegg={() => markerVedlegg(enkeltVedlegg.id)}
              fjernVedlegg={() => fjernVedlegg(enkeltVedlegg.id)}
              slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
              vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
              redigerer={redigerer}
            />
          ))}
        </tbody>
      </table>
      {redigerer && (
        <>
          <Mui.Knapp
            noTextTransform
            className="legg-til-markerte-vedlegg-knapp"
            onClick={leggTilMarkerteVedleggHandler}
            ikon={Ikoner.AddOne}
          >
            Lagre markerte vedlegg
          </Mui.Knapp>
          <Mui.Knapp noTextTransform className="avbryt-knapp" onClick={avbrytHandler}>
            Avbryt
          </Mui.Knapp>
        </>
      )}
    </Nav.Row>
  );
};

interface VedleggVelgerProps {
  dokumenter: FysiskDokument[];
  valgteVedlegg: FysiskDokument[];
  onChange: (valgteVedlegg: FysiskDokument[]) => void;
  className?: string;
}

const VedleggVelger = ({ dokumenter, valgteVedlegg, onChange, className }: VedleggVelgerProps) => {
  const [redigerer, setRedigerer] = useState<boolean>(false);

  const toggleRedigerer = () => setRedigerer(!redigerer);

  const harValgteVedlegg = valgteVedlegg && valgteVedlegg.length > 0;
  const skalViseVedleggListe = harValgteVedlegg || redigerer;

  const onAvbrytHandler = () => {
    toggleRedigerer();
  };

  const onLeggTilHandler = (markerteVedlegg: string[]) => {
    toggleRedigerer();
    onChange(dokumenter.filter((v) => markerteVedlegg.includes(v.id)));
  };

  const onSlettVedleggHandler = (vedleggID: string) => {
    onChange(valgteVedlegg.filter(({ id }) => id !== vedleggID));
  };

  const cls = classNames(className, "vedleggvelger");

  return (
    <Nav.Row className={cls}>
      {skalViseVedleggListe && (
        <VedleggListe
          redigerer={redigerer}
          onAvbryt={onAvbrytHandler}
          onLeggTil={onLeggTilHandler}
          onSlettVedlegg={onSlettVedleggHandler}
          valgteVedlegg={valgteVedlegg}
          alleVedlegg={dokumenter}
        />
      )}
      {!redigerer && (
        <Mui.Knapp
          noTextTransform
          className="legg-til-vedlegg-knapp"
          onClick={() => toggleRedigerer()}
          ikon={Ikoner.AddOne}
        >
          {valgteVedlegg.length === 0 ? "Legg til vedlegg" : "Legg til andre vedlegg"}
        </Mui.Knapp>
      )}
    </Nav.Row>
  );
};

export default VedleggVelger;
