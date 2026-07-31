import { Popover } from "@navikt/ds-react";

import * as Nav from "../../navFrontend";
import "./placeholderValgPopover.less";

interface Props {
  // Spanen det ble klikket på. Komponenten monteres først når det finnes et treff.
  anker: HTMLElement;
  alternativer: string[];
  // Satt ved omvalg, så det gjeldende alternativet kan framheves.
  valgt?: string;
  onVelg: (alternativ: string) => void;
  onLukk: () => void;
}

// Alternativene for et {velg:…}-token, forankret i selve markeringen i editoren.
// Popover er den eneste Aksel-komponenten som tar et Element som anker direkte.
function PlaceholderValgPopover({ anker, alternativer, valgt, onVelg, onLukk }: Props) {
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
        <Nav.BodyShort size="small" weight="semibold">
          Velg alternativ
        </Nav.BodyShort>
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
      </Popover.Content>
    </Popover>
  );
}

export default PlaceholderValgPopover;
