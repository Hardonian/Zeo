1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T39da,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Assumption Inspector - Zeo</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0df26c",
                        "background-light": "#f5f8f7",
                        "background-dark": "#102217",
                        "surface-dark": "#1A2C22",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* CSS Variable-driven colors for technical feel */
        :root {
            --belief-track-color: #316848;
            --confidence-level: #0df26c;
            --range-handle: #ffffff;
        }
        
        /* Custom range slider styling */
        .range-slider-track {
            background: linear-gradient(to right, 
                var(--belief-track-color) 0%, 
                var(--belief-track-color) 25%, 
                var(--confidence-level) 25%, 
                var(--confidence-level) 65%, 
                var(--belief-track-color) 65%, 
                var(--belief-track-color) 100%
            );
        }

        /* Hide scrollbar for clean UI */
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
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-hidden h-screen flex flex-col relative">
<!-- Top Header -->
<header class="flex-none px-4 pt-12 pb-2 bg-surface-light dark:bg-background-dark border-b border-gray-200 dark:border-white/10 z-10">
<div class="flex items-center justify-between mb-4">
<h1 class="text-2xl font-bold tracking-tight">Assumption Inspector</h1>
<button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<!-- Filter Tabs -->
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-dark/10 dark:bg-surface-dark border border-transparent dark:border-primary/20 text-xs font-medium text-slate-700 dark:text-primary whitespace-nowrap active:scale-95 transition-transform">
<span class="material-symbols-outlined text-[16px]">grid_view</span>
                All Scopes
            </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-gray-400 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined text-[16px]">language</span>
                Global
            </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-gray-400 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined text-[16px]">location_on</span>
                Local
            </button>
</div>
</header>
<!-- Main Content Area: List of Assumptions -->
<main class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
<!-- Assumption Card 1: High Reliability -->
<article class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 relative group">
<div class="flex justify-between items-start mb-3">
<div class="flex flex-col gap-1">
<h3 class="text-base font-semibold leading-tight pr-8">Market Growth Q3</h3>
<div class="flex flex-wrap gap-2 mt-1">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-primary/20 text-green-700 dark:text-primary tracking-wide uppercase">
                            High Reliability
                        </span>
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-mono">
                            src:internal_rep
                        </span>
</div>
</div>
<!-- Scope Toggle -->
<div class="flex flex-col items-end gap-1">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
<span class="text-[10px] uppercase font-bold text-primary tracking-wider">Global</span>
</div>
</div>
<!-- Interactive Sliders / Data -->
<div class="space-y-4 mt-4">
<!-- Belief Range -->
<div class="space-y-2">
<div class="flex justify-between items-end">
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Belief Range</span>
<span class="font-mono text-xs text-primary font-bold tracking-tight">42% — 68%</span>
</div>
<div class="relative h-6 flex items-center select-none touch-none">
<!-- Track Background -->
<div class="absolute w-full h-1.5 bg-gray-200 dark:bg-[#316848] rounded-full overflow-hidden">
<!-- Active Range -->
<div class="absolute h-full bg-primary opacity-30 dark:opacity-100" style="left: 42%; right: 32%;"></div>
</div>
<!-- Thumb Left -->
<div class="absolute h-4 w-4 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" style="left: 42%; transform: translateX(-50%);"></div>
<!-- Thumb Right -->
<div class="absolute h-4 w-4 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10" style="left: 68%; transform: translateX(-50%);"></div>
</div>
</div>
<!-- Confidence Meter -->
<div class="space-y-2 pt-1">
<div class="flex justify-between items-end">
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Confidence Score</span>
<span class="font-mono text-xs text-gray-900 dark:text-white font-bold">0.85</span>
</div>
<div class="h-1.5 w-full bg-gray-200 dark:bg-[#316848] rounded-full overflow-hidden">
<div class="h-full bg-gradient-to-r from-primary/60 to-primary w-[85%] rounded-full"></div>
</div>
</div>
</div>
</article>
<!-- Assumption Card 2: Low Reliability -->
<article class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 relative group">
<div class="flex justify-between items-start mb-3">
<div class="flex flex-col gap-1">
<h3 class="text-base font-semibold leading-tight pr-8">Competitor Entry</h3>
<div class="flex flex-wrap gap-2 mt-1">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 tracking-wide uppercase">
                            Low Reliability
                        </span>
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-mono">
                            src:speculation
                        </span>
