import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@navikt/ds-react", () => {
  const TableComp = ({ children, size, ...rest }: any) => (
    <table data-size={size} {...rest}>
      {children}
    </table>
  );
  TableComp.Header = ({ children }: any) => <thead>{children}</thead>;
  TableComp.Body = ({ children }: any) => <tbody>{children}</tbody>;
  TableComp.Row = ({ children }: any) => <tr>{children}</tr>;
  TableComp.ColumnHeader = ({ children }: any) => <th>{children}</th>;
  TableComp.HeaderCell = ({ children, textSize, ...rest }: any) => (
    <th data-textsize={textSize} {...rest}>
      {children}
    </th>
  );
  TableComp.DataCell = ({ children, textSize, ...rest }: any) => (
    <td data-textsize={textSize} {...rest}>
      {children}
    </td>
  );
  TableComp.ExpandableRow = ({ children }: any) => <tr>{children}</tr>;

  return { Table: TableComp, TableProps: {}, HeaderCellProps: {}, DataCellProps: {} };
});

import Table from "./table";

describe("Table", () => {
  it("rendrer med default size small", () => {
    const { container } = render(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.DataCell>Data</Table.DataCell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(container.querySelector("table")?.getAttribute("data-size")).toBe("small");
  });

  it("tillater overstyring av size", () => {
    const { container } = render(
      <Table size="medium">
        <Table.Body>
          <Table.Row>
            <Table.DataCell>Data</Table.DataCell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(container.querySelector("table")?.getAttribute("data-size")).toBe("medium");
  });

  it("HeaderCell bruker default textSize small", () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <Table.HeaderCell>Header</Table.HeaderCell>
          </tr>
        </thead>
      </table>,
    );
    expect(container.querySelector("th")?.getAttribute("data-textsize")).toBe("small");
  });

  it("DataCell bruker default textSize small", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <Table.DataCell>Cell</Table.DataCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(container.querySelector("td")?.getAttribute("data-textsize")).toBe("small");
    expect(screen.getByText("Cell")).toBeDefined();
  });
});
