
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Synchronizing upstream repos...');

// 1. Pull (Git Subtree)
const pullSubtree = (prefix, remote, branch) => {
    try {
        console.log(`Pulling ${remote}...`);
        try {
            execSync(`git remote get-url ${remote}`, { stdio: 'ignore' });
        } catch {
            console.warn(`Remote ${remote} not found, skipping pull.`);
            return;
        }

        execSync(`git subtree pull --prefix=${prefix} ${remote} ${branch} --squash`, { stdio: 'inherit' });
    } catch (e) {
        console.warn(`${remote} pull failed (possibly no changes or merge conflict).`);
    }
};

if (process.env.SKIP_GIT_PULL !== 'true') {
    // Attempt pulls
    pullSubtree('vendor/controlplane', 'controlplane', 'main');
    pullSubtree('vendor/readylayer', 'readylayer', 'main');
}

// 2. Copy Helper
const copyDir = (src, dest) => {
    const srcPath = path.resolve(src);
    const destPath = path.resolve(dest);

    if (!fs.existsSync(srcPath)) {
        console.warn(`Source ${src} does not exist!`);
        return;
    }

    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
    }

    // Use cp -r approach
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    console.log(`Copied ${src} -> ${dest}`);
};

// 3. Sync Packages
console.log('Syncing Policy Engine...');
// Copy to src directly so 'index.ts' is at src/index.ts
copyDir('vendor/readylayer/services/policy-engine', 'packages/policy/src');

const ensurePackageJson = (dir, name, deps = {}) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        const pkg = {
            name,
            version: '0.0.1',
            type: 'module',
            main: 'src/index.ts',
            scripts: {
                "build": "tsc",
                "test": "vitest run"
            },
            dependencies: {
                "zod": "^3.22.4",
                "js-yaml": "^4.1.0",
                ...deps
            },
            devDependencies: {
                "typescript": "^5.3.3",
                "vitest": "^1.1.0",
                "@types/node": "^20.10.0"
            }
        };
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(`Created ${pkgPath}`);
    }
};

ensurePackageJson('packages/policy', '@zeo/policy');

console.log('Syncing Static Analysis...');
copyDir('vendor/readylayer/services/static-analysis', 'packages/analysis/src');

// Sync code-parser as it is a dependency of static-analysis
console.log('Syncing Code Parser...');
copyDir('vendor/readylayer/services/code-parser', 'packages/analysis/src/code-parser');

// Fix import in static-analysis index.ts
const analysisIndex = path.join('packages/analysis/src', 'index.ts');
if (fs.existsSync(analysisIndex)) {
    let content = fs.readFileSync(analysisIndex, 'utf8');
    content = content.replace("'../code-parser'", "'./code-parser'");
    content = content.replace('"../code-parser"', '"./code-parser"');
    fs.writeFileSync(analysisIndex, content);
    console.log('Fixed imports in packages/analysis/src/index.ts');
}

ensurePackageJson('packages/analysis', '@zeo/analysis');

console.log('Sync Complete.');
