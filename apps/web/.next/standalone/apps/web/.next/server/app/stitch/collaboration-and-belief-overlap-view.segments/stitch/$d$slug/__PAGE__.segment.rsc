1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T3884,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Collaboration &amp; Belief Overlap</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1A2230",
                        "user-a": "#2DD4BF",  /* Teal-400 */
                        "user-b": "#C084FC",  /* Purple-400 */
                        "conflict": "#FB7185", /* Rose-400 */
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for horizontal scrolling */
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
<!-- Top App Bar -->
<header class="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
<div class="flex items-center justify-between px-4 py-3">
<button class="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="text-lg font-bold tracking-tight">Belief Overlap</h1>
<button class="flex items-center justify-center p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
<span class="material-symbols-outlined">filter_list</span>
</button>
</div>
<!-- Filter Chips -->
<div class="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
<button class="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-background-dark text-xs font-semibold">
                All Assumptions
            </button>
<button class="flex-shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium whitespace-nowrap">
                High Conflict (2)
            </button>
<button class="flex-shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                Consensus
            </button>
<button class="flex-shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                Drafts
            </button>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 p-4 flex flex-col gap-4">
<!-- Info/Legend Card -->
<div class="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
<span class="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
<div class="flex-1">
<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Compare <span class="text-user-a font-bold">User A</span> vs <span class="text-user-b font-bold">User B</span>.
                    Overlapping ranges indicate consensus. Gaps indicate <span class="text-conflict font-bold">conflict</span>.
                </p>
</div>
</div>
<!-- Assumption Card 1: Consensus -->
<div class="bg-white dark:bg-surface-dark rounded-lg p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
<div class="flex justify-between items-start">
<div class="flex-1">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 block">Growth • Marketing</span>
<h3 class="text-base font-semibold leading-tight pr-2">Market penetration in APAC will reach 15% by EOQ</h3>
</div>
<span class="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-500/20">
                    CONSENSUS
                </span>
</div>
<!-- Visualization Track -->
<div class="relative h-14 mt-1 select-none">
<!-- Grid Lines -->
<div class="absolute inset-0 flex justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
<span>0%</span>
<span>25%</span>
<span>50%</span>
<span>75%</span>
<span>100%</span>
</div>
<div class="absolute top-5 bottom-0 left-0 right-0 border-t border-slate-100 dark:border-slate-700/50 flex justify-between pointer-events-none">
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
</div>
<!-- Consensus Highlight (12% to 20%) -->
<div class="absolute top-6 h-6 bg-primary/20 border-x border-primary/40 rounded-sm z-0" style="left: 12%; width: 8%;"></div>
<!-- User A Bar (10% to 20%) -->
<div class="absolute top-5 h-2 bg-user-a rounded-full z-10 shadow-sm" style="left: 10%; width: 10%;"></div>
<!-- User B Bar (12% to 25%) -->
<div class="absolute top-9 h-2 bg-user-b rounded-full z-10 shadow-sm" style="left: 12%; width: 13%;"></div>
</div>
<!-- Stats Footer -->
<div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-user-a"></div>
<span class="text-slate-500 dark:text-slate-400 font-mono">10-20%</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-user-b"></div>
<span class="text-slate-500 dark:text-slate-400 font-mono">12-25%</span>
</div>
<div class="flex items-center gap-1 text-slate-400">
<span class="material-symbols-outlined text-[16px]">group</span>
<span>High Overlap</span>
</div>
</div>
</div>
<!-- Assumption Card 2: Conflict -->
<div class="bg-white dark:bg-surface-dark rounded-lg p-5 shadow-sm border border-conflict/30 relative overflow-hidden flex flex-col gap-4">
<!-- Conflict Indicator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-conflict"></div>
<div class="flex justify-between items-start pl-2">
<div class="flex-1">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 block">Infrastructure • Cost</span>
<h3 class="text-base font-semibold leading-tight pr-2">Server costs will decrease after migration</h3>
</div>
<button class="inline-flex items-center px-2 py-1 rounded bg-conflict text-white text-[10px] font-bold shadow-sm animate-pulse">
                    CONFLICT
                </button>
