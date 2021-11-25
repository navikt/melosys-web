import React, { ComponentProps } from "react";
import classNames from "classnames";

import * as Nav from "../../../navFrontend";
import * as Ikoner from "../../../resources/images";

import "./stegKnapper.css";

interface StegKnapperProps {
  bekreft: ComponentProps<typeof Nav.Hovedknapp>;
  bekreftTekst?: string;
  visTilbakeKnapp?: boolean;
  tilbake?: ComponentProps<typeof Nav.Flatknapp>;
  className?: string;
}

const StegKnapper = ({
  bekreft,
  bekreftTekst = "Bekreft og fortsett",
  visTilbakeKnapp = true,
  tilbake,
  className,
}: StegKnapperProps) => {
  const cls = classNames("stegKnapper", className);
  return (
    <div className={cls}>
      <Nav.Hovedknapp mini className="stegKnapper__bekreft" {...bekreft}>
        {bekreftTekst}
      </Nav.Hovedknapp>
      {visTilbakeKnapp && tilbake && (
        <Nav.Flatknapp mini className="stegKnapper__tilbake" {...tilbake}>
          <Ikoner.ArrowLeft />
          <span>Tilbake</span>
        </Nav.Flatknapp>
      )}
    </div>
  );
};

export default StegKnapper;
