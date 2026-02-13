1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T33b7,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Option Value Inspector</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1258e2",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#1a2130",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
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
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex justify-center text-slate-900 dark:text-white selection:bg-primary/30">
<!-- Mobile Container -->
<div class="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
<!-- Top App Bar -->
<header class="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
<div class="flex items-center justify-between p-4 pb-2">
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h2 class="text-base font-bold leading-tight tracking-tight">Option Value Inspector</h2>
<span class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Project Alpha Launch</span>
</div>
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
<span class="material-symbols-outlined">tune</span>
</button>
</div>
<!-- Filters/Tabs -->
<div class="px-4 pb-3 pt-1">
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
<button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white px-4 shadow-lg shadow-primary/20 transition-all hover:brightness-110">
<span class="text-xs font-semibold">All Actions</span>
</button>
<button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-200 dark:bg-surface-dark border border-transparent dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-4 text-slate-600 dark:text-slate-300 transition-all">
<span class="text-xs font-medium">High Reversibility</span>
</button>
<button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-200 dark:bg-surface-dark border border-transparent dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-4 text-slate-600 dark:text-slate-300 transition-all">
<span class="text-xs font-medium">Max Info Gain</span>
</button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
<!-- Metric Summary Card -->
<div class="grid grid-cols-2 gap-3">
<div class="col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
<div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
<div class="relative z-10 flex justify-between items-end">
<div>
<p class="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Avg Lock-in Risk</p>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">42<span class="text-lg text-slate-400 font-medium">/100</span></span>
<span class="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
<span class="material-symbols-outlined text-[14px] mr-0.5">trending_down</span>
                                    12%
                                </span>
