import React, { Fragment, useState } from 'react';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../ui';

import PdfLenkeListe from '../../../felleskomponenter/pdfLenkeListe';

import './vurderingGodkjennUtpekingAnnetLand.css';

const VurderingGodkjennUtpekingAnnetLand = ({
  lagreOgGodkjennUnntaksperioder,
  redigerbart,
  overskrift,
  behandlingID,
}) => {
  const [varsleUtland, setVarsleUtland] = useState(false);

  const vedEndring = event => {
    setVarsleUtland(event.target.checked);
  };

  const hovedknappHandler = () => {
    lagreOgGodkjennUnntaksperioder({
      varsleUtland,
    });
  };

  const dokumenter = [
    {
      navn: 'Forhåndsvis SED A012',
      type: EKV.Koder.sedtyper.A012,
      erSed: true,
    },
  ];

  return (
    <Fragment>
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      {
        redigerbart &&
        <Nav.Row className="sendA012">
          <Nav.Column xs="12">
            <Nav.Checkbox
              label="Send A012"
              onChange={vedEndring}
            />
          </Nav.Column>
        </Nav.Row>
      }
      <PdfLenkeListe
        behandlingID={behandlingID}
        dokumenter={dokumenter}
      />
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Mui.Knapp type="hoved" disabled={!redigerbart} onClick={hovedknappHandler}>Bekreft</Mui.Knapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingGodkjennUtpekingAnnetLand.propTypes = {
  lagreOgGodkjennUnntaksperioder: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  overskrift: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
};

export default VurderingGodkjennUtpekingAnnetLand;
