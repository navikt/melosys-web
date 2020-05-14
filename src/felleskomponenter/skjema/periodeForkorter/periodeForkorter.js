import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../index';

const PeriodeForkorter = ({
  className,
  checkboxClassName,
  redigerbart,
  checkboxFeltnavn,
  forkortPeriode,
  checkboxLabel,
  onUncheck,
  fomLabel,
  fomFeltNavn,
  tomLabel,
  tomFeltNavn,
}) => {
  const onCheckboxClick = e => {
    if (!e.target.checked) {
      if (onUncheck) onUncheck();
    }
  };

  return (
    <div className={className}>
      <Nav.Row className={checkboxClassName}>
        <Nav.Column xs="8">
          <Skjema.Checkbox feltNavn={checkboxFeltnavn} label={checkboxLabel} disabled={!redigerbart} onClick={onCheckboxClick} />
        </Nav.Column>
      </Nav.Row>
      {
        forkortPeriode &&
        <Fragment>
          <Nav.Row>
            <Nav.Column xs="3">
              <Skjema.Input
                bredde="fullbredde"
                label={fomLabel}
                disabled
                feltNavn={fomFeltNavn}
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Skjema.Input
                bredde="fullbredde"
                label={tomLabel}
                disabled={!redigerbart}
                feltNavn={tomFeltNavn}
                datoFelt
              />
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
    </div>
  );
};

PeriodeForkorter.propTypes = {
  className: PT.string,
  checkboxClassName: PT.string,
  redigerbart: PT.bool.isRequired,
  checkboxFeltnavn: PT.string.isRequired,
  forkortPeriode: PT.bool,
  checkboxLabel: PT.string,
  onUncheck: PT.func,
  fomLabel: PT.string,
  fomFeltNavn: PT.string.isRequired,
  tomLabel: PT.string,
  tomFeltNavn: PT.string.isRequired,
};

PeriodeForkorter.defaultProps = {
  className: undefined,
  checkboxClassName: undefined,
  checkboxLabel: '',
  onUncheck: undefined,
  fomLabel: '',
  tomLabel: '',
  forkortPeriode: false,
};

export default PeriodeForkorter;
