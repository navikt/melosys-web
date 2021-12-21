import React, { ComponentProps } from "react";
import classNames from "classnames";

import * as Nav from "../../../navFrontend";
import * as Ikoner from "../../../resources/images";

import "./stegKnapper.css";

interface StegKnapperProps {
  bekreftKnappProps: ComponentProps<typeof Nav.Hovedknapp>;
  bekreftTekst?: string;
  tilbakeKnappProps?: ComponentProps<typeof Nav.Flatknapp>;
  className?: string;
}

const StegKnapper = ({
  bekreftKnappProps,
  bekreftTekst = "Bekreft og fortsett",
  tilbakeKnappProps,
  className,
}: StegKnapperProps) => {
  const cls = classNames("stegKnapper", className);
  const bekreftKnappCls = classNames("stegKnapper__bekreft", bekreftKnappProps.className);
  const tilbakeKnappCls = classNames("stegKnapper__tilbake", tilbakeKnappProps?.className);

  return (
    <div className={cls}>
      <Nav.Hovedknapp
        mini
        {...bekreftKnappProps}
        className={bekreftKnappCls}
        htmlType={bekreftKnappProps.htmlType || "button"}
      >
        {bekreftTekst}
      </Nav.Hovedknapp>
      {tilbakeKnappProps && (
        <Nav.Flatknapp
          mini
          {...tilbakeKnappProps}
          className={tilbakeKnappCls}
          htmlType={tilbakeKnappProps.htmlType || "button"}
        >
          {tilbakeKnappProps.disabled ? <Ikoner.ArrowLeftWhite /> : <Ikoner.ArrowLeftBlue />}
          <span>Tilbake</span>
        </Nav.Flatknapp>
      )}
    </div>
  );
};

export default StegKnapper;
