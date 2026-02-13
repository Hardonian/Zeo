1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T34ad,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Provenance Explorer</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0df26c",
                        "background-light": "#f5f8f7",
                        "background-dark": "#102217",
                        "surface-dark": "#183225",
                        "border-dark": "#316848",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["Space Mono", "monospace"] // Fallback if needed, though Grotesk is good
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
            font-family: "Space Grotesk", sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex items-end justify-center sm:items-center">
<!-- Modal / Bottom Sheet Container -->
<div class="relative flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-background-light dark:bg-background-dark shadow-2xl border-t sm:border border-slate-200 dark:border-border-dark">
<!-- Header Section -->
<div class="flex-none bg-background-light dark:bg-background-dark pt-3 pb-2 px-6 sticky top-0 z-20 border-b border-slate-200 dark:border-border-dark">
<!-- Drag Handle -->
<div class="flex items-center justify-center pb-4">
<div class="h-1 w-12 rounded-full bg-slate-300 dark:bg-border-dark"></div>
</div>
<div class="flex items-start justify-between gap-4">
<div class="flex flex-col gap-1">
<h1 class="text-xl font-bold leading-tight tracking-tight dark:text-white">Provenance Explorer</h1>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-primary">verified</span>
<p class="text-slate-500 dark:text-[#90cba9] text-sm font-medium">Evidence Trail for Fact #FCT-8092</p>
</div>
</div>
<button class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-border-dark transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-white text-xl">close</span>
</button>
</div>
</div>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto hide-scrollbar pb-24">
<!-- Key Stats Grid -->
<div class="grid grid-cols-2 gap-3 p-4">
<div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-slate-100 dark:border-border-dark">
<div class="flex items-center justify-between">
<span class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#90cba9]">Reputation</span>
<span class="material-symbols-outlined text-primary text-lg">shield</span>
</div>
<div class="flex items-end gap-2">
<span class="text-2xl font-bold dark:text-white">98/100</span>
</div>
<div class="flex items-center gap-1 text-xs font-medium text-primary">
<span class="material-symbols-outlined text-sm">trending_up</span>
<span>+2.5% vs avg</span>
</div>
</div>
<div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-slate-100 dark:border-border-dark">
<div class="flex items-center justify-between">
<span class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#90cba9]">Network</span>
<span class="material-symbols-outlined text-primary text-lg">hub</span>
</div>
<div class="flex items-end gap-2">
<span class="text-2xl font-bold dark:text-white">12</span>
<span class="text-sm pb-1 text-slate-500 dark:text-slate-400">Nodes</span>
</div>
<div class="flex items-center gap-1 text-xs font-medium text-primary">
<span class="material-symbols-outlined text-sm">check_circle</span>
<span>Fully Synced</span>
</div>
</div>
</div>
<!-- Timeline Section -->
<div class="px-6 py-2">
<div class="relative">
<!-- Vertical Line Background -->
<div class="absolute left-[19px] top-4 h-[calc(100%-24px)] w-[2px] bg-slate-200 dark:bg-border-dark"></div>
<!-- Step 01: Origin -->
<div class="group relative mb-8 grid grid-cols-[40px_1fr] gap-4">
<div class="relative flex flex-col items-center">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark border-2 border-slate-200 dark:border-border-dark z-10 group-hover:border-primary group-hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
<span class="material-symbols-outlined text-xl">public</span>
</div>
<!-- Active Line Segment -->
<div class="absolute top-10 h-full w-[2px] bg-primary"></div>
</div>
<div class="flex flex-col pt-1">
<div class="flex items-center justify-between mb-1">
<span class="text-xs font-bold uppercase tracking-widest text-primary">01. Origin</span>
<span class="text-xs font-mono text-slate-400 dark:text-slate-500">14:02 UTC</span>
</div>
<div class="rounded-lg bg-white dark:bg-surface-dark p-3 border border-slate-100 dark:border-border-dark shadow-sm">
<h3 class="font-bold text-slate-800 dark:text-white text-base mb-1">Bloomberg Terminal API</h3>
<p class="text-xs text-slate-500 dark:text-[#90cba9] mb-2 flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">link</span>
                                    api.bloomberg.com/v1/markets
                                </p>
<div class="flex items-center gap-2">
<span class="inline-flex items-center rounded-md bg-slate-100 dark:bg-background-dark px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">
                                        Source ID: BLM-99
                                    </span>
</div>
</div>
</div>
</div>
<!-- Step 02: Capture -->
<div class="group relative mb-8 grid grid-cols-[40px_1fr] gap-4">
<div class="relative flex flex-col items-center">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark border-2 border-slate-200 dark:border-border-dark z-10 group-hover:border-primary group-hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
<span class="material-symbols-outlined text-xl">fingerprint</span>
</div>
<!-- Active Line Segment -->
<div class="absolute top-10 h-full w-[2px] bg-primary"></div>
</div>
<div class="flex flex-col pt-1">
<div class="flex items-center justify-between mb-1">
<span class="text-xs font-bold uppercase tracking-widest text-primary">02. Capture</span>
<span class="text-xs font-mono text-slate-400 dark:text-slate-500">Locked</span>
</div>
<div class="rounded-lg bg-white dark:bg-surface-dark p-3 border border-slate-100 dark:border-border-dark shadow-sm">
<div class="flex items-center justify-between mb-2">
<span class="text-xs text-slate-500 dark:text-slate-400">SHA-256 Hash</span>
<span class="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                                        Immutable
                                    </span>
