import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import StegIkon from './stegIkon';
import './stegVelger.css';

const uuid = require('uuid/v4');

class StegVelger extends Component {
  static defaultProps = {
    valg: {},
  }

  static propTypes = {
    valg: PT.object.isRequired,
    children: PT.any.isRequired,
  }

  state = {
    aktivtSteg: 0,
  }

  /** Gå til et konkret steg i steglisten, angitt av en indek
   * som begynnner med 0.
   * @param nyttSteg Number Steget som det skal byttes til.
   */
  tilSteg = nyttSteg => {
    this.setState({ aktivtSteg: nyttSteg });
  }

  /** Gå til neste steg i rekken, men ikke lenger enn
   * maks antall steg. Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til siste steg.
   */
  nestSteg = () => {
    const maksSteg = this.props.children.length;
    const nyttSteg = (this.state.aktivtSteg + 1 < maksSteg) ? this.state.aktivtSteg + 1 : this.state.aktivtSteg;
    this.setState({ aktivtSteg: nyttSteg });
  }

  render() {
    const { valg, children } = this.props;

    // Sett inn relasjon til eventen this.nesteKnappKlikk slik at knapper i barne-noder
    // kan trigge en event oppover i stack.
    valg.nesteKnappKlikk = this.nestSteg;

    // Klargjør betingede elementer.
    const stegKnapper = children.map((item, index) => (
      <StegIkon
        key={uuid()}
        onClick={() => this.tilSteg(index)}
        erAktiv={this.state.aktivtSteg === index}
        ikon={valg.ikoner.ikonFerdig}
      />));

    const faneInnhold = React.cloneElement(children[this.state.aktivtSteg], valg);

    return (
      <div>
        <ul className="stegVelger">
          {stegKnapper}
        </ul>
        {faneInnhold}
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegVelger);
