/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { createContext } from "react";

// Lets LineChart instances nested anywhere within a group's children (not
// necessarily direct children) pick up the group's toggle state without the
// group having to walk/clone its own children tree.
export const ShowReferenceValuesContext = createContext(false);
