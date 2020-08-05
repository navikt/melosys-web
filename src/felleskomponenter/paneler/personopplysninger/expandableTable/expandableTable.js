import React, { useState } from 'react';
import * as PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';

import './expandableTable.css';

const ExpandableTable = props => {
  const {
    renderElement, elements, header, amountOfItemsCollapsed, btnTextExpanded, btnTextCollapsed, chevron, expandable,
  } = props;

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const chevronDirection = collapsed ? 'ned' : 'opp';
  const btnText = collapsed ? btnTextCollapsed : btnTextExpanded;

  const renderableElements = collapsed ? elements.slice(0, amountOfItemsCollapsed) : elements;

  return (
    <div className="expandableTable">
      <table>
        {header}
        <tbody>
          {
            renderableElements.map(renderElement)
          }
        </tbody>
      </table>
      <div className="btnContainer">
        {
          expandable &&
          <button type="button" onClick={toggleCollapsed}>
            {btnText}
            { chevron && <Nav.Chevron type={chevronDirection} />}
          </button>
        }
      </div>
    </div>
  );
};

ExpandableTable.propTypes = {
  renderElement: PT.func.isRequired,
  header: PT.node.isRequired,
  elements: PT.array.isRequired,
  amountOfItemsCollapsed: PT.number.isRequired,
  btnTextExpanded: PT.string.isRequired,
  btnTextCollapsed: PT.string.isRequired,
  chevron: PT.bool,
  expandable: PT.bool,
};

ExpandableTable.defaultProps = {
  chevron: false,
  expandable: true,
};

export default ExpandableTable;
