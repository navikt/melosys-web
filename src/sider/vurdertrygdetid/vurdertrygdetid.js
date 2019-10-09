import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import SideDialog from '../../felleskomponenter/sideDialog/sideDialog';

import './vurdertrygdetid.css';

const VurderTrygdetid = ({
  behandlingID,
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  match,
}) => {
  const { params: { snr: saksnummer } } = match;

  return (
    <div className="vurderTrygdetid">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7" />
          <Nav.Column xs="5">
            <SideDialog
              behandlingID={behandlingID}
              saksnummer={saksnummer}
              brevBestillingRedigerbart={brevBestillingRedigerbart}
              brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

VurderTrygdetid.propTypes = {
  behandlingID: PT.number.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  match: PT.object.isRequired,
};

export default VurderTrygdetid;
