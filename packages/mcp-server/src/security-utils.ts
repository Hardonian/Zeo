/**
 * SSRF and URL Validator
 * Prevents tools from accessing internal networks or forbidden domains.
 */
export class SecurityUtils {
  private static readonly FORBIDDEN_IP_RANGES = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^::1$/,
    /^fe80:/,
  ];

  /**
   * Validate a URL for SSRF protection.
   * Ensures the URL is global and not pointing to internal infrastructure.
   */
  static validateUrlForSsrf(urlStr: string, allowlist?: string[]): boolean {
    try {
      const url = new URL(urlStr);

      // 1. Protocol check
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      // 2. Allowlist check (if provided)
      if (allowlist && allowlist.length > 0) {
        return allowlist.includes(url.hostname);
      }

      // 3. Forbidden IP check
      const host = url.hostname;
      if (this.FORBIDDEN_IP_RANGES.some(range => range.test(host))) {
        return false;
      }

      // 4. Metadata service check (Cloud-specific SSRF)
      if (host === "169.254.169.254" || host === "metadata.google.internal") {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize filename to prevent Path Traversal.
   */
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9_\-\.]/gi, "_").replace(/\.\.+/g, ".");
  }
}
