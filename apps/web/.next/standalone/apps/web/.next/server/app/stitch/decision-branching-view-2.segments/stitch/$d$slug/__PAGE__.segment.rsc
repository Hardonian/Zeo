1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T3a32,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Zeo - Decision Branching View</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
                        "surface-dark": "#192233",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
                    screens: {
                        'xs': '375px',
                    }
                },
            },
        }
    </script>
<style>.dot-pattern {
            background-image: radial-gradient(#324467 1px, transparent 1px);
            background-size: 24px 24px;
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }.zoom-container {
            transform-origin: top center;min-height: 100vh;
        }
    </style>
<style>
        body {height: 100vh;
            height: 100dvh;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white flex flex-col overflow-hidden selection:bg-primary/30">
<header class="flex-none z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
<div class="flex items-center justify-between p-3 sm:p-4">
<button class="flex size-9 sm:size-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-gray-300">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<div class="flex flex-col items-center max-w-[50%]">
<h1 class="text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400 truncate w-full text-center">Decision Branching</h1>
<h2 class="text-sm sm:text-base font-bold leading-tight truncate w-full text-center">Project Alpha Launch</h2>
</div>
<div class="flex gap-1.5 sm:gap-2">
<button class="flex size-9 sm:size-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-gray-300">
<span class="material-symbols-outlined">filter_list</span>
</button>
<button class="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors">
<span class="material-symbols-outlined">add</span>
</button>
</div>
</div>
<div class="flex gap-2 sm:gap-3 px-3 sm:px-4 pb-3 overflow-x-auto no-scrollbar mask-linear-fade">
<div class="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded px-2.5 bg-white dark:bg-[#232f48] border border-gray-200 dark:border-transparent">
<span class="material-symbols-outlined text-[16px] text-emerald-500">trending_up</span>
<p class="text-xs font-mono font-medium">Prob: &gt;65%</p>
</div>
<div class="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded px-2.5 bg-white dark:bg-[#232f48] border border-gray-200 dark:border-transparent">
<span class="material-symbols-outlined text-[16px] text-amber-500">warning</span>
<p class="text-xs font-medium">Risk: Med</p>
</div>
<div class="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded px-2.5 bg-white dark:bg-[#232f48] border border-gray-200 dark:border-transparent">
<span class="material-symbols-outlined text-[16px] text-blue-400">schedule</span>
<p class="text-xs font-medium">Q4 2024</p>
</div>
</div>
</header>
<main class="relative flex-1 overflow-auto no-scrollbar bg-background-light dark:bg-background-dark cursor-grab active:cursor-grabbing w-full">
<div class="sticky top-0 left-0 w-full h-full dot-pattern opacity-30 pointer-events-none z-0"></div>
<div class="relative min-h-[800px] min-w-[150%] xs:min-w-[120%] sm:min-w-full flex flex-col items-center pt-8 sm:pt-12 pb-40 zoom-container mx-auto">
<svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg">
<defs>
<marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
<polygon fill="#3b82f6" points="0 0, 10 3.5, 0 7"></polygon>
</marker>
</defs>
<path class="dark:stroke-slate-600" d="M50% 120 C 50% 170, 20% 170, 20% 230" fill="none" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke"></path>
<path d="M50% 120 L 50% 224" fill="none" marker-end="url(#arrowhead)" stroke="#3b82f6" stroke-width="3" vector-effect="non-scaling-stroke"></path>
<path class="dark:stroke-slate-600" d="M50% 120 C 50% 170, 80% 170, 80% 230" fill="none" stroke="#94a3b8" stroke-dasharray="6" stroke-width="2" vector-effect="non-scaling-stroke"></path>
<path class="dark:stroke-slate-600" d="M50% 380 L 50% 480" fill="none" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke"></path>
</svg>
<div class="relative z-10 mb-20 w-full flex justify-center">
<div class="bg-white dark:bg-[#192233] rounded-xl shadow-[0_0_20px_rgba(19,91,236,0.3)] border-2 border-primary p-4 w-60 sm:w-64 text-center transform transition hover:scale-105 duration-200">
<div class="mb-2 inline-flex items-center justify-center rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Root Decision</div>
<h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">Launch Product in Q4</h3>
<p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Status: Active evaluation</p>
</div>
<div class="absolute -bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
<div class="size-3 sm:size-4 rotate-45 bg-amber-500 border-2 border-background-light dark:border-background-dark shadow-sm"></div>
<span class="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-background-light/90 dark:bg-background-dark/90 px-1.5 rounded backdrop-blur-sm">Oct 15</span>
</div>
</div>
<div class="grid grid-cols-3 gap-4 sm:gap-12 w-[95%] max-w-[800px] mb-20 z-10">
<div class="flex justify-center pt-8">
<div class="relative group w-full max-w-[200px]">
<div class="bg-white dark:bg-[#192233] hover:border-primary/50 transition-colors cursor-pointer rounded-lg border border-gray-200 dark:border-slate-700 p-3 sm:p-4 shadow-lg h-full">
<div class="flex justify-between items-start mb-2">
<span class="material-symbols-outlined text-rose-500 text-base sm:text-lg">trending_down</span>
<span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded">20-30%</span>
</div>
<h4 class="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Competitor Price Cut</h4>
<p class="text-[10px] text-slate-500 leading-tight hidden sm:block">If they react aggressively to our entry.</p>
<p class="text-[9px] text-slate-500 leading-tight sm:hidden">Aggressive reaction.</p>
</div>
</div>
</div>
<div class="flex justify-center -mt-2">
<div class="relative group w-full max-w-[220px]">
<div class="bg-white dark:bg-[#192233] ring-2 ring-primary/50 ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark cursor-pointer rounded-lg border border-transparent p-3 sm:p-4 shadow-xl shadow-primary/10 h-full">
<div class="flex justify-between items-start mb-2">
<span class="material-symbols-outlined text-emerald-500 text-base sm:text-lg">verified</span>
<span class="bg-primary text-white text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded">50-60%</span>
</div>
<h4 class="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Steady Adoption</h4>
<p class="text-[10px] text-slate-400 leading-tight mb-2">Market absorbs new supply without major price shifts.</p>
<div class="flex gap-1 justify-center sm:justify-start">
<span class="size-1 sm:size-1.5 rounded-full bg-slate-500"></span>
<span class="size-1 sm:size-1.5 rounded-full bg-slate-500"></span>
<span class="size-1 sm:size-1.5 rounded-full bg-slate-500"></span>
</div>
</div>
<div class="absolute -bottom-16 left-1/2 -translate-x-1/2 h-16 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
</div>
</div>
<div class="flex justify-center pt-8">
<div class="relative group opacity-70 hover:opacity-100 transition-opacity w-full max-w-[200px]">
<div class="bg-white dark:bg-[#192233] cursor-pointer rounded-lg border border-gray-200 dark:border-slate-700 border-dashed p-3 sm:p-4 shadow-sm h-full">
<div class="flex justify-between items-start mb-2">
<span class="material-symbols-outlined text-slate-400 text-base sm:text-lg">question_mark</span>
<span class="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded">&lt; 15%</span>
</div>
<h4 class="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 text-slate-600 dark:text-slate-300">Supply Chain Fail</h4>
<p class="text-[10px] text-slate-500 leading-tight hidden sm:block">Risk of raw material shortage in Q4.</p>
<p class="text-[9px] text-slate-500 leading-tight sm:hidden">Material shortage.</p>
</div>
</div>
</div>
</div>
<div class="flex flex-col items-center z-10 mt-4">
<div class="bg-white dark:bg-[#192233] cursor-pointer rounded-lg border border-gray-200 dark:border-slate-700 p-2 sm:p-3 w-40 sm:w-44 shadow-lg flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform">
<div class="bg-emerald-500/10 p-1.5 rounded text-emerald-500 shrink-0">
<span class="material-symbols-outlined text-base sm:text-lg">monetization_on</span>
</div>
<div>
<h4 class="font-semibold text-[10px] sm:text-xs mb-0.5">Revenue Target</h4>
<span class="text-[10px] font-mono text-emerald-500">+$2.4M ARR</span>
</div>
</div>
</div>
</div>
</main>
<div class="absolute bottom-[calc(80px+env(safe-area-inset-bottom))] w-full z-30 pointer-events-none px-2 sm:px-4">
<div class="pointer-events-auto bg-white/95 dark:bg-[#192233]/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-0 overflow-hidden transform transition-transform translate-y-0 max-w-lg mx-auto mb-2">
<div class="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
<div class="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
</div>
<div class="px-4 pb-4 sm:px-5 sm:pb-5">
<div class="flex justify-between items-start mb-3 sm:mb-4">
<div class="mr-2">
<div class="flex flex-wrap items-center gap-2 mb-1">
<h3 class="text-base sm:text-lg font-bold">Steady Adoption</h3>
<span class="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">Plausible</span>
</div>
<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-tight">High confidence outcome based on Q3 data.</p>
</div>
<button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="flex border-b border-gray-200 dark:border-slate-700 mb-3 sm:mb-4 overflow-x-auto no-scrollbar">
<button class="pb-2 px-3 sm:px-4 text-xs sm:text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">Facts &amp; Data</button>
<button class="pb-2 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 whitespace-nowrap">Beliefs</button>
<button class="pb-2 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 whitespace-nowrap">Assumptions</button>
</div>
<div class="space-y-3">
<div class="flex items-start gap-3 p-3 bg-background-light dark:bg-background-dark rounded-lg">
<span class="material-symbols-outlined text-primary text-lg sm:text-xl mt-0.5">analytics</span>
<div class="flex-1">
<p class="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 mb-1">Evidence</p>
<p class="text-xs sm:text-sm font-medium leading-snug">Q3 Customer Survey shows 78% intent to purchase upgrade.</p>
<a class="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium p-1 hover:bg-primary/5 rounded" href="#">
                                View Report <span class="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
</div>
</div>
</div>
</div>
</div>
</div>
<nav class="flex-none bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
<div class="flex justify-between items-center h-[60px] sm:h-[64px] px-6 max-w-md mx-auto">
<button class="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-16 group p-1">
<span class="material-symbols-outlined text-[24px] group-hover:-translate-y-0.5 transition-transform">dashboard</span>
<span class="text-[10px] font-medium">Dash</span>
</button>
<button class="flex flex-col items-center gap-1 text-primary w-16 relative p-1">
<div class="absolute -top-0.5 w-12 h-0.5 bg-primary rounded-b-full shadow-[0_0_8px_rgba(19,91,236,0.8)]"></div>
<span class="material-symbols-outlined text-[24px] font-variation-FILL">account_tree</span>
<span class="text-[10px] font-medium">Tree</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-16 group p-1">
<span class="material-symbols-outlined text-[24px] group-hover:-translate-y-0.5 transition-transform">folder_open</span>
<span class="text-[10px] font-medium">Evidence</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-16 group p-1">
<span class="material-symbols-outlined text-[24px] group-hover:-translate-y-0.5 transition-transform">settings</span>
<span class="text-[10px] font-medium">Config</span>
</button>
</div>
</nav>

</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Decision Branching View 2"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Decision Branching View 2","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
