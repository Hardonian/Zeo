1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T2f84,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OSS Governance Dashboard</title>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#13a4ec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                        "surface-dark": "#182830",
                        "border-dark": "#2a3b45"
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for technical look */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #101c22;
        }
        ::-webkit-scrollbar-thumb {
            background: #2a3b45;
            border-radius: 2px;
        }
        
        /* Blinking cursor effect */
        .blink-indicator {
            animation: blink 2s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        /* Scanline effect overlay */
        .scanlines {
            background: linear-gradient(
                to bottom,
                rgba(255,255,255,0),
                rgba(255,255,255,0) 50%,
                rgba(0,0,0,0.1) 50%,
                rgba(0,0,0,0.1)
            );
            background-size: 100% 4px;
            pointer-events: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased overflow-x-hidden min-h-screen flex flex-col relative">
<!-- Scanline Overlay -->
<div class="fixed inset-0 scanlines opacity-20 pointer-events-none z-50"></div>
<!-- Top App Bar -->
<header class="flex items-center justify-between p-4 pb-2 border-b border-border-dark bg-background-dark z-10 sticky top-0">
<div class="flex items-center gap-3">
<div class="text-primary flex size-8 shrink-0 items-center justify-center bg-primary/10 rounded">
<span class="material-symbols-outlined text-[20px]">terminal</span>
</div>
<div class="flex flex-col">
<h2 class="text-white text-sm font-bold leading-tight tracking-wider uppercase">React-Core</h2>
<span class="text-xs text-slate-400 font-mono tracking-tight">v18.2.0::MAIN</span>
</div>
</div>
<div class="flex items-center gap-2">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<p class="text-primary text-xs font-bold tracking-widest uppercase">MONITORING</p>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col p-4 gap-4 max-w-md mx-auto w-full">
<!-- System Status Banner -->
<div class="flex items-center justify-between border-l-4 border-primary bg-surface-dark pl-3 pr-2 py-2 rounded-r">
<h2 class="text-white tracking-widest text-sm font-bold">SYSTEM STATUS</h2>
<span class="text-primary font-mono text-sm">NORMAL</span>
</div>
<!-- License Hero Card -->
<section aria-label="License Information" class="relative group rounded-lg overflow-hidden border border-border-dark bg-surface-dark">
<!-- Background Image with Overlay -->
<div class="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay" data-alt="Abstract cyber security network nodes with blue light" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8hVTEe5ApuiG7KkPA0hg0aOe-0uPx7RhLyhPAbJZL_w6vCgQNq4W5ItSR3OXrjzPl2cHz5pEI-hEU8JzchgqB9bnu0KrsU4UX3JzDU9e0MGLEn2Vsv9p3umemHIWjcTKUwXNMfWP7SWO7FdfssC7flHkyIdkS6nuxnxQf7R9w0lc-UPkhdDrzUYwrz8dnBb0zswYlfygTvhdhdTFe7iegPy6XkkYVHGmh5UMay8scMoOqE9s3BwDTQ6wSinqrOhCL71hSEOSVM983");'>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-0"></div>
<div class="relative z-10 p-5 flex flex-col gap-6">
<div class="flex justify-between items-start">
<div class="flex flex-col gap-1">
<p class="text-slate-400 text-xs font-mono tracking-widest uppercase">CURRENT LICENSE</p>
<h3 class="text-white text-3xl font-bold tracking-tight">MIT LICENSE</h3>
</div>
<!-- Stamp Icon -->
<div class="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-primary rotate-[-12deg] opacity-80">
<span class="material-symbols-outlined">verified_user</span>
</div>
</div>
<div class="grid grid-cols-2 gap-4 border-t border-dashed border-slate-600/50 pt-4">
<div>
<p class="text-slate-500 text-[10px] font-mono uppercase mb-1">PERMISSION TYPE</p>
<p class="text-white text-sm font-medium">PERMISSIVE</p>
</div>
<div class="text-right">
<p class="text-slate-500 text-[10px] font-mono uppercase mb-1">VALIDITY</p>
<p class="text-primary text-sm font-bold">VERIFIED</p>
</div>
</div>
</div>
</section>
<!-- Contribution Rules Grid -->
<section>
<div class="flex items-center gap-2 mb-2 px-1">
<span class="material-symbols-outlined text-slate-500 text-sm">gavel</span>
<h3 class="text-slate-300 text-xs font-bold tracking-widest uppercase">CONTRIBUTION RULES</h3>
</div>
<div class="grid grid-cols-2 gap-px bg-border-dark rounded-lg overflow-hidden border border-border-dark">
<!-- Item 1 -->
<div class="bg-surface-dark p-3 flex flex-col gap-1">
<p class="text-slate-500 text-[10px] uppercase font-mono">CLA STATUS</p>
<div class="flex items-center gap-1.5">
<span class="size-1.5 rounded-full bg-primary"></span>
<p class="text-white text-xs font-medium">REQUIRED</p>
</div>
</div>
<!-- Item 2 -->
<div class="bg-surface-dark p-3 flex flex-col gap-1">
<p class="text-slate-500 text-[10px] uppercase font-mono">DCO SIGN</p>
<div class="flex items-center gap-1.5">
<span class="size-1.5 rounded-full bg-primary"></span>
<p class="text-white text-xs font-medium">SIGNED</p>
</div>
</div>
<!-- Item 3 -->
<div class="bg-surface-dark p-3 flex flex-col gap-1">
<p class="text-slate-500 text-[10px] uppercase font-mono">COC VERSION</p>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[10px] text-slate-400">history</span>
<p class="text-white text-xs font-medium">v2.1</p>
</div>
</div>
<!-- Item 4 -->
<div class="bg-surface-dark p-3 flex flex-col gap-1">
<p class="text-slate-500 text-[10px] uppercase font-mono">MAINTAINERS</p>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[10px] text-slate-400">group</span>
<p class="text-white text-xs font-medium">4 ACTIVE</p>
</div>
</div>
</div>
</section>
<!-- Live Compliance Checklist -->
<section class="flex flex-col flex-1">
<div class="flex items-center justify-between mb-2 px-1">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-500 text-sm">fact_check</span>
<h3 class="text-slate-300 text-xs font-bold tracking-widest uppercase">COMPLIANCE MATRIX</h3>
</div>
<span class="text-[10px] font-mono text-slate-500">LAST SCAN: 10s AGO</span>
</div>
<div class="bg-[#0c1216] border border-border-dark rounded-lg p-2 font-mono text-xs flex flex-col gap-1 shadow-inner overflow-hidden">
<!-- Header Check -->
<div class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group/item" data-status="pass">
<div class="flex items-center gap-3">
<span class="text-primary font-bold group-data-[status=pass]/item:text-primary group-data-[status=fail]/item:text-red-500">[PASS]</span>
<span class="text-slate-300">Header Checks</span>
</div>
<span class="text-slate-600 text-[10px]">12ms</span>
</div>
<!-- Dependency Audit -->
<div class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group/item" data-status="pass">
<div class="flex items-center gap-3">
<span class="text-primary font-bold group-data-[status=pass]/item:text-primary group-data-[status=fail]/item:text-red-500">[PASS]</span>
<span class="text-slate-300">Dependency Audit</span>
</div>
<span class="text-slate-600 text-[10px]">0 vulns</span>
</div>
<!-- Binary Scan -->
<div class="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20 group/item" data-status="fail">
<div class="flex items-center gap-3">
<span class="text-red-500 font-bold group-data-[status=pass]/item:text-primary group-data-[status=fail]/item:text-red-500">[FAIL]</span>
<span class="text-white">Binary File Scan</span>
</div>
<span class="text-red-400 text-[10px]">1 DETECTED</span>
</div>
<!-- Secret Detection -->
<div class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group/item" data-status="pass">
<div class="flex items-center gap-3">
<span class="text-primary font-bold group-data-[status=pass]/item:text-primary group-data-[status=fail]/item:text-red-500">[PASS]</span>
<span class="text-slate-300">Secret Detection</span>
</div>
<span class="text-slate-600 text-[10px]">Clean</span>
</div>
<!-- Branch Protection -->
<div class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group/item" data-status="pass">
<div class="flex items-center gap-3">
<span class="text-primary font-bold group-data-[status=pass]/item:text-primary group-data-[status=fail]/item:text-red-500">[PASS]</span>
<span class="text-slate-300">Branch Protection</span>
</div>
<span class="text-slate-600 text-[10px]">Active</span>
</div>
<!-- Metadata Check -->
<div class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group/item" data-status="pass">
<div class="flex items-center gap-3">
<span class="text-primary font-bold group-data-[status=pass]/item:text-primary group-data-[status=fail]/item:text-red-500">[PASS]</span>
<span class="text-slate-300">Metadata Check</span>
</div>
<span class="text-slate-600 text-[10px]">Valid</span>
</div>
</div>
</section>
<!-- Action Footer -->
<div class="mt-2 grid grid-cols-2 gap-3 pb-4">
<button class="flex flex-col items-center justify-center p-3 rounded-lg border border-border-dark bg-surface-dark hover:bg-border-dark/50 hover:border-primary/50 transition-all group">
<span class="material-symbols-outlined text-slate-400 mb-1 group-hover:text-primary transition-colors">security</span>
<span class="text-xs font-bold text-white tracking-wide">POLICY.MD</span>
</button>
<button class="flex flex-col items-center justify-center p-3 rounded-lg border border-border-dark bg-surface-dark hover:bg-border-dark/50 hover:border-primary/50 transition-all group">
<span class="material-symbols-outlined text-slate-400 mb-1 group-hover:text-primary transition-colors">download</span>
<span class="text-xs font-bold text-white tracking-wide">AUDIT LOG</span>
</button>
</div>
</main>
<!-- Bottom Indicator Line -->
<div class="h-1.5 w-full bg-surface-dark mt-auto border-t border-border-dark">
<div class="h-full w-1/3 bg-primary animate-pulse"></div>
</div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Oss Governance Dashboard"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Oss Governance Dashboard","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
