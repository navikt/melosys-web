import { Popover } from "@navikt/ds-react";

import * as Nav from "../../navFrontend";
import { usePlaceholderKatalog } from "../../services/api/placeholdere";
import "./placeholderValgPopover.less";

interface Props {
  // Spanen det ble klikket på. Komponenten monteres først når det finnes et treff.
  anker: HTMLElement;
  alternativer: string[];
  // Satt ved omvalg, så det gjeldende alternativet kan framheves.
  valgt?: string;
  // Katalognøkkelen bak en utfylt verdi. Satt kun for utfylte verdier.
  nokkel?: string;
  onVelg: (alternativ: string) => void;
  onGjorOmTilTekst?: () => void;
  onLukk: () => void;
}

// Visningsnavnet ligger i katalogen, ikke i markeringen. Oppslaget gjøres her – som i
// placeholderUtdatertVarsel – så editoren slipper å ta imot katalogen fra hver vert.
// Egen komponent fordi hooken ellers ville kjørt også for rene valgtokener.
function UtfyltOverskrift({ nokkel }: { nokkel: string }) {
  const { data: katalog } = usePlaceholderKatalog();
  const visningsnavn = katalog?.find((beskrivelse) => beskrivelse.nokkel === nokkel)?.visningsnavn;

  return (
    <>
      <Nav.BodyShort size="small" weight="semibold">
        {visningsnavn || nokkel}
      </Nav.BodyShort>
      <Nav.Detail className="placeholderValg__nokkel">{`{${nokkel}}`}</Nav.Detail>
    </>
  );
}

// Alternativene for et {velg:…}-token eller en utfylt verdi, forankret i selve markeringen
// i editoren. Popover er den eneste Aksel-komponenten som tar et Element som anker direkte.
function PlaceholderValgPopover({ anker, alternativer, valgt, nokkel, onVelg, onGjorOmTilTekst, onLukk }: Props) {
  return (
    <Popover
      open
      onClose={onLukk}
      anchorEl={anker}
      placement="bottom-start"
      arrow={false}
      className="placeholderValg__popover"
    >
      <Popover.Content className="placeholderValg__innhold">
        {nokkel === undefined ? (
          <Nav.BodyShort size="small" weight="semibold">
            Velg alternativ
          </Nav.BodyShort>
        ) : (
          <UtfyltOverskrift nokkel={nokkel} />
        )}
        {alternativer.map((alternativ) => (
          <Nav.Button
            key={alternativ}
            type="button"
            size="small"
            variant={alternativ === valgt ? "secondary" : "tertiary"}
            onClick={() => onVelg(alternativ)}
          >
            {alternativ}
          </Nav.Button>
        ))}
        {onGjorOmTilTekst && (
          <Nav.Button type="button" size="small" variant="tertiary-neutral" onClick={onGjorOmTilTekst}>
            Gjør om til vanlig tekst
          </Nav.Button>
        )}
      </Popover.Content>
    </Popover>
  );
}

export default PlaceholderValgPopover;
