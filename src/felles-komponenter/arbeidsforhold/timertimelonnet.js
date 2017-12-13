import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';

import EnkeltDato from '../datoOmrade/enkeltDato';

const uuid = require('uuid/v4');

/** Lister en enkeltlinje for antall timer timelønnet.
 *
 * @param { props.timeLinje } Enkeltlinje for timelønn.
 */
const TimeLinje = ({ timeLinje }) => {
  const { timelonnetPeriode, rapporteringsPeriode, antallTimer } = timeLinje;
  return (
    <tr className="border-bottom">
      <td>{<EnkeltDato dato={timelonnetPeriode.fom} />}</td>
      <td>{<EnkeltDato dato={timelonnetPeriode.tom} />}</td>
      <td>{rapporteringsPeriode}</td>
      <td>{antallTimer}</td>
    </tr>
  );
};

TimeLinje.propTypes = {
  timeLinje: MPT.TimerTimelonnetLinje.isRequired,
};

/** Lister alle timer timelønnet i form av en table.
 *
 * @param permisjoner Array med timelonnet.
 */
class TimerTimelonnet extends Component {
  state = {
    side: 0,
    linjePerSide: 5,
  }

  visListeSide = side => {
    this.setState({ side });
  }

  render() {
    const { timerTimelonnet } = this.props;

    // Lag en chunk av timerTimelonnet for paginering og visning av korrekt side.
    const timeLinjeChunk = timerTimelonnet.filter((linje, index) => {
      const startIndex = this.state.side * this.state.linjePerSide;
      const sluttIndex = startIndex + this.state.linjePerSide;
      return index >= startIndex && index < sluttIndex;
    });

    const sideNav = [];
    for (let side = 0; side < Math.ceil(timerTimelonnet.length / this.state.linjePerSide); side += 1) {
      const classname = classnames({ paginering__nav: true, 'paginering__nav--aktiv': side === this.state.side });
      sideNav.push(<Link to={'#'} key={uuid()} className={classname} onClick={() => this.visListeSide(side)}>{side + 1}</Link>);
    }

    return (
      <div className="permisjoner">
        <Nav.Undertittel>Timer timelønnet</Nav.Undertittel>
        <table className="tabellutlisting">
          <tbody>
            <tr>
              <th>Startdato</th>
              <th>Sluttdato</th>
              <th>Rapporteringsperiode</th>
              <th>Antall timer</th>
            </tr>
            { timeLinjeChunk.map(timeLinje => <TimeLinje key={uuid()} timeLinje={timeLinje} />) }
          </tbody>
        </table>
        <div className="paginering" aria-label="Naviger blant flere sider i dennne tabellen">
          {sideNav.map(nav => nav)}
        </div>
      </div>
    );
  }
}


TimerTimelonnet.propTypes = {
  timerTimelonnet: MPT.TimerTimelonnet,
};

TimerTimelonnet.defaultProps = {
  timerTimelonnet: [],
};

export default TimerTimelonnet;
