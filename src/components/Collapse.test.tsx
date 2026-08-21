import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Collapse from "@components/Collapse";

describe("Collapse", () => {
  it("renders the title and children", () => {
    render(
      <Collapse title="Section title">
        <p>Section content</p>
      </Collapse>,
    );

    expect(screen.getByText("Section title")).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("uses the title as the details name when name is not provided", () => {
    const { container } = render(
      <Collapse title="Section title">content</Collapse>,
    );

    expect(container.querySelector("details")).toHaveAttribute(
      "name",
      "Section title",
    );
  });

  it("uses the provided name over the title", () => {
    const { container } = render(
      <Collapse title="Section title" name="custom-group">
        content
      </Collapse>,
    );

    expect(container.querySelector("details")).toHaveAttribute(
      "name",
      "custom-group",
    );
  });
});
