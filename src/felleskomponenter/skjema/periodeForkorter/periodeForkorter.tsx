import React, { ReactNode, MouseEventHandler } from "react";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../index";

interface PeriodeForkorterProps {
  className?: string;
  checkboxClassName?: string;
  redigerbart: boolean;
  fomRedigerbar: boolean;
  checkboxFeltnavn: string;
  forkortPeriode: boolean;
  checkboxLabel?: string;
  onUncheck?: () => void;
  fomLabel?: ReactNode;
  fomFeltNavn: string;
  tomLabel?: ReactNode;
  tomFeltNavn: string;
}

const PeriodeForkorter = ({
  className,
  checkboxClassName,
  redigerbart,
  fomRedigerbar,
  checkboxFeltnavn,
  forkortPeriode,
  checkboxLabel = "",
  onUncheck,
  fomLabel = "",
  fomFeltNavn,
  tomLabel = "",
  tomFeltNavn,
}: PeriodeForkorterProps) => {
  const onCheckboxClick: MouseEventHandler<HTMLInputElement> = (e) => {
    if (!e.currentTarget.checked) {
      if (onUncheck) onUncheck();
    }
  };

  return (
    <div className={className}>
      <Nav.Row className={checkboxClassName}>
        <Nav.Column xs="8">
          <Skjema.Checkbox
            feltNavn={checkboxFeltnavn}
            label={checkboxLabel}
            disabled={!redigerbart}
            onClick={onCheckboxClick}
          />
        </Nav.Column>
      </Nav.Row>
      {forkortPeriode && (
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Datovelger label={fomLabel} feltNavn={fomFeltNavn} disabled={!redigerbart || !fomRedigerbar} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Datovelger label={tomLabel} feltNavn={tomFeltNavn} disabled={!redigerbart} />
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
};

export default PeriodeForkorter;
