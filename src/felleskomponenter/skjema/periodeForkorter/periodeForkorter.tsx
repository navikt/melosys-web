import React, { Fragment, ReactNode, MouseEventHandler } from "react";

import * as Nav from "../../../utils/navFrontend";
import * as Skjema from "../index";
import { FeatureToggle } from "../../../featuretoggle";

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
        <Fragment>
          <Nav.Row>
            <Nav.Column xs="3">
              <FeatureToggle togglename="melosys.input.DATOFELT">
                {(status) =>
                  status === "enabled" ? (
                    <Skjema.Datovelger
                      label={fomLabel}
                      feltNavn={fomFeltNavn}
                      disabled={!redigerbart || !fomRedigerbar}
                    />
                  ) : (
                    <Skjema.Input
                      bredde="fullbredde"
                      label={fomLabel}
                      disabled={!redigerbart || !fomRedigerbar}
                      feltNavn={fomFeltNavn}
                      datoFelt
                    />
                  )
                }
              </FeatureToggle>
            </Nav.Column>
            <Nav.Column xs="3">
              <FeatureToggle togglename="melosys.input.DATOFELT">
                {(status) =>
                  status === "enabled" ? (
                    <Skjema.Datovelger label={tomLabel} feltNavn={tomFeltNavn} disabled={!redigerbart} />
                  ) : (
                    <Skjema.Input
                      bredde="fullbredde"
                      label={tomLabel}
                      disabled={!redigerbart}
                      feltNavn={tomFeltNavn}
                      datoFelt
                    />
                  )
                }
              </FeatureToggle>
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      )}
    </div>
  );
};

export default PeriodeForkorter;
