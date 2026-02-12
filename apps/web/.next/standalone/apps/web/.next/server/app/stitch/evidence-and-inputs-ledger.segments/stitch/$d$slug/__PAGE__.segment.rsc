1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T3355,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Evidence Ledger</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1258e2",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#1a2332",
                        "accent-green": "#0bda5e",
                        "accent-orange": "#ff9f0a",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #101622;
        }
        ::-webkit-scrollbar-thumb {
            background: #232f48;
            border-radius: 2px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-hidden h-screen flex flex-col">
<!-- Top App Bar -->
<header class="flex-none flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 z-10">
<div class="flex flex-col">
<h1 class="text-xl font-bold tracking-tight">Evidence Ledger</h1>
<div class="flex items-center gap-1.5 mt-0.5">
<div class="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></div>
<span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Synced to Node_04</span>
</div>
</div>
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-300">cloud_done</span>
</button>
</header>
<!-- Main Content Area -->
<main class="flex-1 overflow-y-auto relative w-full max-w-md mx-auto sm:max-w-full">
<!-- Segmented Control -->
<div class="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm pt-4 pb-2 px-4">
<div class="flex p-1 bg-slate-200 dark:bg-[#232f48] rounded-lg">
<button class="flex-1 py-1.5 px-3 rounded text-sm font-medium shadow-sm bg-white dark:bg-background-dark text-slate-900 dark:text-white transition-all">
                    Active Feed
                </button>
<button class="flex-1 py-1.5 px-3 rounded text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                    Knowledge Base
                </button>
</div>
<!-- Date separator example -->
<div class="flex items-center gap-4 py-4">
<div class="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
<span class="text-xs font-mono text-slate-400 dark:text-slate-500">TODAY, OCT 24</span>
<div class="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
</div>
</div>
<!-- Evidence List -->
<div class="px-4 pb-24 space-y-3">
<!-- Card 1: Fact -->
<div class="group relative flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:border-accent-green/30">
<div class="flex items-start justify-between gap-3">
<div class="flex gap-3">
<div class="flex-none flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-accent-green">
<span class="material-symbols-outlined filled">check_circle</span>
</div>
<div>
<div class="flex items-center gap-2 mb-1">
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Fact</span>
<span class="text-xs font-mono text-slate-400">10:42 AM</span>
</div>
<h3 class="text-base font-semibold leading-snug text-slate-800 dark:text-slate-100">Q3 Revenue Report released</h3>
</div>
</div>
<button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span class="material-symbols-outlined text-xl">more_vert</span>
</button>
</div>
<div class="pl-[3.25rem]">
<div class="flex flex-wrap gap-y-2 gap-x-4 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">fingerprint</span>
                            src: sec_filing_v2
                        </span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">link</span>
                            #8f2a9c
                        </span>
</div>
<div class="flex items-center gap-2 py-2 px-3 rounded bg-slate-50 dark:bg-[#111722] border border-slate-100 dark:border-slate-800">
<span class="material-symbols-outlined text-slate-400 text-sm">hub</span>
<span class="text-xs font-medium text-slate-600 dark:text-slate-300">Impact: Confirmed Model A</span>
</div>
</div>
<div class="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-accent-green"></div>
</div>
<!-- Card 2: Belief -->
<div class="group relative flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:border-primary/30">
<div class="flex items-start justify-between gap-3">
<div class="flex gap-3">
<div class="flex-none flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-primary">
<span class="material-symbols-outlined">balance</span>
</div>
<div>
<div class="flex items-center gap-2 mb-1">
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Belief</span>
<span class="text-xs font-mono text-slate-400">09:15 AM</span>
</div>
<h3 class="text-base font-semibold leading-snug text-slate-800 dark:text-slate-100">Competitor X will launch feature Y</h3>
</div>
</div>
<button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span class="material-symbols-outlined text-xl">more_vert</span>
</button>
</div>
<div class="pl-[3.25rem]">
<div class="flex flex-wrap gap-y-2 gap-x-4 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
<span class="flex items-center gap-1 text-primary">
<span class="material-symbols-outlined text-[14px]">show_chart</span>
                            Prob: 75%
                        </span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">person</span>
                            User: J.Doe
                        </span>
</div>
<!-- Probability Visualizer -->
<div class="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
<div class="h-full bg-primary w-3/4 rounded-full"></div>
</div>
<div class="flex items-center gap-2 py-2 px-3 rounded bg-slate-50 dark:bg-[#111722] border border-slate-100 dark:border-slate-800">
<span class="material-symbols-outlined text-slate-400 text-sm">hub</span>
<span class="text-xs font-medium text-slate-600 dark:text-slate-300">Impact: Shifted Tree Branch B</span>
</div>
</div>
<div class="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-primary"></div>
</div>
<!-- Card 3: Assumption -->
<div class="group relative flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:border-accent-orange/30">
<div class="flex items-start justify-between gap-3">
<div class="flex gap-3">
<div class="flex-none flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-accent-orange">
<span class="material-symbols-outlined">warning</span>
</div>
<div>
<div class="flex items-center gap-2 mb-1">
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">Assumption</span>
<span class="text-xs font-mono text-slate-400">08:30 AM</span>
</div>
<h3 class="text-base font-semibold leading-snug text-slate-800 dark:text-slate-100">Supply chain latency &lt; 5 days</h3>
</div>
</div>
<button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span class="material-symbols-outlined text-xl">more_vert</span>
</button>
</div>
<div class="pl-[3.25rem]">
<div class="flex flex-wrap gap-y-2 gap-x-4 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
<span class="flex items-center gap-1 text-accent-orange">
<span class="material-symbols-outlined text-[14px]">priority_high</span>
                            Risk: High
                        </span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">verified_user</span>
                            Unverified
                        </span>
</div>
<div class="flex items-center gap-2 py-2 px-3 rounded bg-slate-50 dark:bg-[#111722] border border-slate-100 dark:border-slate-800">
<span class="material-symbols-outlined text-slate-400 text-sm">hub</span>
<span class="text-xs font-medium text-slate-600 dark:text-slate-300">Impact: Critical Dependency</span>
</div>
</div>
<div class="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-accent-orange"></div>
</div>
<!-- Card 4: Fact (Earlier) -->
<div class="group relative flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 shadow-sm opacity-70">
<div class="flex items-start justify-between gap-3">
<div class="flex gap-3">
<div class="flex-none flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-accent-green">
<span class="material-symbols-outlined filled">check_circle</span>
</div>
<div>
<div class="flex items-center gap-2 mb-1">
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Fact</span>
<span class="text-xs font-mono text-slate-400">YESTERDAY</span>
</div>
<h3 class="text-base font-semibold leading-snug text-slate-800 dark:text-slate-100">User Growth rate stabilizing</h3>
</div>
</div>
</div>
<div class="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-accent-green"></div>
</div>
</div>
</main>
<!-- Floating Action Button -->
<div class="absolute bottom-24 right-4 z-20">
<button class="flex items-center gap-2 h-14 pl-5 pr-6 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-blue-600 active:scale-95 transition-all group">
<span class="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">add</span>
<span class="font-bold text-base tracking-wide">Capture</span>
</button>
<!-- Expanded options (hidden for visual, conceptually would pop out) -->
</div>
<!-- Bottom Navigation -->
<nav class="flex-none bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pb-6 pt-2 px-2 z-30">
<div class="flex items-center justify-around">
<button class="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-16">
<span class="material-symbols-outlined">dashboard</span>
<span class="text-[10px] font-medium">Dashboard</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-16">
<span class="material-symbols-outlined">account_tree</span>
<span class="text-[10px] font-medium">Tree</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 rounded-lg text-primary bg-primary/10 transition-colors w-16">
<span class="material-symbols-outlined filled">receipt_long</span>
<span class="text-[10px] font-medium">Evidence</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-16">
<span class="material-symbols-outlined">settings</span>
<span class="text-[10px] font-medium">Settings</span>
</button>
</div>
</nav>
</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Evidence & Inputs Ledger"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Evidence & Inputs Ledger","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
