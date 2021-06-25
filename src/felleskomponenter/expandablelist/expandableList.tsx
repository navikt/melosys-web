import React, { useState, ReactNode } from "react";
import classNames from "classnames";
import { Collapse } from "react-collapse";

import * as Nav from "../../utils/navFrontend";

import "./expandableList.css";

interface ExpandableListProps<T> {
  renderElement: (element: T) => ReactNode;
  idFromElement: (element: T) => string | number;
  elements: T[];
  header?: ReactNode;
  showHeader?: (collapsed: boolean) => boolean;
  amountOfItemsCollapsed: number;
  btnTextExpanded?: string;
  btnTextCollapsed?: string;
  chevron: boolean;
  dividers?: boolean;
}

function ExpandableList<T>(props: ExpandableListProps<T>) {
  const {
    renderElement,
    idFromElement,
    elements,
    header,
    showHeader = () => true,
    amountOfItemsCollapsed,
    btnTextExpanded = "Lukke",
    btnTextCollapsed = "Åpne",
    chevron = false,
    dividers = false,
  } = props;

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const chevronDirection = collapsed ? "ned" : "opp";
  const btnText = collapsed ? btnTextCollapsed : btnTextExpanded;

  const alwaysVisibleElements = elements.slice(0, amountOfItemsCollapsed);
  const collapsableElements = elements.slice(amountOfItemsCollapsed);

  const expandable = elements.length > amountOfItemsCollapsed;

  const elementCls = classNames({
    divider: dividers,
  });

  return (
    <div className="expandableList">
      {showHeader(collapsed) ? header : null}
      <div className="list">
        {alwaysVisibleElements.map((element) => (
          <div className={elementCls} key={idFromElement(element)}>
            {renderElement(element)}
          </div>
        ))}
        <Collapse isOpened={!collapsed}>
          {collapsableElements.map((element) => (
            <div className={elementCls} key={idFromElement(element)}>
              {renderElement(element)}
            </div>
          ))}
        </Collapse>
      </div>
      <div className="btnContainer">
        {expandable && (
          <button type="button" onClick={toggleCollapsed}>
            {btnText}
            {chevron && <Nav.Chevron type={chevronDirection} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default ExpandableList;
