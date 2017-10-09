import React, { Component} from 'react';
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

  tilSteg = nyttSteg => {
    this.setState({ aktivtSteg: nyttSteg });
  }

  render() {
    const { valg, children } = this.props;
    const stegIkoner = children.map((item, index) => <StegIkon key={uuid()} onClick={() => this.tilSteg(index)} erAktiv={this.state.aktivtSteg === index} />);
    const faneInnhold = React.cloneElement(children[this.state.aktivtSteg], valg);

    return (
      <div>
        <ul className="stegVelger">
          {stegIkoner}
        </ul>
        {faneInnhold}
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegVelger);
