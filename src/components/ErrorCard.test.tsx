import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ErrorCard from "@components/ErrorCard";
import type { Errors } from "@utils/errors";

const issue = (overrides: Partial<Errors.DataIssue>): Errors.DataIssue => ({
  id: "issue-1",
  code: "unknown" as Errors.DataIssue["code"],
  level: "error",
  message: "default message",
  context: { resourceId: "res-1" },
  ...overrides,
});

describe("ErrorCard", () => {
  it("renders nothing but the card when there are no issues", () => {
    render(<ErrorCard data={[]} />);

    expect(screen.queryByText("Errors")).not.toBeInTheDocument();
    expect(screen.queryByText("Warnings")).not.toBeInTheDocument();
  });

  it("renders an Errors section for error-level issues", () => {
    render(
      <ErrorCard
        data={[issue({ id: "e1", level: "error", message: "Boom" })]}
      />,
    );

    expect(screen.getByText("Errors")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.queryByText("Warnings")).not.toBeInTheDocument();
  });

  it("renders a Warnings section for warning-level issues", () => {
    render(
      <ErrorCard
        data={[issue({ id: "w1", level: "warning", message: "Careful" })]}
      />,
    );

    expect(screen.getByText("Warnings")).toBeInTheDocument();
    expect(screen.getByText("Careful")).toBeInTheDocument();
    expect(screen.queryByText("Errors")).not.toBeInTheDocument();
  });

  it("renders both sections when both levels are present", () => {
    render(
      <ErrorCard
        data={[
          issue({ id: "e1", level: "error", message: "Boom" }),
          issue({ id: "w1", level: "warning", message: "Careful" }),
        ]}
      />,
    );

    expect(screen.getByText("Errors")).toBeInTheDocument();
    expect(screen.getByText("Warnings")).toBeInTheDocument();
  });

  it("prefers userMessage over message when both are present", () => {
    render(
      <ErrorCard
        data={[
          issue({
            id: "e1",
            level: "error",
            message: "raw internal message",
            userMessage: "Friendly message",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Friendly message")).toBeInTheDocument();
    expect(screen.queryByText("raw internal message")).not.toBeInTheDocument();
  });
});
