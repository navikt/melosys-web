import React, { useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import './tabell.css';

const uuid = require('uuid/v4');

/** Lister en enkeltlinje i tabellen. Denne linjen må være en array som kan mappes direkte
 * siden innhold og typer er ukjent. Evt formattering eller komponenter må gjøres av
 * komponenten som i utgangspunktet implementerer Tabell-komponenten.
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

/** Setter opp en tabell med paginering, avhengig av om linjerPerSide er > 0.
 *
 * @param props. Se prop types for detaljer.
 */
const Tabell = props => {
  const [aktivSide, setState] = useState(0);

  /** Håndterer klikk på pagineringsknapper for å bytte visningsside
   *
   * @param nySide Siden som brukeren vil gå til (starter på 0).
   */
  const tilSideHandler = nySide => {
    setState(nySide);
  };

  const {
    tabellData, kolonneNavn, linjerPerSide, className,
  } = props;
  // Filter ut delen av datasettet som representerer aktive siden (paginering). Dersom
  // linjerPerSide <= 0, vis hele datasettet (dvs, tabellData.length)
  const timeLinjeChunk = tabellData.filter((linje, index) => {
    const startIndex = aktivSide * linjerPerSide;
    const sluttIndex = linjerPerSide > 0 ? (startIndex + linjerPerSide) : tabellData.length;
    // Returnerer true dersom index er innenfor range i aktivSide.
    return (index >= startIndex && index < sluttIndex);
  });

  // Sjekk at linjerPerSide-prop er satt til 1 eller høyere
  // hvis ikke default til 0 for å unngå division by zero.
  const totaltSider = linjerPerSide > 0 ? Math.ceil(tabellData.length / linjerPerSide) : 0;

  // Bygg en array med antall sider som deretter fylles med med pagineringsknapper. Dersom totaltSider er 0 vil
  // array length være lik 0 som gjør at ingen knapper rendres dersom hele tabellen vises som én side uten paginering.
  const sideNav = new Array(totaltSider).fill(undefined).map((item, index) => {
    const classname = classnames({ paginering__nav: true, 'paginering__nav--aktiv': index === aktivSide });
    return (<button key={uuid()} className={classname} onClick={() => tilSideHandler(index)}>{index + 1}</button>);
  });

  const paginering = sideNav.length > 1
    ?
    <div className="paginering" aria-label="Naviger blant flere sider i dennne tabellen">
      {sideNav.map(nav => nav)}
    </div>
    :
    null;


  const innhold = (
    <div className={className}>
      <table className="tabellutlisting">
        <tbody>
          <tr>
            {kolonneNavn.map(kolonne => <th key={uuid()} scope="col">{kolonne}</th>)}
          </tr>
          {timeLinjeChunk.map(linjeData => <TabellLinje key={uuid()} linjeData={linjeData} />)}
        </tbody>
      </table>
      { paginering }
    </div>
  );
  return innhold;
};

Tabell.propTypes = {
  overskrift: PT.string,
  kolonneNavn: PT.arrayOf(PT.string),
  tabellData: PT.array,
  linjerPerSide: PT.number,
  className: PT.string,
};

Tabell.defaultProps = {
  overskrift: null,
  kolonneNavn: [],
  tabellData: [],
  linjerPerSide: 10,
  className: '',
};

export default Tabell;
