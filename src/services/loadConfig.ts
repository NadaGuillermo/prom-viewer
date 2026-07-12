export async function loadConfig(): Promise<any> {
    const response = await fetch(`${import.meta.env.BASE_URL}config/proms.json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    return config;
}