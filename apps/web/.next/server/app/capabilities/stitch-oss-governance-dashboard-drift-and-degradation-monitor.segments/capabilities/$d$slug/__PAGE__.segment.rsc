1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T35d1,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Drift &amp; Degradation Monitor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
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
        /* Custom scrollbar for horizontal scrolling areas */
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
<body class="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden antialiased">
<!-- Sticky Header -->
<header class="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-[#e5e7eb] dark:border-[#283039]">
<div class="flex flex-col px-4 pt-12 pb-3 gap-2"> <!-- Added top padding for iOS status bar area -->
<div class="flex items-center justify-between h-8">
<button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#e5e7eb] dark:bg-[#283039]">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="text-xs font-semibold text-[#637588] dark:text-[#9dabb9]">Production-US-East</span>
</div>
<button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-[24px]">settings</span>
</button>
</div>
<div class="flex items-end justify-between mt-1">
<h1 class="text-2xl font-bold tracking-tight">Drift Monitor</h1>
<span class="text-xs font-medium text-[#637588] dark:text-[#9dabb9] mb-1">Updated 2m ago</span>
</div>
</div>
<!-- Filter Tabs -->
<div class="flex px-4 pb-3 gap-2 overflow-x-auto hide-scrollbar">
<button class="flex h-8 items-center gap-2 rounded-full bg-[#111418] dark:bg-white px-4 py-1 transition-all">
<span class="material-symbols-outlined text-[18px] text-white dark:text-[#111418]">grid_view</span>
<span class="text-sm font-semibold text-white dark:text-[#111418]">All Alerts</span>
</button>
<button class="flex h-8 items-center gap-2 rounded-full bg-[#e5e7eb] dark:bg-[#283039] px-4 py-1 border border-transparent hover:border-[#fa6238]/30 transition-all">
<span class="material-symbols-outlined text-[18px] text-[#fa6238]">error</span>
<span class="text-sm font-medium text-[#111418] dark:text-white">Critical (2)</span>
</button>
<button class="flex h-8 items-center gap-2 rounded-full bg-[#e5e7eb] dark:bg-[#283039] px-4 py-1 border border-transparent hover:border-[#fbbf24]/30 transition-all">
<span class="material-symbols-outlined text-[18px] text-[#fbbf24]">warning</span>
<span class="text-sm font-medium text-[#111418] dark:text-white">Warning (2)</span>
</button>
<button class="flex h-8 items-center gap-2 rounded-full bg-[#e5e7eb] dark:bg-[#283039] px-4 py-1 border border-transparent hover:border-emerald-500/30 transition-all">
<span class="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
<span class="text-sm font-medium text-[#111418] dark:text-white">Stable</span>
</button>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 flex flex-col gap-6 p-4">
<!-- System Status Banner -->
<div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#fa6238] to-[#9a3412] p-5 shadow-lg">
<div class="relative z-10 flex flex-col gap-3">
<div class="flex items-center gap-2 text-white/90">
<span class="material-symbols-outlined text-[20px]">health_metrics</span>
<span class="text-sm font-semibold uppercase tracking-wider">Overall Health</span>
</div>
<div>
<h2 class="text-3xl font-bold text-white leading-tight">System Degraded</h2>
<p class="text-white/80 text-sm mt-1">Multiple critical drift anomalies detected in recent slices.</p>
</div>
<div class="mt-2 flex gap-3">
<button class="flex-1 bg-white text-[#9a3412] px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform">
                        View Root Cause
                    </button>
