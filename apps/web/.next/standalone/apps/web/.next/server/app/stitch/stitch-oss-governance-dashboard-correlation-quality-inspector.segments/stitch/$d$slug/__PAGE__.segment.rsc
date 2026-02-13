1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3a26,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Correlation Quality Inspector</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#137fec",
              "background-light": "#f6f7f8",
              "background-dark": "#111418", // Matching the dark background from the example
              "card-dark": "#1c2127", // Slightly lighter for cards
              "text-secondary": "#9dabb9",
            },
            fontFamily: {
              "display": ["Space Grotesk", "sans-serif"],
              "body": ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
              "DEFAULT": "0.25rem", 
              "lg": "0.5rem", 
              "xl": "0.75rem", 
              "2xl": "1rem",
              "full": "9999px"
            },
          },
        },
      }
    </script>
<style>
        body {
            font-family: 'Space Grotesk', sans-serif;
        }
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #111418;
        }
        ::-webkit-scrollbar-thumb {
            background: #3b4754;
            border-radius: 4px;
        }
        /* Hide scrollbar for clean mobile look */
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display selection:bg-primary/30">
<!-- Top App Bar -->
<header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
<div class="flex items-center justify-between p-4 h-16">
<button class="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="text-lg font-bold truncate mx-2">Correlation Inspector</h1>
<button class="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined">ios_share</span>
</button>
</div>
</header>
<!-- Main Scrollable Content -->
<main class="flex-1 flex flex-col p-4 gap-6 max-w-md mx-auto w-full pb-24">
<!-- Verdict Card -->
<section class="flex flex-col gap-4">
<div class="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
<!-- Status Badge -->
<div class="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
<span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    High Confidence
                </div>
<div class="flex flex-col gap-2 relative z-10 pr-20">
<p class="text-text-secondary text-xs font-medium uppercase tracking-wide">Primary Relationship</p>
<h2 class="text-xl font-bold leading-tight">Daily Active Users <span class="text-text-secondary font-normal">vs.</span> Server Load</h2>
</div>
<div class="mt-6 flex items-end gap-3 relative z-10">
<div class="flex flex-col">
<span class="text-4xl font-bold tracking-tight text-primary">0.89</span>
<span class="text-text-secondary text-xs font-medium">Correlation (r)</span>
</div>
<div class="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 mb-1"></div>
<div class="flex flex-col mb-1">
<span class="text-sm font-bold text-white">Strong</span>
<span class="text-text-secondary text-xs">Signal Strength</span>
</div>
</div>
<!-- Decorative background blur -->
<div class="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>
</div>
</section>
<!-- Visualization Section -->
<section class="flex flex-col gap-3">
<div class="flex items-center justify-between px-1">
<h3 class="text-base font-bold">Regression Analysis</h3>
<button class="text-primary text-sm font-medium hover:text-primary/80 transition-colors">Expand</button>
</div>
<div class="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
<div class="relative w-full aspect-[4/3]">
<!-- Chart Background Grid -->
<svg class="absolute inset-0 w-full h-full" height="100%" width="100%">
<defs>
<pattern height="20%" id="grid" patternunits="userSpaceOnUse" width="20%">
<path class="text-gray-200 dark:text-gray-800" d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" stroke-width="0.5"></path>
</pattern>
</defs>
<rect fill="url(#grid)" height="100%" width="100%"></rect>
</svg>
<!-- Scatter Plot Content -->
<div class="absolute inset-4 flex flex-col">
<!-- Y-axis Label -->
<div class="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-[10px] text-text-secondary font-medium">
<span>100%</span>
<span>50%</span>
<span>0%</span>
</div>
<!-- Chart Area -->
<div class="relative flex-1 ml-6 mb-4">
<!-- Confidence Interval Area (Simulated) -->
<svg class="w-full h-full overflow-visible" preserveaspectratio="none" viewbox="0 0 100 100">
<path class="text-primary/10" d="M0,80 Q50,40 100,10 L100,30 Q50,60 0,90 Z" fill="currentColor"></path>
<!-- Regression Line -->
<path class="text-primary drop-shadow-[0_0_4px_rgba(19,127,236,0.5)]" d="M0,85 Q50,45 100,15" fill="none" stroke="currentColor" stroke-width="2"></path>
<!-- Scatter Points -->
<circle class="fill-white dark:fill-white" cx="10" cy="80" r="1.5"></circle>
<circle class="fill-white dark:fill-white opacity-80" cx="15" cy="75" r="1.5"></circle>
<circle class="fill-white dark:fill-white opacity-60" cx="22" cy="70" r="1.5"></circle>
<circle class="fill-white dark:fill-white opacity-90" cx="28" cy="65" r="1.5"></circle>
<circle class="fill-white dark:fill-white" cx="35" cy="55" r="1.5"></circle>
<circle class="fill-emerald-400 opacity-90" cx="42" cy="58" r="1.5"></circle> <!-- Outlier/Focus point -->
<circle class="fill-white dark:fill-white opacity-70" cx="50" cy="45" r="1.5"></circle>
<circle class="fill-white dark:fill-white" cx="58" cy="40" r="1.5"></circle>
<circle class="fill-white dark:fill-white opacity-80" cx="65" cy="35" r="1.5"></circle>
<circle class="fill-white dark:fill-white" cx="72" cy="30" r="1.5"></circle>
<circle class="fill-white dark:fill-white opacity-90" cx="85" cy="20" r="1.5"></circle>
<circle class="fill-white dark:fill-white" cx="95" cy="15" r="1.5"></circle>
</svg>
</div>
<!-- X-axis Label -->
<div class="absolute left-6 right-0 bottom-0 flex justify-between text-[10px] text-text-secondary font-medium px-1">
<span>0k</span>
<span>50k</span>
<span>100k</span>
</div>
</div>
</div>
</div>
</section>
<!-- Test Results Grid -->
<section class="grid grid-cols-2 gap-3">
<!-- FDR Status -->
<div class="bg-white dark:bg-card-dark rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-24">
<div class="flex items-start justify-between">
<span class="text-text-secondary text-xs font-medium">FDR Status</span>
<span class="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
</div>
<div>
<p class="text-lg font-bold text-white leading-tight">Safe</p>
<p class="text-xs text-emerald-500 font-medium">&lt; 5% Risk</p>
</div>
</div>
<!-- Negative Control -->
<div class="bg-white dark:bg-card-dark rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-24 relative overflow-hidden">
<div class="flex items-start justify-between relative z-10">
<span class="text-text-secondary text-xs font-medium">Neg. Control</span>
<span class="material-symbols-outlined text-rose-500 text-[18px]">warning</span>
</div>
<div class="relative z-10">
<p class="text-lg font-bold text-white leading-tight">Failed</p>
<p class="text-xs text-rose-500 font-medium">P-value &gt; 0.05</p>
</div>
<div class="absolute inset-0 bg-rose-500/5"></div>
</div>
<!-- Sample Size -->
<div class="bg-white dark:bg-card-dark rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-24">
<div class="flex items-start justify-between">
<span class="text-text-secondary text-xs font-medium">Sample Size</span>
<span class="material-symbols-outlined text-text-secondary text-[18px]">bar_chart</span>
</div>
<div>
<p class="text-lg font-bold text-white leading-tight">N = 452</p>
<p class="text-xs text-text-secondary font-medium">Days</p>
</div>
</div>
<!-- Outlier Impact -->
<div class="bg-white dark:bg-card-dark rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-24">
<div class="flex items-start justify-between">
<span class="text-text-secondary text-xs font-medium">Outlier Impact</span>
<span class="material-symbols-outlined text-amber-500 text-[18px]">priority_high</span>
</div>
<div>
<p class="text-lg font-bold text-white leading-tight">Low</p>
<p class="text-xs text-amber-500 font-medium">2 removed</p>
</div>
</div>
</section>
<!-- Why This Might Be Wrong Section -->
<section class="flex flex-col gap-3">
<h3 class="text-base font-bold px-1 pt-2">Why This Might Be Wrong</h3>
<div class="flex flex-col gap-3">
<!-- Warning 1: Leakage -->
<details class="group bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 open:border-rose-500/50 dark:open:border-rose-500/50 transition-all duration-300">
<summary class="flex cursor-pointer items-center justify-between p-4 list-none">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center size-8 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
<span class="material-symbols-outlined text-[18px]">leak_add</span>
</div>
<div>
<p class="text-sm font-bold text-slate-900 dark:text-white">Potential Leakage Trap</p>
<p class="text-xs text-text-secondary">High Risk Detected</p>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="px-4 pb-4 pt-0">
<div class="pl-[44px]">
<p class="text-sm text-text-secondary leading-relaxed">
                                Warning: Both metrics derive from the same SQL source table <code class="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded text-xs">events_log</code>. This suggests a possible data lineage overlap rather than a causal link.
                            </p>
