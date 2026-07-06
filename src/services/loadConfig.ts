export async function loadConfig(): Promise<any> {
    const response = await fetch('/config/proms.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    return config;
}