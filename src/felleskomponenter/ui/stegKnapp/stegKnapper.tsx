import React, { ComponentProps } from "react";
import classNames from "classnames";

import * as Nav from "../../../navFrontend";
import * as Ikoner from "../../../resources/images";

import "./stegKnapper.css";

interface StegKnapperProps {
  bekreftKnappProps: ComponentProps<typeof Nav.Hovedknapp>;
  bekreftTekst?: string;
  visTilbakeKnapp?: boolean;
  tilbakeKnappProps?: ComponentProps<typeof Nav.Flatknapp>;
  className?: string;
}

const StegKnapper = ({
  bekreftKnappProps,
  bekreftTekst = "Bekreft og fortsett",
  visTilbakeKnapp = true,
  tilbakeKnappProps,
  className,
}: StegKnapperProps) => {
  const cls = classNames("stegKnapper", className);
  return (
    <div className={cls}>
      <Nav.Hovedknapp mini className="stegKnapper__bekreft" {...bekreftKnappProps}>
        {bekreftTekst}
      </Nav.Hovedknapp>
      {visTilbakeKnapp && tilbakeKnappProps && (
        <Nav.Flatknapp mini className="stegKnapper__tilbake" {...tilbakeKnappProps}>
          <Ikoner.ArrowLeft />
          <span>Tilbake</span>
        </Nav.Flatknapp>
      )}
    </div>
  );
};

export default StegKnapper;
