import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router';
import * as Oppgaver from '../../ducks/oppgaver';

import * as MPT from '../../proptypes/';
import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';
import PanelHeader from '../panelHeader/panelHeader';

const uuid = require('uuid/v4');

const MinSakPropType = PT.shape({
  sammensattNavn: PT.string.isRequired,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    status: MPT.Kodeverk,
    type: MPT.Kodeverk,
  }),
  soknadsperiode: MPT.Periode,
});

const MinSak = ({ sak }) => {
  const {
    sammensattNavn, sakstype, behandling, aktivTil, soknadsperiode,
  } = sak;
  const { status, type } = behandling;
  const { fom, tom } = soknadsperiode;
  // console.log(sak);
  const tittel = `${sakstype.term} ${sammensattNavn}`;
  return (
    <div>
      <Nav.Panel>
        {sak && <PanelHeader ikon={Ikoner.Ferdig} tittel={tittel} undertittel={type.term} />}
        <dl>
          <dt>Status:{status.term}</dt>
          <dd>Søknadsperiode:{fom}-{tom}</dd>
          <dt>Frist:{aktivTil}</dt>
          <dd>Land: TODO fra soknaden</dd>
        </dl>
      </Nav.Panel>
    </div>
  );
};

MinSak.propTypes = {
  sak: MinSakPropType,
};
MinSak.defaultProps = {
  sak: {},
};


class MineSaker extends Component {
  static propTypes = {
    hentMineSaker: PT.func.isRequired,
    minesaker: PT.array,
  };

  static defaultProps = {
    minesaker: [],
  };
  componentDidMount() {
    this.props.hentMineSaker();
  }
  render() {
    const { minesaker } = this.props;
    return (
      <div>
        {minesaker && minesaker.map(sak => <MinSak key={uuid()} sak={sak} />)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  minesaker: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
});
const mapDispatchToProps = dispatch => ({
  hentMineSaker: () => dispatch(Oppgaver.oppgaverOperations.hentMineSaker()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MineSaker);