<button class="mt-3 text-xs font-bold text-primary hover:underline">View Source Lineage</button>
</div>
</div>
</details>
<!-- Warning 2: Confounders -->
<details class="group bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 open:border-amber-500/50 dark:open:border-amber-500/50 transition-all duration-300">
<summary class="flex cursor-pointer items-center justify-between p-4 list-none">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center size-8 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
<span class="material-symbols-outlined text-[18px]">timeline</span>
</div>
<div>
<p class="text-sm font-bold text-slate-900 dark:text-white">Temporal Autocorrelation</p>
<p class="text-xs text-text-secondary">Medium Risk</p>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="px-4 pb-4 pt-0">
<div class="pl-[44px]">
<p class="text-sm text-text-secondary leading-relaxed">
                                Both time series show strong weekly seasonality. The correlation might be driven by the "day of week" factor rather than a direct relationship.
                            </p>
</div>
</div>
</details>
<!-- Check 3: Seasonality (Clean) -->
<details class="group bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
<summary class="flex cursor-pointer items-center justify-between p-4 list-none">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center size-8 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
</div>
<div>
<p class="text-sm font-bold text-slate-900 dark:text-white">Seasonality Check</p>
<p class="text-xs text-text-secondary">Passed</p>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="px-4 pb-4 pt-0">
<div class="pl-[44px]">
<p class="text-sm text-text-secondary leading-relaxed">
                                No significant annual seasonality detected that would skew results.
                            </p>
</div>
</div>
</details>
</div>
</section>
</main>
<!-- Sticky Footer Actions -->
<footer class="fixed bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 safe-area-pb z-50">
<div class="max-w-md mx-auto flex gap-3">
<button class="flex-1 h-12 rounded-lg bg-gray-200 dark:bg-[#283039] text-slate-900 dark:text-white font-bold text-sm hover:bg-gray-300 dark:hover:bg-[#323c47] transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[20px]">delete</span>
                Discard
            </button>
<button class="flex-[2] h-12 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[20px]">verified</span>
                Validate Signal
            </button>
</div>
</footer>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Correlation Quality Inspector","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Governance & Compliance"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Correlation Quality Inspector","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
