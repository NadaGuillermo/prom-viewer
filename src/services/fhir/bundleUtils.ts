/**
 * @param bundle - a FHIR Bundle resource (searchset or collection)
 * @param resourceType - the FHIR resourceType to extract from the bundle's entries
 * @returns the resources of the given resourceType contained in the bundle
 * @description Flattens Bundle.entry[].resource into a plain resource array, filtered by resourceType.
 */
export function extractResourcesFromBundle(
  bundle: any,
  resourceType: string,
): any[] {
  const entries: any[] = bundle?.entry ?? [];
  return entries
    .filter((entry) => entry.resource?.resourceType === resourceType)
    .map((entry) => entry.resource);
}

/**
 * @param bundles - a list of FHIR Bundle resources
 * @param resourceType - the FHIR resourceType to extract from each bundle's entries
 * @returns the resources of the given resourceType contained across all bundles
 * @description Applies extractResourcesFromBundle to multiple bundles and flattens the result.
 */
export function extractResourcesFromBundles(
  bundles: any[],
  resourceType: string,
): any[] {
  return bundles.flatMap((bundle) =>
    extractResourcesFromBundle(bundle, resourceType),
  );
}
