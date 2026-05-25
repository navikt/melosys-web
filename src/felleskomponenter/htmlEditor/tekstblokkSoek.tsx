import { BodyShort, Popover, Tabs, UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import { useMemo, useRef, useState } from "react";

import * as Nav from "../../navFrontend";
import { useFiltrerteTekstblokker, useTekstblokker } from "../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType } from "../../services/modules/tekstblokker";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import "./tekstblokkSoek.less";

interface Props {
  onVelg: (html: string) => void;
  disabled?: boolean;
}

const MAKS_SYNLIG = 8;

function TekstblokkSoek({ onVelg, disabled }: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  if (!togglePaa) return null;
  return <TekstblokkSoekIntern onVelg={onVelg} disabled={disabled} />;
}

function TekstblokkSoekIntern({ onVelg, disabled }: Props) {
  const ankerRef = useRef<HTMLDivElement>(null);
  const [aapen, setAapen] = useState(false);
  const [aktivType, setAktivType] = useState<TekstblokkType>("TEKSTBLOKK");
  // Hvert filter er enten et fritt søkeord eller en valgt tag – alle behandles likt (AND).
  const [filtre, setFiltre] = useState<string[]>([]);

  const { data: blokker = [], isLoading } = useTekstblokker(aktivType, aapen);

  const { tagAntall, synlige: filtrerte } = useFiltrerteTekstblokker(blokker, filtre.join(" "), []);

  const tagValg = useMemo(() => tagAntall.map(([tag]) => tag), [tagAntall]);

  const synlige = filtrerte.slice(0, MAKS_SYNLIG);
  const skjult = Math.max(0, filtrerte.length - synlige.length);

  const lukk = () => {
    setAapen(false);
    setFiltre([]);
  };

  const byttType = (verdi: string) => {
    setAktivType(verdi as TekstblokkType);
    setFiltre([]);
  };

  const toggleFilter = (verdi: string, valgt: boolean) =>
    setFiltre((forrige) => (valgt ? [...forrige, verdi] : forrige.filter((f) => f !== verdi)));

  return (
    <>
      <div className="tekstblokkSoek__verktoylinje" ref={ankerRef}>
        <Nav.Button
          variant="tertiary"
          size="small"
          onClick={() => (aapen ? lukk() : setAapen(true))}
          disabled={disabled}
          type="button"
        >
          Sett inn tekstblokk/brevmal
        </Nav.Button>
      </div>
      <Popover
        open={aapen}
        onClose={lukk}
        anchorEl={ankerRef.current}
        placement="top-end"
        arrow={false}
        className="tekstblokkSoek__popover"
      >
        <Popover.Content className="tekstblokkSoek__innhold">
          <div className="tekstblokkSoek__topp">
            <Tabs value={aktivType} onChange={byttType} size="small">
              <Tabs.List>
                <Tabs.Tab value="TEKSTBLOKK" label="Tekstblokker" />
                <Tabs.Tab value="BREVMAL" label="Brevmaler" />
              </Tabs.List>
            </Tabs>

            <Combobox
              label="Søk og filtrer"
              hideLabel
              size="small"
              isMultiSelect
              allowNewValues
              options={tagValg}
              selectedOptions={filtre}
              onToggleSelected={toggleFilter}
              placeholder="Søk på tittel/innhold, eller velg tag…"
            />
          </div>

          <div className="tekstblokkSoek__liste">
            {isLoading && (
              <div className="tekstblokkSoek__laster">
                <Nav.Loader size="small" />
              </div>
            )}
            {!isLoading && synlige.length === 0 && (
              <BodyShort size="small" className="tekstblokkSoek__tom">
                Ingen treff.
              </BodyShort>
            )}
            {synlige.map((blokk) => (
              <TekstblokkRad
                key={blokk.id}
                blokk={blokk}
                onVelg={(html) => {
                  onVelg(html);
                  lukk();
                }}
              />
            ))}
          </div>

          {skjult > 0 && (
            <BodyShort size="small" className="tekstblokkSoek__antall">
              {skjult} flere treff – avgrens søket
            </BodyShort>
          )}
        </Popover.Content>
      </Popover>
    </>
  );
}

interface RadProps {
  blokk: TekstblokkOversikt;
  onVelg: (html: string) => void;
}

function TekstblokkRad({ blokk, onVelg }: RadProps) {
  const [erUtvidet, setErUtvidet] = useState(false);

  return (
    <div className={`tekstblokkSoek__rad${erUtvidet ? " tekstblokkSoek__rad--utvidet" : ""}`}>
      <div className="tekstblokkSoek__rad-topp">
        <div className="tekstblokkSoek__rad-info">
          <div className="tekstblokkSoek__rad-tittel">{blokk.tittel}</div>
          {blokk.tags.length > 0 && (
            <div className="tekstblokkSoek__rad-tags">
              {blokk.tags.map((tag) => (
                <Nav.Tag key={tag} size="xsmall" variant="neutral">
                  {tag}
                </Nav.Tag>
              ))}
            </div>
          )}
        </div>
        <div className="tekstblokkSoek__rad-knapper">
          <Nav.Button size="xsmall" variant="tertiary" type="button" onClick={() => setErUtvidet(!erUtvidet)}>
            {erUtvidet ? "Skjul" : "Vis hele"}
          </Nav.Button>
          <Nav.Button size="xsmall" variant="primary" type="button" onClick={() => onVelg(blokk.innhold)}>
            Sett inn
          </Nav.Button>
        </div>
      </div>
      <div className={`tekstblokkSoek__forhandsvisning${erUtvidet ? " tekstblokkSoek__forhandsvisning--full" : ""}`}>
        <TekstblokkForhandsvisning html={blokk.innhold} />
      </div>
    </div>
  );
}

export default TekstblokkSoek;
