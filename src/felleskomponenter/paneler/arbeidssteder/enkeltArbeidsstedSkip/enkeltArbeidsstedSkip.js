import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';

import MKV from '../../../../melosyskodeverk';

const { fartsomrader } = MKV.KTObjects.begrunnelser;

const EnkeltArbeidsstedSkip = ({
  redigerbart,
  overordnetFeltNavn,
  className,
  verdier,
  settVerdi,
}) => {
  const fartsomradeChangeHandler = event => {
    const fartsomrade = event.target.value;

    if (fartsomrade === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS) {
      settVerdi('flaggLandkode', null);
    } else if (fartsomrade === MKV.Koder.begrunnelser.fartsomrader.UTENRIKS) {
      settVerdi('territorialfarvann', null);
    }
  };

  return (
    <div className={className}>
      <Nav.Row>
        <Nav.Column xs="4">
          <Skjema.Input
            label="Navn på skip"
            feltNavn={`${overordnetFeltNavn}.enhetNavn`}
            disabled={!redigerbart}
            placeholder="Skriv inn"
          />
        </Nav.Column>
        <Nav.Column xs="4">
          <Skjema.Select
            feltNavn={`${overordnetFeltNavn}.fartsomradeKode`}
            label="Fartsområde"
            disabled={!redigerbart}
            onChange={fartsomradeChangeHandler}
            placeholder="Velg..."
          >
            {
              fartsomrader.map(omrade => <option key={omrade.kode} value={omrade.kode}>{omrade.term}</option>)
            }
          </Skjema.Select>
        </Nav.Column>
        <Nav.Column xs="4">
          {
            verdier.fartsomradeKode === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS &&
            <Skjema.LandVelger
              feltNavn={`${overordnetFeltNavn}.territorialfarvann`}
              label="Territorialfarvannsland"
              disabled={!redigerbart}
              placeholder="Skriv inn"
            />
          }
          {
            verdier.fartsomradeKode === MKV.Koder.begrunnelser.fartsomrader.UTENRIKS &&
            <Skjema.LandVelger
              feltNavn={`${overordnetFeltNavn}.flaggLandkode`}
              label="Flaggland"
              disabled={!redigerbart}
              placeholder="Skriv inn"
            />
          }
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

EnkeltArbeidsstedSkip.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  verdier: PT.object.isRequired,
  settVerdi: PT.func.isRequired,
  className: PT.string,
};

EnkeltArbeidsstedSkip.defaultProps = {
  className: undefined,
};

export default EnkeltArbeidsstedSkip;
