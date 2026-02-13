1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3630,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Decision Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
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
                        "surface-dark": "#1A2233",
                        "border-dark": "#2A3650",
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
        /* Custom scrollbar for clean look */
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
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col antialiased selection:bg-primary/30">
<!-- Mobile Container -->
<div class="max-w-md mx-auto w-full flex-grow flex flex-col relative pb-20">
<!-- Header -->
<header class="flex items-center justify-between p-5 pt-12 pb-4 bg-background-light/80 dark:bg-background-dark/95 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-border-dark">
<div class="flex items-center gap-2.5">
<div class="size-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
<span class="material-symbols-outlined text-[20px]">hub</span>
</div>
<h1 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Zeo</h1>
</div>
<button class="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white pl-3 pr-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-primary/20 group">
<span class="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-90">add</span>
                New Decision
            </button>
</header>
<!-- Main Content -->
<main class="flex flex-col gap-6 p-5">
<!-- Metrics Ticker -->
<section class="grid grid-cols-2 gap-3">
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark p-3 rounded-xl flex flex-col gap-1 shadow-sm">
<div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
<span class="material-symbols-outlined text-[16px] text-primary">model_training</span>
                        Active Models
                    </div>
<div class="flex items-baseline gap-1">
<span class="text-2xl font-bold text-gray-900 dark:text-white font-mono">3</span>
<span class="text-green-500 text-xs font-mono font-medium">+1</span>
</div>
</div>
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark p-3 rounded-xl flex flex-col gap-1 shadow-sm">
<div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
<span class="material-symbols-outlined text-[16px] text-emerald-500">health_metrics</span>
                        Sys Health
                    </div>
<div class="flex items-baseline gap-1">
<span class="text-2xl font-bold text-gray-900 dark:text-white font-mono">98%</span>
<span class="text-xs text-gray-500 font-medium">Optimal</span>
</div>
</div>
</section>
<!-- Active Scenarios -->
<section class="flex flex-col gap-4">
<div class="flex items-center justify-between">
<h2 class="text-lg font-bold text-gray-900 dark:text-white">Active Scenarios</h2>
<button class="text-xs font-semibold text-primary hover:text-primary/80">View All</button>
</div>
<!-- Card 1: High Uncertainty -->
<article class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
<div class="flex justify-between items-start mb-3">
<div class="flex flex-col">
<h3 class="font-semibold text-gray-900 dark:text-white leading-tight mb-1">Q4 Market Expansion</h3>
<span class="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: #EXP-2024-Q4</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
<span class="material-symbols-outlined text-[12px]">warning</span>
                            Uncertainty High
                        </span>
</div>
<!-- Visualization Placeholder -->
<div class="w-full h-16 bg-gray-50 dark:bg-black/20 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center border border-gray-100 dark:border-white/5">
<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#135bec 1px, transparent 1px); background-size: 8px 8px;"></div>
<!-- Abstract representation of branches -->
<div class="flex items-center gap-1 h-8">
<div class="w-1 h-full bg-primary/20 rounded-full"></div>
<div class="w-1 h-3/4 bg-primary/40 rounded-full"></div>
<div class="w-1 h-full bg-primary/60 rounded-full"></div>
<div class="w-1 h-1/2 bg-primary/30 rounded-full"></div>
<div class="w-1 h-full bg-primary rounded-full"></div>
<div class="w-1 h-2/3 bg-primary/50 rounded-full"></div>
</div>
</div>
<div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/5 pt-3">
<div>
<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">Branches</p>
<p class="text-sm font-mono font-bold text-gray-900 dark:text-white">12 Outcomes</p>
</div>
<div>
<div class="flex justify-between items-center mb-1">
<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Robustness</p>
<span class="text-[10px] font-mono font-bold text-primary">45%</span>
</div>
<div class="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 45%"></div>
</div>
</div>
</div>
</article>
<!-- Card 2: Analyzing -->
<article class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
<!-- Loading shimmer effect for analyzing state -->
<div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_2s_infinite]"></div>
<div class="flex justify-between items-start mb-3">
<div class="flex flex-col">
<h3 class="font-semibold text-gray-900 dark:text-white leading-tight mb-1">Supply Chain Optimization</h3>
<span class="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: #SC-OPT-V2</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 animate-pulse">
<span class="material-symbols-outlined text-[12px] animate-spin">sync</span>
                            Analyzing
                        </span>
