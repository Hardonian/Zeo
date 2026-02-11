import { sign as jwtSign } from "jsonwebtoken";

/**
 * Generate a GitHub App JWT
 */
export function generateGitHubAppJwt(
    appId: string,
    privateKey: string,
    expirationSeconds = 600
): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iat: now - 60, // Issued 60 seconds ago for clock drift
        exp: now + expirationSeconds,
        iss: appId,
    };

    return jwtSign(payload, privateKey, { algorithm: "RS256" });
}

/**
 * Interface for Installation Token response
 */
export interface InstallationTokenResponse {
    token: string;
    expires_at: string;
    permissions: Record<string, string>;
    repository_selection: "all" | "selected";
}

/**
 * Get an installation access token
 */
export async function getInstallationAccessToken(
    appJwt: string,
    installationId: string
): Promise<InstallationTokenResponse> {
    const response = await fetch(
        `https://api.github.com/app/installations/${installationId}/access_tokens`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${appJwt}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Antigravity-Sync",
            },
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get installation access token: ${response.statusText} - ${errorBody}`);
    }

    return (await response.json()) as InstallationTokenResponse;
}
