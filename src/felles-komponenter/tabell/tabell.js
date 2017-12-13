import React, { Component } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import * as Nav from '../../utils/navFrontend';

const uuid = require('uuid/v4');

/** Lister en enkeltlinje i tabellen.
 *
 * @param { props.linjeData } Array med alle data for den ene linjen.
 */
const TabellLinje = ({ linjeData }) => (
  <tr className="border-bottom">
    {linjeData.map(data => <td key={uuid()}>{data}</td>)}
  </tr>
);

TabellLinje.propTypes = {
  linjeData: PT.array.isRequired,
};

/** Lister alle timer timelønnet i form av en table.
 *
 * @param permisjoner Array med timelonnet.
 */
class Tabell extends Component {
  state = {
    side: 0,
  }

  visListeSide = side => {
    this.setState({ side });
  }

  render() {
    const { tabellData, kolonneNavn, overskrift, linjerPerSide } = this.props;

    // Hent ut delen av datasettet som representerer aktuelle sidevisning. Dersom
    // linjerPerSide = 0, vis hele datasettet (dvs, tabellData.length)
    const timeLinjeChunk = tabellData.filter((linje, index) => {
      const startIndex = this.state.side * linjerPerSide;
      const sluttIndex = linjerPerSide > 0 ? (startIndex + linjerPerSide) : tabellData.length;
      return index >= startIndex && index < sluttIndex;
    });

    // Lag rekken med pagineringsknapper, men kun dersom linjerPerSide > 0
    const sideNav = [];
    if (linjerPerSide > 0) {
      for (let side = 0; side < Math.ceil(tabellData.length / linjerPerSide); side += 1) {
        const classname = classnames({ paginering__nav: true, 'paginering__nav--aktiv': side === this.state.side });
        sideNav.push(<button key={uuid()} className={classname} onClick={() => this.visListeSide(side)}>{side + 1}</button>);
      }
    }

    return (
      <div className="permisjoner">
        {overskrift && <Nav.Undertittel>{overskrift}</Nav.Undertittel>}
        <table className="tabellutlisting">
          <tbody>
            <tr>
              {kolonneNavn.map(kolonne => <th key={uuid()}>{kolonne}</th>)}
            </tr>
            { timeLinjeChunk.map(linjeData => <TabellLinje key={uuid()} linjeData={linjeData} />) }
          </tbody>
        </table>
        <div className="paginering" aria-label="Naviger blant flere sider i dennne tabellen">
          {sideNav.map(nav => nav)}
        </div>
      </div>
    );
  }
}

Tabell.propTypes = {
  overskrift: PT.string,
  kolonneNavn: PT.arrayOf(PT.string),
  tabellData: PT.arrayOf(PT.object),
  linjerPerSide: PT.number,
};

Tabell.defaultProps = {
  overskrift: null,
  kolonneNavn: [],
  tabellData: [],
  linjerPerSide: 0,
};

export default Tabell;