</div>
<!-- Visualization Track -->
<div class="relative h-16 mt-1 pl-2 select-none group cursor-pointer">
<!-- Tap Target for Conflict Zone -->
<div class="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
<span class="bg-background-dark/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Tap to resolve</span>
</div>
<!-- Grid Lines -->
<div class="absolute inset-0 flex justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
<span>0%</span>
<span>25%</span>
<span>50%</span>
<span>75%</span>
<span>100%</span>
</div>
<div class="absolute top-5 bottom-0 left-0 right-0 border-t border-slate-100 dark:border-slate-700/50 flex justify-between pointer-events-none">
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
</div>
<!-- Conflict Zone Highlight (30% to 60%) -->
<div class="absolute top-5 bottom-1 bg-conflict/10 border-x border-conflict/30 rounded-sm z-0 flex items-center justify-center" style="left: 30%; width: 30%;">
<span class="material-symbols-outlined text-conflict text-lg opacity-50">close</span>
</div>
<!-- User B Bar (10% to 30%) -->
<div class="absolute top-9 h-2 bg-user-b rounded-full z-10 shadow-sm" style="left: 10%; width: 20%;">
<div class="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-user-b bg-surface-dark px-1 rounded border border-slate-700/50">B</div>
</div>
<!-- User A Bar (60% to 80%) -->
<div class="absolute top-5 h-2 bg-user-a rounded-full z-10 shadow-sm" style="left: 60%; width: 20%;">
<div class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-user-a bg-surface-dark px-1 rounded border border-slate-700/50">A</div>
</div>
</div>
<!-- Action Area -->
<div class="flex items-center gap-2 pl-2">
<button class="flex-1 bg-background-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold py-2 px-3 rounded border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-sm">forum</span>
                    Start Debate
                </button>
<button class="flex-1 bg-background-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold py-2 px-3 rounded border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-sm">fact_check</span>
                    Request Evidence
                </button>
</div>
</div>
<!-- Assumption Card 3: Tight Consensus -->
<div class="bg-white dark:bg-surface-dark rounded-lg p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
<div class="flex justify-between items-start">
<div class="flex-1">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 block">Product • Competition</span>
<h3 class="text-base font-semibold leading-tight pr-2">Competitor X will launch a similar feature</h3>
</div>
<span class="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-500/20">
                    CONSENSUS
                </span>
</div>
<!-- Visualization Track -->
<div class="relative h-14 mt-1 select-none">
<!-- Grid Lines -->
<div class="absolute inset-0 flex justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
<span>0%</span>
<span>25%</span>
<span>50%</span>
<span>75%</span>
<span>100%</span>
</div>
<div class="absolute top-5 bottom-0 left-0 right-0 border-t border-slate-100 dark:border-slate-700/50 flex justify-between pointer-events-none">
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
<div class="h-full w-px bg-slate-100 dark:bg-slate-700/50"></div>
</div>
<!-- Consensus Highlight (45% to 55%) -->
<div class="absolute top-6 h-6 bg-primary/20 border-x border-primary/40 rounded-sm z-0" style="left: 45%; width: 10%;"></div>
<!-- User A Bar (40% to 60%) -->
<div class="absolute top-5 h-2 bg-user-a rounded-full z-10 shadow-sm opacity-80" style="left: 40%; width: 20%;"></div>
<!-- User B Bar (45% to 55%) -->
<div class="absolute top-9 h-2 bg-user-b rounded-full z-10 shadow-sm opacity-80" style="left: 45%; width: 10%;"></div>
</div>
<!-- Stats Footer -->
<div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-user-a"></div>
<span class="text-slate-500 dark:text-slate-400 font-mono">40-60%</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-user-b"></div>
<span class="text-slate-500 dark:text-slate-400 font-mono">45-55%</span>
</div>
<div class="flex items-center gap-1 text-slate-400">
<span class="material-symbols-outlined text-[16px]">verified</span>
<span>Strong Align</span>
</div>
</div>
</div>
<!-- Add New Button -->
<button class="mt-2 w-full py-3.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
<span class="material-symbols-outlined">add</span>
            Add New Belief Assumption
        </button>
<!-- Bottom Spacer for Tab Bar (Simulated) -->
<div class="h-20"></div>
</main>
<!-- Floating Action Button (Alternative) -->
<div class="fixed bottom-6 right-6 z-40">
<button class="w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center">
<span class="material-symbols-outlined text-2xl">chat_bubble</span>
</button>
</div>
</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Collaboration & Belief Overlap View"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Collaboration & Belief Overlap View","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
