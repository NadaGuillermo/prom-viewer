/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Mapping from "@utils/mapping";

interface Props {
  patient: Mapping.Patient;
}

/**
 * Component showing patient data
 */
const PatientInfo = ({ patient }: Props) => {
  const { familyName, givenName, gender, birthDate } = patient;

  return (
    <>
      <div className="tw:flex tw:flex-wrap tw:gap-2 tw:items-baseline tw:max-w-8/10 tw:md:max-w-none">
        <div>
          <div className="tw:mr-4 tw:text-left">
            <span className="h3">Patient</span>
          </div>
        </div>
        <>
          <div className="tw:border-r tw:pr-2 border-medium">
            <span className="tw:font-semibold">Name: </span>{" "}
            {givenName + " " + familyName}
          </div>
        </>
        {birthDate!== undefined && (
          <>
            <div className="tw:border-r tw:pr-2 border-medium">
              <span className="tw:font-semibold">Birth date: </span> {birthDate}
            </div>
          </>
        )}
        {gender !== undefined && (
          <>
            <div>
              <span className="tw:font-semibold">Gender: </span> {gender}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PatientInfo;