</div>
<div class="flex items-center justify-between rounded bg-slate-50 dark:bg-background-dark px-3 py-2">
<code class="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-[160px]">8a7f7291...9e10</code>
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">content_copy</span>
</button>
</div>
</div>
</div>
</div>
<!-- Step 03: Analysis -->
<div class="group relative mb-8 grid grid-cols-[40px_1fr] gap-4">
<div class="relative flex flex-col items-center">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark border-2 border-slate-200 dark:border-border-dark z-10 group-hover:border-primary group-hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
<span class="material-symbols-outlined text-xl">analytics</span>
</div>
<!-- Inactive Line Segment (Dashed) for pending steps or end of verified chain -->
<div class="absolute top-10 h-full w-[2px] bg-primary"></div>
</div>
<div class="flex flex-col pt-1">
<div class="flex items-center justify-between mb-1">
<span class="text-xs font-bold uppercase tracking-widest text-primary">03. Analysis</span>
<span class="text-xs font-mono text-slate-400 dark:text-slate-500">42 Peers</span>
</div>
<div class="rounded-lg bg-white dark:bg-surface-dark p-3 border border-slate-100 dark:border-border-dark shadow-sm">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-medium text-slate-800 dark:text-white">Trust Score</span>
<span class="text-sm font-bold text-primary">92/100</span>
</div>
<div class="h-1.5 w-full rounded-full bg-slate-100 dark:bg-background-dark overflow-hidden">
<div class="h-full w-[92%] rounded-full bg-primary"></div>
</div>
<div class="mt-2 flex gap-2">
<span class="inline-flex items-center gap-1 rounded bg-slate-50 dark:bg-background-dark px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-border-dark">
<span class="material-symbols-outlined text-[10px]">check</span> Validated
                                    </span>
<span class="inline-flex items-center gap-1 rounded bg-slate-50 dark:bg-background-dark px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-border-dark">
<span class="material-symbols-outlined text-[10px]">group</span> Consensus
                                    </span>
</div>
</div>
</div>
</div>
<!-- Step 04: Adjustments -->
<div class="group relative grid grid-cols-[40px_1fr] gap-4">
<div class="relative flex flex-col items-center">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border-2 border-primary z-10 text-primary animate-pulse">
<span class="material-symbols-outlined text-xl">tune</span>
</div>
</div>
<div class="flex flex-col pt-1">
<div class="flex items-center justify-between mb-1">
<span class="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">04. Adjustments</span>
<span class="text-xs font-mono text-slate-400 dark:text-slate-500">Now</span>
</div>
<div class="rounded-lg bg-white dark:bg-surface-dark p-3 border border-primary/30 shadow-[0_0_15px_-3px_rgba(13,242,108,0.1)]">
<p class="text-sm text-slate-800 dark:text-white mb-2">Bias Detected: <span class="font-bold">Market Volatility</span></p>
<div class="flex items-center gap-3">
<div class="flex-1 h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden relative">
<div class="absolute left-0 top-0 bottom-0 w-1/2 bg-transparent border-r border-slate-300 dark:border-slate-600 z-10"></div> <!-- Center marker -->
<div class="h-full w-[65%] bg-gradient-to-r from-transparent via-primary/50 to-primary rounded-full"></div>
</div>
<span class="text-xs font-mono font-bold text-primary">+0.5 weight</span>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Detailed Metadata (JSON-like) -->
<div class="mt-4 border-t border-slate-200 dark:border-border-dark p-6">
<h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#90cba9] mb-4">Raw Metadata</h4>
<div class="grid grid-cols-1 gap-y-4 text-sm">
<div class="grid grid-cols-[100px_1fr] gap-2">
<span class="text-slate-500 dark:text-slate-400">Block ID</span>
<span class="font-mono text-slate-800 dark:text-slate-200 truncate">#892019283</span>
</div>
<div class="grid grid-cols-[100px_1fr] gap-2">
<span class="text-slate-500 dark:text-slate-400">Timestamp</span>
<span class="font-mono text-slate-800 dark:text-slate-200">2023-10-24T14:02:11Z</span>
</div>
<div class="grid grid-cols-[100px_1fr] gap-2">
<span class="text-slate-500 dark:text-slate-400">Validator</span>
<span class="font-mono text-slate-800 dark:text-slate-200">System Automation V2</span>
</div>
</div>
</div>
</div>
<!-- Sticky Footer Action -->
<div class="absolute bottom-0 left-0 right-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm p-4 border-t border-slate-200 dark:border-border-dark z-30">
<button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-background-dark font-bold text-sm hover:bg-[#0be063] transition-colors shadow-[0_0_20px_-5px_rgba(13,242,108,0.4)]">
<span class="material-symbols-outlined text-lg">fact_check</span>
                Verify on Ledger
            </button>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Provenance Explorer Panel","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Provenance Explorer Panel","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
