import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import PatientInfo from "@components/PatientInfo";
import type { Mapping } from "@utils/mapping";

const patient = (overrides: Partial<Mapping.Patient>): Mapping.Patient => ({
  id: "patient-1",
  familyName: "Musterperson",
  givenName: "Kim",
  ...overrides,
});

describe("PatientInfo", () => {
  it("renders the patient's full name", () => {
    render(<PatientInfo patient={patient({})} />);

    expect(screen.getByText("Kim Musterperson")).toBeInTheDocument();
  });

  it("does not render birth date or gender when absent", () => {
    render(<PatientInfo patient={patient({})} />);

    expect(screen.queryByText("Birth date:")).not.toBeInTheDocument();
    expect(screen.queryByText("Gender:")).not.toBeInTheDocument();
  });

  it("renders birth date when provided", () => {
    render(<PatientInfo patient={patient({ birthDate: "1990-01-01" })} />);

    expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  });

  it("renders gender when provided", () => {
    render(<PatientInfo patient={patient({ gender: "female" })} />);

    expect(screen.getByText("female")).toBeInTheDocument();
  });
});
