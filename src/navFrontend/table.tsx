import { DataCellProps, HeaderCellProps, Table as NavTable, TableProps } from "@navikt/ds-react";

function Table(props: TableProps) {
  const { size, children, ...rest } = props;
  return (
    <NavTable {...rest} size={size || "small"}>
      {children}
    </NavTable>
  );
}

function HeaderCell(props: HeaderCellProps) {
  const { textSize, children, ...rest } = props;
  return (
    <NavTable.HeaderCell {...rest} textSize={textSize || "small"}>
      {children}
    </NavTable.HeaderCell>
  );
}

function DataCell(props: DataCellProps) {
  const { textSize, children, ...rest } = props;
  return (
    <NavTable.DataCell {...rest} textSize={textSize || "small"}>
      {children}
    </NavTable.DataCell>
  );
}

Table.Header = NavTable.Header;
Table.Body = NavTable.Body;
Table.Row = NavTable.Row;
Table.ColumnHeader = NavTable.ColumnHeader;
Table.HeaderCell = HeaderCell;
Table.DataCell = DataCell;
Table.ExpandableRow = NavTable.ExpandableRow;

export default Table;
