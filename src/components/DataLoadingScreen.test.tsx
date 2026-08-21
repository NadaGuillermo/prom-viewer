import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import DataLoadingScreen from "@components/DataLoadingScreen";

describe("DataLoadingScreen", () => {
  it("renders the default message and no sub-message", () => {
    const { container } = render(<DataLoadingScreen />);

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(container.querySelector(".tw\\:loading-spinner")).toBeInTheDocument();
  });

  it("renders a custom message and sub-message", () => {
    render(
      <DataLoadingScreen
        message="Fetching data"
        subMessage="This may take a few moments..."
      />,
    );

    expect(screen.getByText("Fetching data")).toBeInTheDocument();
    expect(
      screen.getByText("This may take a few moments..."),
    ).toBeInTheDocument();
  });

  it.each(["spinner", "dots", "bars"] as const)(
    "renders the %s animation variant",
    (animation) => {
      const { container } = render(
        <DataLoadingScreen animation={animation} />,
      );

      expect(
        container.querySelector(`.tw\\:loading-${animation}`),
      ).toBeInTheDocument();
    },
  );
});
