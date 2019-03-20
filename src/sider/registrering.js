/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as Nav from '../utils/navFrontend';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';

import './registrering.css';
import SideOppsummering from '../soknad-komponenter/sideOppsummering';
import { fagsakSelectors } from '../ducks/fagsaker';

import * as MPT from '../proptypes';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';

class Registrering extends Component {
  // TODO implement later
  visOppfriskBekreftelse = () => {};
  lagreOgLukk = () => {};
  tilbakeleggeHandle = () => {};
  visHenleggDialog = () => {};
  navigerTilOversiktSide = () => {};

  render() {
    const { oppsummering } = this.props;
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
                oppfriskSaksopplysningerHandle={this.visOppfriskBekreftelse}
                lagreOgLukkHandle={this.lagreOgLukk}
                tilbakeleggeHandle={this.tilbakeleggeHandle}
                visHenleggDialogHandle={this.visHenleggDialog}
                tilForsidenHandle={this.navigerTilOversiktSide}
              />
              <SideDialog />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}
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