</div>
<p class="text-xs text-slate-400 mt-2">Currently optimizing for optionality.</p>
</div>
<div class="h-10 w-24">
<!-- Simple Sparkline SVG representation -->
<svg class="w-full h-full stroke-primary fill-none stroke-2 overflow-visible" viewbox="0 0 100 40">
<path d="M0,35 C10,35 20,20 30,25 C40,30 50,10 60,15 C70,20 80,5 100,2"></path>
<defs>
<lineargradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style="stop-color:#1258e2;stop-opacity:0.2"></stop>
<stop offset="100%" style="stop-color:#1258e2;stop-opacity:0"></stop>
</lineargradient>
</defs>
<path class="stroke-none fill-[url(#gradient)]" d="M0,35 C10,35 20,20 30,25 C40,30 50,10 60,15 C70,20 80,5 100,2 V40 H0 Z"></path>
</svg>
</div>
</div>
</div>
</div>
<!-- List Header -->
<div class="flex items-center justify-between mt-2">
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ranked Actions</h3>
<button class="text-primary text-xs font-semibold hover:underline">View All (5)</button>
</div>
<!-- Action Cards -->
<div class="flex flex-col gap-3">
<!-- Card 1: High Value -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer">
<div class="flex justify-between items-start mb-3">
<div class="flex items-center gap-3">
<div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
<span class="material-symbols-outlined">rocket_launch</span>
</div>
<div>
<h4 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Pilot Program Launch</h4>
<span class="text-xs text-slate-500">Duration: 3 Weeks</span>
</div>
</div>
<div class="text-right">
<div class="flex flex-col items-end">
<span class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Lock-in</span>
<span class="text-xl font-bold text-slate-900 dark:text-white">12</span>
</div>
</div>
</div>
<!-- Metrics Grid -->
<div class="grid grid-cols-2 gap-4 mt-4 bg-slate-50 dark:bg-[#151b26] rounded-lg p-3">
<!-- Reversibility -->
<div class="flex flex-col gap-1">
<span class="text-[10px] font-medium text-slate-500 uppercase">Reversibility</span>
<div class="flex items-center gap-1.5">
<span class="size-2 rounded-full bg-emerald-500"></span>
<span class="text-sm font-semibold text-slate-700 dark:text-slate-200">High</span>
</div>
</div>
<!-- Info Gain -->
<div class="flex flex-col gap-1">
<span class="text-[10px] font-medium text-slate-500 uppercase">Info Gain</span>
<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
<div class="bg-primary h-1.5 rounded-full" style="width: 85%"></div>
</div>
<span class="text-[10px] text-right text-slate-400 mt-0.5">85% Evidence</span>
</div>
</div>
<!-- Sparkline Footer -->
<div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
<span class="text-[10px] text-slate-400 font-medium">Regret Surface Analysis</span>
<div class="h-6 w-20">
<svg class="w-full h-full stroke-slate-400 dark:stroke-slate-500 fill-none stroke-[1.5px]" viewbox="0 0 80 24">
<path d="M0,20 Q20,20 40,15 T80,5"></path>
</svg>
</div>
</div>
</div>
<!-- Card 2: Medium Value -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer">
<div class="flex justify-between items-start mb-3">
<div class="flex items-center gap-3">
<div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
<span class="material-symbols-outlined">query_stats</span>
</div>
<div>
<h4 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Wait for Q3 Report</h4>
<span class="text-xs text-slate-500">Passive Action</span>
</div>
</div>
<div class="text-right">
<div class="flex flex-col items-end">
<span class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Lock-in</span>
<span class="text-xl font-bold text-emerald-500">5</span>
</div>
</div>
</div>
<div class="grid grid-cols-2 gap-4 mt-4 bg-slate-50 dark:bg-[#151b26] rounded-lg p-3">
<div class="flex flex-col gap-1">
<span class="text-[10px] font-medium text-slate-500 uppercase">Reversibility</span>
<div class="flex items-center gap-1.5">
<span class="size-2 rounded-full bg-emerald-500"></span>
<span class="text-sm font-semibold text-slate-700 dark:text-slate-200">High</span>
</div>
</div>
<div class="flex flex-col gap-1">
<span class="text-[10px] font-medium text-slate-500 uppercase">Info Gain</span>
<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
<div class="bg-primary/70 h-1.5 rounded-full" style="width: 40%"></div>
</div>
<span class="text-[10px] text-right text-slate-400 mt-0.5">40% Evidence</span>
</div>
</div>
<div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
<span class="text-[10px] text-slate-400 font-medium">Regret Surface Analysis</span>
<div class="h-6 w-20">
<svg class="w-full h-full stroke-slate-400 dark:stroke-slate-500 fill-none stroke-[1.5px]" viewbox="0 0 80 24">
<path d="M0,22 L20,22 L40,22 L80,22" stroke-dasharray="2 2"></path>
</svg>
</div>
</div>
</div>
<!-- Card 3: High Risk -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer opacity-90 hover:opacity-100">
<div class="absolute -left-[1px] top-4 bottom-4 w-1 bg-amber-500 rounded-r-sm"></div>
<div class="flex justify-between items-start mb-3">
<div class="flex items-center gap-3 pl-2">
<div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500">
<span class="material-symbols-outlined">handshake</span>
</div>
<div>
<h4 class="text-base font-bold text-slate-900 dark:text-white leading-tight">5-Year Vendor Contract</h4>
<span class="text-xs text-slate-500">Binding Agreement</span>
</div>
</div>
<div class="text-right">
<div class="flex flex-col items-end">
<span class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Lock-in</span>
<span class="text-xl font-bold text-amber-500">92</span>
</div>
</div>
</div>
<div class="grid grid-cols-2 gap-4 mt-4 bg-slate-50 dark:bg-[#151b26] rounded-lg p-3">
<div class="flex flex-col gap-1">
<span class="text-[10px] font-medium text-slate-500 uppercase">Reversibility</span>
<div class="flex items-center gap-1.5">
<span class="size-2 rounded-full bg-amber-500"></span>
<span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Low</span>
</div>
</div>
<div class="flex flex-col gap-1">
<span class="text-[10px] font-medium text-slate-500 uppercase">Info Gain</span>
<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
<div class="bg-primary/40 h-1.5 rounded-full" style="width: 10%"></div>
</div>
<span class="text-[10px] text-right text-slate-400 mt-0.5">10% Evidence</span>
</div>
</div>
<div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
<span class="text-[10px] text-slate-400 font-medium">Regret Surface Analysis</span>
<div class="h-6 w-20">
<svg class="w-full h-full stroke-amber-500/70 fill-none stroke-[1.5px]" viewbox="0 0 80 24">
<path d="M0,20 C20,15 40,10 60,5 L80,2"></path>
</svg>
</div>
</div>
</div>
</div>
</main>
<!-- Bottom Action Bar (Simulated Fab/Action) -->
<div class="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
<button class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined">add_chart</span>
<span>Analyze New Option</span>
</button>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Option Value Inspector","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Option Value Inspector","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
