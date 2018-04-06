import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as Oppgaver from '../../ducks/oppgaver';
import * as MPT from '../../proptypes/';
import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';

import PanelHeader from '../panelHeader/panelHeader';
import EnkeltDato from '../datoOmrade/enkeltDato';

import './minesaker.css';

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
    sammensattNavn, sakstype, saksnummer, behandling, aktivTil, soknadsperiode,
  } = sak;
  const { status } = behandling;
  const { fom, tom } = soknadsperiode;
  const tittel = `${sakstype.term} ${sammensattNavn}`;
  const link = `/saksbehandling/${saksnummer}`;

  return (
    <Link to={link} className="minsak__link">
      <Nav.Panel className="minesaker__minsak">
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={
            <Nav.Row>
              <Nav.Column xs="12" md="6">
                <dl className="minsak__meta">
                  <dt className="minsak__meta__term">Status:</dt>
                  <dd className="minsak__meta__detalj">{status.term}</dd>
                  <dt className="minsak__meta__term">Frist:</dt>
                  <dd className="minsak__meta__detalj">{aktivTil}</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="12" md="6">
                <dl className="minsak__meta">
                  <dt className="minsak__meta__term">Søknadsperiode: </dt>
                  <dd className="minsak__meta__detalj"><EnkeltDato dato={fom} /> - <EnkeltDato dato={tom} /></dd>
                  <dt className="minsak__meta__term">Land:</dt>
                  <dd className="minsak__meta__detalj">TODO fra søknaden</dd>
                </dl>
              </Nav.Column>
            </Nav.Row>
          }
        />

      </Nav.Panel>
    </Link>
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
      <div className="minesaker">
        <h1>Mine Saker ({minesaker.length})</h1>
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
