import { MouseEventHandler } from "react";
import classNames from "classnames";

import * as Nav from "../../../navFrontend";
import * as Ikoner from "../../../resources/images";

import "./stegKnapper.css";

interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  htmlType?: "button" | "submit" | "reset";
}

interface StegKnapperProps {
  bekreftKnappProps: ButtonProps;
  bekreftTekst?: string;
  tilbakeKnappProps?: ButtonProps;
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
      <Nav.Button variant="primary" {...bekreftKnappProps} className={bekreftKnappCls}>
        {bekreftTekst}
      </Nav.Button>
      {tilbakeKnappProps && (
        <Nav.Button
          variant="tertiary"
          className={tilbakeKnappCls}
          htmlType={tilbakeKnappProps.htmlType || "button"}
          icon={tilbakeKnappProps.disabled ? <Ikoner.ArrowLeftWhite /> : <Ikoner.ArrowLeftBlue />}
          {...tilbakeKnappProps}
        >
          Tilbake
        </Nav.Button>
      )}
    </div>
  );
};

export default StegKnapper;
