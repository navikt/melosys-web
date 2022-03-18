import React, { ReactNode } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import { Familiemedlem } from "../../../../../../graphql";
import ExpandableList from "../../../../../expandablelist";

import "./familiemedlemGruppe.css";

interface Column {
  width: ColumnWidth;
  headerText: string;
  renderContent: (familiemedlem: Familiemedlem) => ReactNode;
}

interface FamiliemedlemProps {
  familiemedlemmer: Familiemedlem[];
  columns: Column[];
}

function FamiliemedlemGruppe({ familiemedlemmer, columns }: FamiliemedlemProps) {
  const renderFamiliemedlemInRow = (familiemedlem: Familiemedlem) => (
    <Nav.Row>
      {columns.map((column) => (
        <Nav.Column key={Utils._uuid()} className="familiemedlemgruppe__familiemedlem-enkelt" xs={column.width}>
          {column.renderContent(familiemedlem)}
        </Nav.Column>
      ))}
    </Nav.Row>
  );

  return (
    <>
      <Nav.Row className="familiemedlemgruppe__header">
        {columns.map((column) => (
          <Nav.Column key={Utils._uuid()} xs={column.width}>
            {column.headerText}
          </Nav.Column>
        ))}
      </Nav.Row>
      <ExpandableList
        elements={familiemedlemmer}
        renderElement={renderFamiliemedlemInRow}
        idFromElement={(familiemedlem) => familiemedlem.ident}
        amountOfItemsCollapsed={familiemedlemmer.length}
        btnTextCollapsed="Vis flere"
        btnTextExpanded="Vis færre"
        chevron
        dividers
      />
    </>
  );
}

export default FamiliemedlemGruppe;