<button class="flex items-center justify-center w-10 bg-white/20 text-white rounded-lg backdrop-blur-sm active:bg-white/30 transition-colors">
<span class="material-symbols-outlined">notifications_off</span>
</button>
</div>
</div>
<!-- Abstract Pattern for texture -->
<div class="absolute right-[-20px] top-[-20px] opacity-20" data-alt="Abstract circle pattern">
<svg fill="none" height="200" viewbox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
<circle cx="100" cy="100" r="90" stroke="white" stroke-width="20"></circle>
<circle cx="100" cy="100" r="60" stroke="white" stroke-width="20"></circle>
<circle cx="100" cy="100" r="30" stroke="white" stroke-width="20"></circle>
</svg>
</div>
</div>
<!-- Section: Critical Alerts -->
<section>
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-lg font-bold tracking-tight">Critical Anomalies</h3>
<span class="text-xs font-medium text-[#fa6238] bg-[#fa6238]/10 px-2 py-0.5 rounded">High Priority</span>
</div>
<div class="grid grid-cols-2 gap-3">
<!-- Card 1: Slice Degradation -->
<div class="col-span-1 flex flex-col gap-3 rounded-xl bg-white dark:bg-[#283039] p-4 shadow-sm border border-[#e5e7eb] dark:border-[#3e4854] active:border-[#fa6238] transition-colors group cursor-pointer" data-action="investigate-slice">
<div class="flex items-start justify-between">
<div class="p-1.5 rounded-lg bg-[#fa6238]/10 text-[#fa6238]">
<span class="material-symbols-outlined text-[20px] block">layers</span>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
</div>
<div>
<p class="text-xs font-medium text-[#637588] dark:text-[#9dabb9] mb-1">Slice Degradation</p>
<div class="flex items-baseline gap-1">
<span class="text-xl font-bold font-mono">62%</span>
<span class="text-xs font-bold text-[#fa6238]">-26%</span>
</div>
</div>
<!-- Sparkline SVG -->
<div class="h-8 w-full mt-1">
<svg class="w-full h-full text-[#fa6238]" preserveaspectratio="none" viewbox="0 0 100 20">
<path d="M0 10 Q 25 5, 50 15 T 100 18" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"></path>
</svg>
</div>
</div>
<!-- Card 2: Stability Loss -->
<div class="col-span-1 flex flex-col gap-3 rounded-xl bg-white dark:bg-[#283039] p-4 shadow-sm border border-[#e5e7eb] dark:border-[#3e4854] active:border-[#fa6238] transition-colors group cursor-pointer" data-action="investigate-stability">
<div class="flex items-start justify-between">
<div class="p-1.5 rounded-lg bg-[#fa6238]/10 text-[#fa6238]">
<span class="material-symbols-outlined text-[20px] block">trending_down</span>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
</div>
<div>
<p class="text-xs font-medium text-[#637588] dark:text-[#9dabb9] mb-1">Stability Loss</p>
<div class="flex items-baseline gap-1">
<span class="text-xl font-bold font-mono">84.6%</span>
<span class="text-xs font-bold text-[#fa6238]">-15%</span>
</div>
</div>
<!-- Sparkline SVG -->
<div class="h-8 w-full mt-1">
<svg class="w-full h-full text-[#fa6238]" preserveaspectratio="none" viewbox="0 0 100 20">
<path d="M0 2 Q 25 5, 50 10 T 100 18" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"></path>
</svg>
</div>
</div>
</div>
</section>
<!-- Section: Warnings -->
<section>
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-lg font-bold tracking-tight">Active Warnings</h3>
<span class="text-xs font-medium text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded">Action Needed</span>
</div>
<div class="flex flex-col gap-3">
<!-- Card 3: Single Signal Dominance -->
<div class="flex items-center gap-4 rounded-xl bg-white dark:bg-[#283039] p-4 shadow-sm border border-[#e5e7eb] dark:border-[#3e4854] cursor-pointer active:bg-gray-50 dark:active:bg-[#323b45]" data-action="investigate-signal">
<div class="p-2.5 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] shrink-0">
<span class="material-symbols-outlined text-[24px] block">wifi_tethering</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-center mb-0.5">
<h4 class="font-semibold text-sm truncate">Single Signal Dominance</h4>
<span class="text-xs font-medium text-[#fbbf24]">Warning</span>
</div>
<div class="flex items-center gap-2">
<span class="text-xs text-[#637588] dark:text-[#9dabb9]">Signal Source:</span>
<span class="text-xs font-mono bg-[#e5e7eb] dark:bg-[#111418] px-1.5 py-0.5 rounded text-[#111418] dark:text-white">User_Age_Group</span>
</div>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px]">chevron_right</span>
</div>
<!-- Card 4: Narrowing without Evidence -->
<div class="flex items-center gap-4 rounded-xl bg-white dark:bg-[#283039] p-4 shadow-sm border border-[#e5e7eb] dark:border-[#3e4854] cursor-pointer active:bg-gray-50 dark:active:bg-[#323b45]" data-action="investigate-narrowing">
<div class="p-2.5 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] shrink-0">
<span class="material-symbols-outlined text-[24px] block">filter_list_off</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-center mb-0.5">
<h4 class="font-semibold text-sm truncate">Narrowing w/o Evidence</h4>
<span class="text-xs font-medium text-[#fbbf24]">Warning</span>
</div>
<div class="flex items-center gap-2">
<span class="text-xs text-[#637588] dark:text-[#9dabb9]">Confidence:</span>
<span class="text-xs font-mono text-[#fbbf24]">Low (0.32)</span>
</div>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px]">chevron_right</span>
</div>
</div>
</section>
<!-- Section: Stable Metrics (Compact) -->
<section>
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-lg font-bold tracking-tight">Stable Metrics</h3>
<span class="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Normal</span>
</div>
<div class="grid grid-cols-2 gap-3">
<!-- Card 5 -->
<div class="flex flex-col p-3 rounded-xl bg-white dark:bg-[#1e252b] border border-[#e5e7eb] dark:border-[#2a343d]">
<div class="flex justify-between items-start mb-2">
<span class="text-xs font-medium text-[#637588] dark:text-[#9dabb9]">Data Volume</span>
<span class="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
</div>
<p class="text-lg font-bold font-mono">2.4 TB</p>
</div>
<!-- Card 6 -->
<div class="flex flex-col p-3 rounded-xl bg-white dark:bg-[#1e252b] border border-[#e5e7eb] dark:border-[#2a343d]">
<div class="flex justify-between items-start mb-2">
<span class="text-xs font-medium text-[#637588] dark:text-[#9dabb9]">Inference Rate</span>
<span class="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
</div>
<p class="text-lg font-bold font-mono">45ms</p>
</div>
</div>
</section>
<!-- Spacer for bottom nav -->
<div class="h-16"></div>
</main>
<!-- Bottom Navigation (iOS Style) -->
<nav class="fixed bottom-0 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-[#e5e7eb] dark:border-[#283039] pb-safe z-50">
<div class="flex justify-around items-center h-16 pb-2">
<button class="flex flex-col items-center gap-1 w-16 text-primary">
<span class="material-symbols-outlined fill-1">dashboard</span>
<span class="text-[10px] font-medium">Monitor</span>
</button>
<button class="flex flex-col items-center gap-1 w-16 text-[#637588] dark:text-[#9dabb9] hover:text-[#111418] dark:hover:text-white transition-colors">
<span class="material-symbols-outlined">table_rows</span>
<span class="text-[10px] font-medium">Logs</span>
</button>
<button class="flex flex-col items-center gap-1 w-16 text-[#637588] dark:text-[#9dabb9] hover:text-[#111418] dark:hover:text-white transition-colors">
<span class="material-symbols-outlined">rule</span>
<span class="text-[10px] font-medium">Policy</span>
</button>
<button class="flex flex-col items-center gap-1 w-16 text-[#637588] dark:text-[#9dabb9] hover:text-[#111418] dark:hover:text-white transition-colors">
<span class="material-symbols-outlined">person</span>
<span class="text-[10px] font-medium">Profile</span>
</button>
</div>
</nav>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Drift & Degradation Monitor"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Drift & Degradation Monitor","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
