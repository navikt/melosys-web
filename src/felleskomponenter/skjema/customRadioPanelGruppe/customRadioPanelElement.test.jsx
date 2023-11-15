import CustomRadioPanelElement from "./customRadioPanelElement";
import { render, screen } from "@testing-library/react";

describe("CustomRadioPanelElement", () => {
  let props = null;

  beforeEach(() => {
    props = {
      tittel: "test",
      data: [
        {
          term: "term1",
          description: "description1",
        },
        {
          term: "term2",
          description: "description2",
        },
      ],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<CustomRadioPanelElement {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("viser tittel og viser ikke elementer i listen som mangler description", () => {
    props.data = [
      {
        term: "term1",
        description: "description",
      },
      {
        term: "term2",
      },
    ];

    render(<CustomRadioPanelElement {...props} />);

    expect(screen.getByRole("heading", { name: "test" })).toBeInTheDocument();
    expect(screen.getByText("term1")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
    expect(screen.queryByText("term2")).not.toBeInTheDocument();
  });
});
