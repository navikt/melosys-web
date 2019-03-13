/* eslint no-alert:off, consistent-return:off */
import React from 'react';
import { connect } from 'react-redux';
import * as Nav from '../utils/navFrontend';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';

import './registrering.css';
import SideOppsummering from '../soknad-komponenter/sideOppsummering';
import { fagsakSelectors } from '../ducks/fagsaker';
import * as MPT from '../proptypes';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';

const Registrering = props => {
  // TODO implement later
  const visOppfriskBekreftelse = () => {};
  const lagreOgLukk = () => {};
  const tilbakeleggeHandle = () => {};
  const visHenleggDialog = () => {};
  const navigerTilOversiktSide = () => {};
  const { oppsummering } = props;
  return (
    <div className="registrering">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Saksopplysninger />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              oppsummering={oppsummering}
              oppfriskSaksopplysningerHandle={visOppfriskBekreftelse}
              lagreOgLukkHandle={lagreOgLukk}
              tilbakeleggeHandle={tilbakeleggeHandle}
              visHenleggDialogHandle={visHenleggDialog}
              tilForsidenHandle={navigerTilOversiktSide}
            />
            <SideDialog />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};
Registrering.propTypes = {
  oppsummering: MPT.Oppsummering,
};
Registrering.defaultProps = {
  oppsummering: {},
};
const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
