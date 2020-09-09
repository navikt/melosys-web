import React, { useState } from 'react';
import { FysiskDokument } from 'Domene';

import * as Nav from '../../utils/navFrontend';
import * as Mui from '../ui';
import * as Ikoner from '../../resources/images';

import PdfLink, { lagPdfUrl } from './pdfLink';
import { formatterDatoTilNorsk } from '../../utils/dato';

import './VedleggVelger.css';

interface EnkeltVedleggProps {
  vedlegg: FysiskDokument,
  leggTilVedlegg: () => void,
  fjernVedlegg: () => void,
  slettVedlegg: () => void,
  vedleggErMarkert: boolean,
  redigerer: boolean,
}

const EnkeltVedlegg = ({
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

  const apnePdf = () => window.open(lagPdfUrl(vedlegg.journalpostID, vedlegg.dokumentID), '_blank');

  return (
    <tr>
      { redigerer ?
        <td>
          <Nav.Checkbox onChange={checkboxChangeHandler} checked={vedleggErMarkert} label="&nbsp;" />
        </td> : <td />
      }
      <td>
        <PdfLink
          journalpostID={vedlegg.journalpostID}
          dokumentID={vedlegg.dokumentID}
          tittel={vedlegg.tittel}
        />
      </td>
      <td>
        <span>{vedlegg.avsenderEllerMottaker}</span>
      </td>
      <td>
        <span>{formatterDatoTilNorsk(vedlegg.dato)}</span>
      </td>
      <td>
        <Mui.Knapp ikon={Ikoner.Eye} onClick={apnePdf} />
      </td>
      <td>
        { redigerer
          ? <span />
          : <Mui.Knapp type="flat" ikon={Ikoner.Bin} onClick={slettVedlegg} />
        }
      </td>
    </tr>
  );
};

interface VedleggListeProps {
  valgteVedlegg: FysiskDokument[],
  alleVedlegg: FysiskDokument[],
  redigerer: boolean,
  toggleRedigerer: () => void,
  setValgteVedlegg: (valgteVedlegg: FysiskDokument[]) => void,
}

const VedleggListe = ({
  valgteVedlegg,
  alleVedlegg,
  redigerer,
  toggleRedigerer,
  setValgteVedlegg,
}: VedleggListeProps) => {
  const [markerteVedlegg, setMarkerteVedlegg] = useState<string[]>([]);

  const markerVedlegg = (vedleggID: string) => setMarkerteVedlegg([...markerteVedlegg, vedleggID]);
  const fjernVedlegg = (vedleggID: string) => setMarkerteVedlegg([...markerteVedlegg.filter(id => id !== vedleggID)]);
  const vedleggErMarkert = (vedleggID: string) => markerteVedlegg.includes(vedleggID);

  const slettVedlegg = (vedleggID: string) => {
    fjernVedlegg(vedleggID);
    setValgteVedlegg(valgteVedlegg.filter(({ id }) => id !== vedleggID));
  };

  const leggTilMarkerteVedleggHandler = () => {
    setValgteVedlegg(alleVedlegg.filter(v => markerteVedlegg.includes(v.id)));
    toggleRedigerer();
  };

  const avbrytHandler = () => {
    setMarkerteVedlegg(valgteVedlegg.map(({ id }) => id));
    toggleRedigerer();
  };

  const alleVedleggErMarkert = alleVedlegg.every(({ id }) => markerteVedlegg.includes(id));

  const markerAlleVedlegg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setMarkerteVedlegg(alleVedlegg.map(({ id }) => id));
    } else {
      setMarkerteVedlegg([]);
    }
  };

  const hentGjeldendeVedlegg = () => (redigerer ? alleVedlegg : valgteVedlegg);

  return (
    <Nav.Row>
      <table className="vedleggvelger-tabell">
        <thead>
          <tr>
            <th />
            <th>
              <Nav.typo.Element>Dokument</Nav.typo.Element>
            </th>
            <th>
              <Nav.typo.Element>Avsender/Mottaker</Nav.typo.Element>
            </th>
            <th>
              <Nav.typo.Element>Dato</Nav.typo.Element>
            </th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          { redigerer &&
            <tr>
              <td colSpan={6}>
                <Nav.Checkbox
                  onChange={e => markerAlleVedlegg(e)}
                  label="Velg alle vedlegg"
                  checked={alleVedleggErMarkert}
                />
              </td>
            </tr>
          }
          {
            hentGjeldendeVedlegg().map(enkeltVedlegg =>
              <EnkeltVedlegg
                key={enkeltVedlegg.id}
                vedlegg={enkeltVedlegg}
                leggTilVedlegg={() => markerVedlegg(enkeltVedlegg.id)}
                fjernVedlegg={() => fjernVedlegg(enkeltVedlegg.id)}
                slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
                vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
                redigerer={redigerer}
              />)
          }
        </tbody>
      </table>
      { redigerer &&
        <>
          <Mui.Knapp onClick={leggTilMarkerteVedleggHandler} ikon={Ikoner.AddOne}>Legg til markerte vedlegg</Mui.Knapp>
          <Mui.Knapp onClick={avbrytHandler}>Avbryt</Mui.Knapp>
        </>
      }
    </Nav.Row>
  );
};

interface VedleggVelgerProps {
  dokumenter: FysiskDokument[],
  valgteVedlegg: FysiskDokument[],
  setValgteVedlegg: (valgteVedlegg: FysiskDokument[]) => void,
}

export const VedleggVelger = ({
  dokumenter,
  valgteVedlegg,
  setValgteVedlegg,
}: VedleggVelgerProps) => {
  const [redigerer, setRedigerer] = useState<boolean>(false);

  const toggleRedigerer = () => setRedigerer(!redigerer);

  const harValgteVedlegg = (valgteVedlegg && valgteVedlegg.length > 0);
  const skalViseVedleggListe = harValgteVedlegg || redigerer;

  return (
    <Nav.Row className="vedleggvelger">
      <Nav.typo.Undertittel>Vedlegg</Nav.typo.Undertittel>
      { skalViseVedleggListe &&
        <VedleggListe
          redigerer={redigerer}
          toggleRedigerer={toggleRedigerer}
          valgteVedlegg={valgteVedlegg}
          alleVedlegg={dokumenter}
          setValgteVedlegg={setValgteVedlegg}
        />
      }
      { !redigerer &&
        <Mui.Knapp onClick={() => toggleRedigerer()} ikon={Ikoner.AddOne}>Legg til vedlegg</Mui.Knapp>
      }
    </Nav.Row>
  );
};

