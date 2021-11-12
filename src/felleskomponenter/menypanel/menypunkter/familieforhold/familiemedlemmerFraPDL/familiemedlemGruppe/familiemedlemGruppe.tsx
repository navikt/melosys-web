import React, { ReactNode } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import { Familiemedlem } from "../../../../../../graphql";
import ExpandableList from "../../../../../expandablelist";

import "./familiemedlemGruppe.css";

interface Header {
  width: ColumnWidth;
  text: string;
}

interface Column {
  width: ColumnWidth;
  content: ReactNode;
}

interface FamiliemedlemProps<T extends Header[]> {
  familiemedlemmer: Familiemedlem[];
  headers: [...T];
  renderFamiliemedlemColumns: (familiemedlem: Familiemedlem) => [...{ [I in keyof T]: Column }];
}

function FamiliemedlemGruppe<T extends Header[]>({
  familiemedlemmer,
  headers,
  renderFamiliemedlemColumns,
}: FamiliemedlemProps<T>) {
  const renderFamiliemedlemInRow = (familiemedlem: Familiemedlem) => (
    <Nav.Row>
      {renderFamiliemedlemColumns(familiemedlem).map(({ width, content }) => (
        <Nav.Column key={Utils._uuid()} className="familiemedlemgruppe__familiemedlem-enkelt" xs={width}>
          {content}
        </Nav.Column>
      ))}
    </Nav.Row>
  );

  return (
    <>
      <Nav.Row className="familiemedlemgruppe__header">
        {headers.map((header) => (
          <Nav.Column key={Utils._uuid()} xs={header.width}>
            {header.text}
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
