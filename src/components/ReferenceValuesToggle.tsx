/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}
/**
 * A toggle switch component for showing or hiding reference values in a chart.
 */
const ReferenceValuesToggle = ({
  checked,
  onChange,
  label = "Show reference values",
}: Props) => {
  return (
    <label className="tw:flex tw:items-center tw:gap-2 tw:ml-8 tw:text-sm tw:text-base-content tw:cursor-pointer tw:w-fit">
      <input
        type="checkbox"
        className="tw:toggle tw:toggle-sm tw:toggle-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
};

export default ReferenceValuesToggle;
