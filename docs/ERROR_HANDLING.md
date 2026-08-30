# Error Handling

Error handling is centralized in `src/utils/errors:

- `constants.ts` defines error codes,
- `errorDefinitions.ts` defines all possible error objects with their error details and display settings.

The app defines two types of error levels:

- **Errors** would break the visualization. If they concern a FHIR Questionnaire or QuestionnaireResponse, those questionnaires will not be displayed at all. If they concern an Observation resource or a single item, only the item/observation value is not shown; all other items of the questionnaire are.

- **Warnings** would not break the visualization. They often originate from inaccuracies or design flaws of the FHIR profiles or redundancies in the `proms.json` configuration file.

All normalization (`src/utils/normalization/`) and mapping (`src/utils/mapping/`) functions of FHIR resources return an array of errors that occured while processing the data. The errors are bundled in `App.tsx` and logged to the console with `console.error()`.

Moreover, for every error, it can be configured whether it shall additionally be displayed directly to the user on the UI. In this case the `ErrorCard.tsx` component is used to display them.

**Notes:**

- Apart from `ErrorCard.tsx`, app components do not show whether an error has occured. If data cannot be displayed it is simply omitted.
- Not all errors indicate flawed data.
- There are some errors that, in the current implementation, *always* occur for specific questionnaires due to design flaws or inaccuracies of the FHIR profiles.

> **Important:** Errors are not written to any persistent log file.