</div>
<div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/5 pt-3 mt-4">
<div>
<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">Branches</p>
<p class="text-sm font-mono font-bold text-gray-900 dark:text-white">84 Detected</p>
</div>
<div>
<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">Robustness</p>
<p class="text-sm font-mono text-gray-400 italic">Computing...</p>
</div>
</div>
</article>
<!-- Card 3: Stable -->
<article class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
<div class="flex justify-between items-start mb-3">
<div class="flex flex-col">
<h3 class="font-semibold text-gray-900 dark:text-white leading-tight mb-1">Hiring Plan 2025</h3>
<span class="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: #HR-25-A</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
<span class="material-symbols-outlined text-[12px]">check_circle</span>
                            Stable
                        </span>
</div>
<div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/5 pt-3 mt-2">
<div>
<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">Branches</p>
<p class="text-sm font-mono font-bold text-gray-900 dark:text-white">4 Outcomes</p>
</div>
<div>
<div class="flex justify-between items-center mb-1">
<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Robustness</p>
<span class="text-[10px] font-mono font-bold text-emerald-500">92%</span>
</div>
<div class="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
<div class="h-full bg-emerald-500 rounded-full" style="width: 92%"></div>
</div>
</div>
</div>
</article>
</section>
<!-- Evidence Feed -->
<section class="flex flex-col gap-3 pt-2">
<h2 class="text-lg font-bold text-gray-900 dark:text-white px-1">Recent Evidence</h2>
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl divide-y divide-gray-100 dark:divide-white/5 shadow-sm">
<!-- Evidence Item 1 -->
<div class="p-3 flex items-start gap-3">
<div class="size-8 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">finance</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">Financial Data (Q3)</h4>
<span class="text-[10px] text-gray-400 whitespace-nowrap ml-2">2m ago</span>
</div>
<p class="text-xs text-gray-500 mt-0.5 truncate">Revenue +15% YoY, Burn rate stable.</p>
</div>
</div>
<!-- Evidence Item 2 -->
<div class="p-3 flex items-start gap-3">
<div class="size-8 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">rss_feed</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">Competitor Analysis</h4>
<span class="text-[10px] text-gray-400 whitespace-nowrap ml-2">1h ago</span>
</div>
<p class="text-xs text-gray-500 mt-0.5 truncate">News Feed API: New product launch detected.</p>
</div>
</div>
<!-- Evidence Item 3 -->
<div class="p-3 flex items-start gap-3 opacity-60">
<div class="size-8 rounded bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 border border-dashed border-gray-300 dark:border-gray-600">
<span class="material-symbols-outlined text-[18px]">poll</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">User Surveys (NPS)</h4>
<span class="text-[10px] text-amber-500 font-medium whitespace-nowrap ml-2">Pending</span>
</div>
<p class="text-xs text-gray-500 mt-0.5 truncate">Waiting for batch upload...</p>
</div>
</div>
</div>
</section>
</main>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 w-full max-w-md bg-background-light dark:bg-[#0d121c] border-t border-gray-200 dark:border-border-dark pb-6 pt-2 px-2 z-40 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
<div class="flex justify-around items-center">
<button class="flex flex-col items-center gap-1 p-2 text-primary">
<span class="material-symbols-outlined text-[24px]">dashboard</span>
<span class="text-[10px] font-medium">Dashboard</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-symbols-outlined text-[24px]">account_tree</span>
<span class="text-[10px] font-medium">Tree View</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-symbols-outlined text-[24px]">folder_data</span>
<span class="text-[10px] font-medium">Evidence</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-symbols-outlined text-[24px]">settings</span>
<span class="text-[10px] font-medium">Settings</span>
</button>
</div>
</nav>
</div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Zeo Decision Dashboard"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Decision Intelligence"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Zeo Decision Dashboard","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
