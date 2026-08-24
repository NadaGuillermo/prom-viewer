/**
 * @returns a promise that resolves once the MSW worker is ready, or immediately if mocking is not needed
 * @description Starts the MSW browser worker when either FHIR data or config files are
 * configured to come from local mock fixtures (VITE_DATA_SOURCE !== "smart" or
 * VITE_CONFIG_SOURCE !== "remote"). Runs in both dev and production builds, since mock
 * mode can also be used in a deployed demo, not just local development.
 */
export async function enableMocking(): Promise<void> {
  const needsFhirMocks = import.meta.env.VITE_DATA_SOURCE !== "smart";
  const needsConfigMocks = import.meta.env.VITE_CONFIG_SOURCE !== "remote";
  if (!needsFhirMocks && !needsConfigMocks) {
    return;
  }

  const { worker } = await import("./browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
}
