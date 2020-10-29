import React, { useState, ReactNode } from 'react';
import classNames from 'classnames';

import * as Nav from '../../utils/navFrontend';

import './expandableList.css';

interface ExpandableListProps<T> {
  renderElement: (element: T) => ReactNode,
  idFromElement: (element: T) => string | number,
  elements: T[],
  header?: ReactNode,
  amountOfItemsCollapsed: number,
  btnTextExpanded: string,
  btnTextCollapsed: string,
  chevron: boolean,
  expandable: boolean,
  dividers?: boolean,
}

function ExpandableList<T>(props: ExpandableListProps<T>) {
  const {
    renderElement,
    idFromElement,
    elements,
    header,
    amountOfItemsCollapsed,
    btnTextExpanded,
    btnTextCollapsed,
    chevron = false,
    expandable = true,
    dividers = false,
  } = props;

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const chevronDirection = collapsed ? 'ned' : 'opp';
  const btnText = collapsed ? btnTextCollapsed : btnTextExpanded;

  const renderableElements = collapsed ? elements.slice(0, amountOfItemsCollapsed) : elements;

  const elementCls = classNames({
    divider: dividers,
  });

  return (
    <div className="expandableList">
      {header}
      <div className="list">
        {
          renderableElements.map(element => (
            <div className={elementCls} key={idFromElement(element)}>
              {renderElement(element)}
            </div>
          ))
        }
      </div>
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
}

export default ExpandableList;