</div>
</div>
<!-- Scope Toggle -->
<div class="flex flex-col items-end gap-1">
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
<span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Local</span>
</div>
</div>
<div class="space-y-4 mt-4">
<!-- Belief Range -->
<div class="space-y-2">
<div class="flex justify-between items-end">
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Belief Range</span>
<span class="font-mono text-xs text-primary font-bold tracking-tight">10% — 25%</span>
</div>
<div class="relative h-6 flex items-center select-none touch-none">
<div class="absolute w-full h-1.5 bg-gray-200 dark:bg-[#316848] rounded-full overflow-hidden">
<div class="absolute h-full bg-amber-500/80 dark:bg-amber-500" style="left: 10%; right: 75%;"></div>
</div>
<div class="absolute h-4 w-4 bg-white border-2 border-amber-500 rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" style="left: 10%; transform: translateX(-50%);"></div>
<div class="absolute h-4 w-4 bg-white border-2 border-amber-500 rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10" style="left: 25%; transform: translateX(-50%);"></div>
</div>
</div>
<!-- Confidence Meter -->
<div class="space-y-2 pt-1">
<div class="flex justify-between items-end">
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Confidence Score</span>
<span class="font-mono text-xs text-gray-900 dark:text-white font-bold">0.30</span>
</div>
<div class="h-1.5 w-full bg-gray-200 dark:bg-[#316848] rounded-full overflow-hidden">
<div class="h-full bg-gradient-to-r from-amber-500/60 to-amber-500 w-[30%] rounded-full"></div>
</div>
</div>
</div>
</article>
<!-- Assumption Card 3: Supply Chain -->
<article class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 relative group opacity-60 hover:opacity-100 transition-opacity">
<div class="flex justify-between items-start mb-3">
<div class="flex flex-col gap-1">
<h3 class="text-base font-semibold leading-tight pr-8">Supply Chain Efficiency</h3>
<div class="flex flex-wrap gap-2 mt-1">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 tracking-wide uppercase">
                            Medium Reliability
                        </span>
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-mono">
                            src:logistic_api
                        </span>
</div>
</div>
<!-- Scope Toggle -->
<div class="flex flex-col items-end gap-1">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
<span class="text-[10px] uppercase font-bold text-primary tracking-wider">Global</span>
</div>
</div>
<div class="space-y-4 mt-4">
<div class="space-y-2">
<div class="flex justify-between items-end">
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Belief Range</span>
<span class="font-mono text-xs text-primary font-bold tracking-tight">55% — 60%</span>
</div>
<div class="relative h-6 flex items-center select-none touch-none">
<div class="absolute w-full h-1.5 bg-gray-200 dark:bg-[#316848] rounded-full overflow-hidden">
<div class="absolute h-full bg-blue-500/80 dark:bg-blue-500" style="left: 55%; right: 40%;"></div>
</div>
<div class="absolute h-4 w-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab active:cursor-grabbing" style="left: 55%; transform: translateX(-50%);"></div>
<div class="absolute h-4 w-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab active:cursor-grabbing z-10" style="left: 60%; transform: translateX(-50%);"></div>
</div>
</div>
<div class="space-y-2 pt-1">
<div class="flex justify-between items-end">
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Confidence Score</span>
<span class="font-mono text-xs text-gray-900 dark:text-white font-bold">0.62</span>
</div>
<div class="h-1.5 w-full bg-gray-200 dark:bg-[#316848] rounded-full overflow-hidden">
<div class="h-full bg-gradient-to-r from-blue-500/60 to-blue-500 w-[62%] rounded-full"></div>
</div>
</div>
</div>
</article>
<!-- Spacer for FAB -->
<div class="h-16"></div>
</main>
<!-- Bottom Floating Action Bar -->
<div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light via-background-light/95 to-transparent dark:from-background-dark dark:via-background-dark/95 pb-8">
<button class="w-full flex items-center justify-center gap-3 bg-primary text-background-dark h-12 rounded-lg font-bold text-base shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all group">
<span class="material-symbols-outlined group-hover:animate-pulse">save_alt</span>
<span>COMMIT CHANGES</span>
<span class="bg-background-dark/20 text-background-dark px-2 py-0.5 rounded text-xs font-mono">2</span>
</button>
</div>
</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Assumption Inspector Panel"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Assumption Inspector Panel","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
