# Constraints with the MII FHIR Profiles

This file can be considered a collection of design inaccuracies of the FHIR profiles that need to be manually addressed for the app to run properly.

## ObservationDefinition

The ObservationDefinition profile does not define a field for a canonical URL (as for example Questionnaire does). However, such a field is needed to map an Observation to its corresponding ObservationDefinition. It is also needed for some configurations in `proms.json`.

Thus, a field `url` has been manually inserted in all ObservationDefinition resources. Its value has to be referenced in the `instantiatesCanonical` extension of Observation.

## Questionnaire

Some Questionnaire profiles may define an answer option for an item for the case that the patient does not choose or give any answer. For instance, the EQ-5D-5L *Collectable* questionnaire uses the value 9 for this purpose. However, if there is no syntactical difference between a real answer option (in the example case, 1 to 5 for the dimension items) and the one for no answer selected (9 in the example), the app is not able to filter out the latter.

Consequently, this results in a flawed normalization of the values and the visualization can be misleading. There is no current way known of how to detect that answer option value if it is not simply `null`.

In case of the EQ-5D-5L, the app uses the EQ-5D-5L *Minimal* questionnaire resource instead. The other questionnaires which are currently available on the Simplifier (EORTC QLQ-C30, PHQ-9, PROMIS-29) do not define an answer option for the *not selected* case and therefore do not cause this issue.
