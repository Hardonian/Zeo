1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T4687,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Evidence Planner</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#1c2630",
                        "surface-light": "#ffffff",
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
        body {
            font-family: 'Space Grotesk', sans-serif;
        }
        /* Custom scrollbar for data-heavy feel */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #101922; 
        }
        ::-webkit-scrollbar-thumb {
            background: #2d3b4e; 
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #137fec; 
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen overflow-x-hidden font-display flex flex-col items-center">
<!-- Mobile Container -->
<div class="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen shadow-2xl relative flex flex-col">
<!-- Sticky Header -->
<header class="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pb-2">
<div class="flex items-center justify-between px-4 pt-6 pb-2">
<h1 class="text-xl font-bold tracking-tight">Prioritized Actions</h1>
<div class="flex gap-2">
<button class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
<span class="material-symbols-outlined">search</span>
</button>
<button class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
<span class="material-symbols-outlined">tune</span>
</button>
</div>
</div>
<!-- Summary KPI Card -->
<div class="px-4 pb-2">
<div class="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center justify-between">
<div>
<p class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Total Uncertainty Reduced</p>
<div class="flex items-baseline gap-2 mt-1">
<span class="text-2xl font-bold text-slate-900 dark:text-white">45%</span>
<span class="text-sm font-medium text-emerald-500 flex items-center">
<span class="material-symbols-outlined text-sm mr-0.5">trending_up</span>+12%
                            </span>
</div>
</div>
<div class="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">donut_large</span>
</div>
</div>
</div>
<!-- Filter Chips -->
<div class="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar scroll-smooth">
<button class="flex shrink-0 items-center gap-1.5 rounded-full bg-primary text-white px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset ring-primary/50">
<span>Sort: Value Score</span>
<span class="material-symbols-outlined text-[16px]">arrow_drop_down</span>
</button>
<button class="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-light dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700">
<span>Risk: Low</span>
</button>
<button class="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-light dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700">
<span>Cost: &lt; $$</span>
</button>
<button class="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-light dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700">
<span>Time: &lt; 2w</span>
</button>
</div>
</header>
<!-- Main Content List -->
<main class="flex-1 px-4 py-4 space-y-4 pb-24">
<!-- Card 1 -->
<div class="group bg-surface-light dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-all">
<!-- Card Header -->
<div class="p-4 flex gap-4">
<!-- Value Score Badge -->
<div class="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
<span class="text-xs font-bold text-primary uppercase">Val</span>
<span class="text-lg font-bold text-primary leading-none">9.4</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="text-base font-bold text-slate-900 dark:text-white truncate">Conduct A/B Market Test</h3>
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">expand_more</span>
</button>
</div>
<!-- Metrics Grid -->
<div class="flex items-center gap-3 text-xs mb-3">
<div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[14px] text-amber-500">attach_money</span>
<span class="font-medium text-amber-500">$$</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[14px] text-emerald-500">schedule</span>
<span class="font-medium text-emerald-500">2w</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[14px] text-emerald-500">shield</span>
<span class="font-medium text-emerald-500">Low</span>
</div>
</div>
<!-- Uncertainty Visualizer -->
<div class="space-y-1">
<div class="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
<span>Uncertainty Reduction</span>
<span class="text-primary">-60%</span>
</div>
<div class="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
<div class="h-full bg-slate-400 dark:bg-slate-600 w-[40%]"></div> <!-- Remaining Uncertainty -->
<div class="h-full bg-primary w-[60%]"></div> <!-- Removed Uncertainty -->
</div>
<div class="flex justify-between text-[10px] text-slate-400">
<span>Current</span>
<span>Projected</span>
</div>
</div>
</div>
</div>
<!-- Expanded Content (Justification) - Normally hidden, shown here for demo -->
<div class="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-2">
<div class="pt-3">
<p class="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">lightbulb</span>
                            Justification
                        </p>
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            High uncertainty in user acquisition cost. This test reduces variance by 60% for a relatively low setup cost compared to full launch.
                        </p>
</div>
</div>
</div>
<!-- Card 2 -->
<div class="group bg-surface-light dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-all">
<div class="p-4 flex gap-4">
<div class="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
<span class="text-xs font-bold text-slate-500 uppercase">Val</span>
<span class="text-lg font-bold text-slate-900 dark:text-white leading-none">8.1</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="text-base font-bold text-slate-900 dark:text-white truncate">Competitor Feature Analysis</h3>
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
<div class="flex items-center gap-3 text-xs mb-3">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-emerald-500">attach_money</span>
<span class="font-medium text-emerald-500">$</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-emerald-500">schedule</span>
<span class="font-medium text-emerald-500">3d</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-emerald-500">shield</span>
<span class="font-medium text-emerald-500">V. Low</span>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
<span>Uncertainty Reduction</span>
<span class="text-primary">-25%</span>
</div>
<div class="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
<div class="h-full bg-slate-400 dark:bg-slate-600 w-[75%]"></div>
<div class="h-full bg-primary/80 w-[25%]"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Card 3 -->
<div class="group bg-surface-light dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-all">
<div class="p-4 flex gap-4">
<div class="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
<span class="text-xs font-bold text-slate-500 uppercase">Val</span>
<span class="text-lg font-bold text-slate-900 dark:text-white leading-none">6.5</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="text-base font-bold text-slate-900 dark:text-white truncate">Prototype User Testing (n=5)</h3>
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
<div class="flex items-center gap-3 text-xs mb-3">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-amber-500">attach_money</span>
<span class="font-medium text-amber-500">$$</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-amber-500">schedule</span>
<span class="font-medium text-amber-500">1w</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-emerald-500">shield</span>
<span class="font-medium text-emerald-500">Low</span>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
<span>Uncertainty Reduction</span>
<span class="text-primary">-40%</span>
</div>
<div class="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
<div class="h-full bg-slate-400 dark:bg-slate-600 w-[60%]"></div>
<div class="h-full bg-primary/70 w-[40%]"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Card 4 -->
<div class="group bg-surface-light dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-all opacity-80">
<div class="p-4 flex gap-4">
<div class="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
<span class="text-xs font-bold text-slate-500 uppercase">Val</span>
<span class="text-lg font-bold text-slate-900 dark:text-white leading-none">4.2</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="text-base font-bold text-slate-900 dark:text-white truncate">Expert Interview: Legal</h3>
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
<div class="flex items-center gap-3 text-xs mb-3">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-red-500">attach_money</span>
<span class="font-medium text-red-500">$$$</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-emerald-500">schedule</span>
<span class="font-medium text-emerald-500">1w</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-amber-500">shield</span>
<span class="font-medium text-amber-500">Med</span>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
<span>Uncertainty Reduction</span>
<span class="text-primary">-15%</span>
</div>
<div class="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
<div class="h-full bg-slate-400 dark:bg-slate-600 w-[85%]"></div>
<div class="h-full bg-primary/60 w-[15%]"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Card 5 (Lower priority visual) -->
<div class="group bg-surface-light dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-all opacity-60">
<div class="p-4 flex gap-4">
<div class="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
<span class="text-xs font-bold text-slate-500 uppercase">Val</span>
<span class="text-lg font-bold text-slate-900 dark:text-white leading-none">2.1</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="text-base font-bold text-slate-900 dark:text-white truncate">Survey (n=1000)</h3>
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
<div class="flex items-center gap-3 text-xs mb-3">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-red-500">attach_money</span>
<span class="font-medium text-red-500">$$$$</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-red-500">schedule</span>
<span class="font-medium text-red-500">4w</span>
</div>
<div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-amber-500">shield</span>
<span class="font-medium text-amber-500">Med</span>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
<span>Uncertainty Reduction</span>
<span class="text-primary">-10%</span>
</div>
<div class="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
<div class="h-full bg-slate-400 dark:bg-slate-600 w-[90%]"></div>
<div class="h-full bg-primary/40 w-[10%]"></div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Floating Action Button -->
<div class="absolute bottom-6 right-6 z-50">
<button class="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark">
<span class="material-symbols-outlined text-[28px]">add</span>
</button>
</div>
<!-- Bottom Navigation (Optional context for phone form factor) -->
<nav class="fixed bottom-0 w-full max-w-md border-t border-slate-200 dark:border-slate-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md pb-safe">
<div class="grid grid-cols-4 h-16">
<a class="flex flex-col items-center justify-center text-slate-400 hover:text-primary" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="text-[10px] mt-1 font-medium">Overview</span>
</a>
<a class="flex flex-col items-center justify-center text-primary" href="#">
<span class="material-symbols-outlined fill-current">assignment_turned_in</span>
<span class="text-[10px] mt-1 font-medium">Actions</span>
</a>
<a class="flex flex-col items-center justify-center text-slate-400 hover:text-primary" href="#">
<span class="material-symbols-outlined">science</span>
<span class="text-[10px] mt-1 font-medium">Hypotheses</span>
</a>
<a class="flex flex-col items-center justify-center text-slate-400 hover:text-primary" href="#">
<span class="material-symbols-outlined">analytics</span>
<span class="text-[10px] mt-1 font-medium">Results</span>
</a>
</div>
</nav>
</div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Evidence Planner"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Evidence Planner","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
