import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { scanForSecrets, type SecretMatch } from "./secrets.js";

export interface ScanResult {
    file: string;
    secrets: SecretMatch[];
}

export function scanDirectory(
    dir: string,
    options: {
        extensions?: string[];
        ignore?: string[];
        recursive?: boolean;
    } = {}
): ScanResult[] {
    const results: ScanResult[] = [];
    const recursive = options.recursive ?? true;
    const ignore = new Set(options.ignore ?? [".git", "node_modules", "dist", ".zeo"]);

    function walk(currentDir: string) {
        let entries;
        try {
            entries = readdirSync(currentDir);
        } catch {
            return;
        }

        for (const entry of entries) {
            if (ignore.has(entry)) continue;

            const path = join(currentDir, entry);
            let stat;
            try {
                stat = statSync(path);
            } catch {
                continue;
            }

            if (stat.isDirectory()) {
                if (recursive) walk(path);
            } else if (stat.isFile()) {
                if (options.extensions && !options.extensions.some(ext => path.endsWith(ext))) {
                    continue;
                }

                // Only scan text files roughly
                if (stat.size > 1024 * 1024) continue; // Skip large files > 1MB

                try {
                    const content = readFileSync(path, "utf8");
                    const secrets = scanForSecrets(content);
                    if (secrets.length > 0) {
                        results.push({ file: path, secrets });
                    }
                } catch {
                    // Ignore read errors
                }
            }
        }
    }

    walk(dir);
    return results;
}
