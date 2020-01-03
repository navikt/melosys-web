import React from 'react';
import * as PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../../felleskomponenter/ui';

const Fotknapper = ({
  avbrytJournalforing,
  kanSubmittes,
}) => (
  <div className="journalforing__fotknapper">
    <Nav.Row>
      <Nav.Column xs="6">
        <Mui.Knapp type="hoved" htmlType="submit" disabled={!kanSubmittes}>JOURNALFØR</Mui.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        <Mui.Knapp onClick={avbrytJournalforing}>Avbryt Journalføring</Mui.Knapp>
      </Nav.Column>
    </Nav.Row>
  </div>
);

Fotknapper.propTypes = {
  avbrytJournalforing: PT.func.isRequired,
  kanSubmittes: PT.bool.isRequired,
};

export default Fotknapper;
