
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
copyDir('vendor/readylayer/services/policy-engine', 'packages/policy/src');

const policyIndex = path.join('packages/policy/src', 'index.ts');
if (fs.existsSync(policyIndex)) {
    let content = fs.readFileSync(policyIndex, 'utf8');

    // 1. Remove DB imports
    content = content.replace(/import\s+{\s*Prisma\s*}\s*from\s*['"]@prisma\/client['"];?/g, '');
    content = content.replace(/import\s+{\s*prisma\s*}\s*from\s*['"]\.\.\/\.\.\/lib\/prisma['"];?/g, '// import { prisma } from "../../lib/prisma";');
    content = content.replace(/import\s+{\s*Issue\s*}\s*from\s*['"]\.\.\/static-analysis['"];?/g, 'import { Issue } from "@zeo/analysis";');
    content = content.replace(/import\s+.*\s+from\s*['"]\.\.\/\.\.\/billing['"];?/g, '');

    // 2. Patch loadEffectivePolicy to be mock-only
    const mockPolicyBody = `
    console.log('[Policy] Loading effective policy (MOCKED)...');
    // Return a default mock policy
    const defaultRule: PolicyRule = {
        id: 'default',
        ruleId: '*', 
        severityMapping: { critical: 'block', high: 'warn', medium: 'allow', low: 'allow' },
        enabled: true,
    };
    const rulesMap = new Map<string, PolicyRule>();
    rulesMap.set('*', defaultRule);
    
    return Promise.resolve({
        pack: {
            id: 'mock-policy',
            organizationId,
            repositoryId,
            version: '1.0.0',
            source: 'mock',
            checksum: 'mock-sum',
            rules: [defaultRule],
        },
        rules: rulesMap,
        waivers: [],
    });
    `;

    // Regex to replace the body of loadEffectivePolicy
    // This is tricky with regex. We'll strict replace the start of the method.
    content = content.replace(
        /async\s+loadEffectivePolicy\s*\([\s\S]*?\)\s*:\s*Promise<EffectivePolicy>\s*{[\s\S]*?return\s*{\s*pack[\s\S]*?};\s*}/m,
        `async loadEffectivePolicy(organizationId: string, repositoryId: string | null, _ref?: string, _branch?: string): Promise<EffectivePolicy> { ${mockPolicyBody} }`
    );

    // 3. Patch produceEvidence to skip DB
    content = content.replace(
        /const bundle = await prisma\.evidenceBundle\.create\([\s\S]*?\);/m,
        `console.log('[Policy] Would persist evidence bundle to DB', inputsMetadata);
         const bundle: any = { id: 'mock-bundle-' + Date.now(), createdAt: new Date(), ...outputs.evaluationResult };`
    );

    // 4. Remove getDefaultPolicy usage of billing
    content = content.replace(/const { billingService } = await import\('\.\.\/\.\.\/billing'\);/g, '// const { billingService } ...');
    content = content.replace(/await billingService\.getEnforcementStrength\(organizationId\)/g, '"basic"');

    // 5. Fix implicit any in maps
    content = content.replace(/\(r\)/g, '(r: any)');
    content = content.replace(/\(w\)/g, '(w: any)');

    fs.writeFileSync(policyIndex, content);
    console.log('Patched packages/policy/src/index.ts for Mock Mode');
}

// Patch inheritance.ts to remove observability imports
const inheritancePath = path.join('packages/policy/src', 'inheritance.ts');
if (fs.existsSync(inheritancePath)) {
    let content = fs.readFileSync(inheritancePath, 'utf8');
    content = content.replace(/import\s+.*\s+from\s*['"]@\/observability.*['"];?/g, '');
    fs.writeFileSync(inheritancePath, content);
}

// Patch templates.ts
const templatesPath = path.join('packages/policy/src', 'templates.ts');
if (fs.existsSync(templatesPath)) {
    let content = fs.readFileSync(templatesPath, 'utf8');
    content = content.replace(/import\s+.*\s+from\s*['"]@\/observability.*['"];?/g, '');
    fs.writeFileSync(templatesPath, content);
}

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

    const tsConfigPath = path.join(dir, 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
        const tsConfig = {
            "extends": "../../tsconfig.base.json",
            "compilerOptions": {
                "outDir": "dist",
                "rootDir": "src",
                "moduleResolution": "bundler"
            },
            "include": ["src/**/*"]
        };
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
        console.log(`Created ${tsConfigPath}`);
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

ensurePackageJson('packages/analysis', '@zeo/analysis', {
    "@babel/parser": "^7.28.6",
    "@babel/types": "^7.28.6"
});

console.log('Sync Complete.');
