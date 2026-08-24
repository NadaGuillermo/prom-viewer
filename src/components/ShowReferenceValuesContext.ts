import { createContext } from "react";

// Lets LineChart instances nested anywhere within a group's children (not
// necessarily direct children) pick up the group's toggle state without the
// group having to walk/clone its own children tree.
export const ShowReferenceValuesContext = createContext(false);
