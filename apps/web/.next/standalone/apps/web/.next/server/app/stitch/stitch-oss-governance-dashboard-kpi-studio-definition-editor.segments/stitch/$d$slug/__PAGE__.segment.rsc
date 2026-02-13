1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T370b,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>KPI Studio Definition Editor</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0d7ff2",
                        "background-light": "#f5f7f8",
                        "background-dark": "#101922", // Matching the provided base dark
                        "surface-dark": "#1b2127", // Slightly lighter for cards
                        "border-dark": "#3b4754",
                        "text-secondary": "#9cabba",
                        "warning-bg": "rgba(234, 179, 8, 0.15)",
                        "warning-text": "#fbbf24",
                        "warning-border": "rgba(234, 179, 8, 0.3)",
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
        /* Custom scrollbar for better aesthetics on desktop preview, though native on mobile */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #101922; 
        }
        ::-webkit-scrollbar-thumb {
            background: #3b4754; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #4b5866; 
        }
        
        /* Hide number input spinners */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased">
<!-- Main Container -->
<div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
<!-- TopAppBar (Sticky) -->
<div class="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 border-b border-gray-200 dark:border-border-dark justify-between">
<div class="flex w-16 items-center justify-start">
<button class="text-primary text-base font-medium leading-normal tracking-[0.015em] shrink-0 hover:opacity-80 transition-opacity">Cancel</button>
</div>
<h2 class="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">New KPI</h2>
<div class="flex w-16 items-center justify-end">
<button class="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 hover:opacity-80 transition-opacity">Save</button>
</div>
</div>
<!-- Scrollable Content -->
<div class="flex-1 flex flex-col gap-6 p-4 pb-12">
<!-- Section: Identity -->
<section>
<h3 class="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-3 px-1">Identity</h3>
<div class="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark shadow-sm">
<div class="flex flex-col px-4 py-3 border-b border-gray-100 dark:border-border-dark/50">
<label class="text-gray-500 dark:text-text-secondary text-xs font-medium uppercase mb-1">KPI Name</label>
<input class="w-full bg-transparent border-none p-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 text-base font-medium" placeholder="e.g. Monthly Recurring Revenue" type="text"/>
</div>
<div class="flex flex-col px-4 py-3">
<label class="text-gray-500 dark:text-text-secondary text-xs font-medium uppercase mb-1">Description</label>
<textarea class="w-full bg-transparent border-none p-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 text-sm resize-none leading-relaxed" placeholder="Define the business logic and intent..." rows="3"></textarea>
</div>
</div>
</section>
<!-- Section: Measurement Logic -->
<section>
<h3 class="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-3 px-1">Measurement Logic</h3>
<div class="flex flex-col gap-4">
<!-- Scale Selector -->
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-border-dark shadow-sm">
<p class="text-gray-500 dark:text-text-secondary text-xs font-medium uppercase mb-3">Measurement Scale</p>
<div class="grid grid-cols-4 gap-2">
<button class="group relative flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-[#111418] border border-transparent hover:border-primary/50 focus:border-primary focus:bg-primary/10 transition-all">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500 mb-1 group-focus:text-primary text-[20px]">category</span>
<span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-focus:text-primary">Nominal</span>
</button>
<button class="group relative flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-[#111418] border border-transparent hover:border-primary/50 focus:border-primary focus:bg-primary/10 transition-all">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500 mb-1 group-focus:text-primary text-[20px]">sort</span>
<span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-focus:text-primary">Ordinal</span>
</button>
<button class="group relative flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-[#111418] border border-transparent hover:border-primary/50 focus:border-primary focus:bg-primary/10 transition-all">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500 mb-1 group-focus:text-primary text-[20px]">linear_scale</span>
<span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-focus:text-primary">Interval</span>
</button>
<button class="group relative flex flex-col items-center justify-center p-2 rounded-lg bg-primary/20 border border-primary transition-all">
<span class="material-symbols-outlined text-primary mb-1 text-[20px]">percent</span>
<span class="text-[10px] font-bold text-primary">Ratio</span>
</button>
</div>
</div>
<!-- Details Card -->
<div class="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark shadow-sm">
<!-- Units -->
<div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-border-dark/50">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500">straighten</span>
<span class="text-gray-900 dark:text-white text-sm font-medium">Unit</span>
</div>
<div class="flex items-center gap-2">
<span class="text-gray-500 dark:text-text-secondary text-sm">Percentage (%)</span>
<span class="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
</div>
</div>
<!-- Cadence -->
<div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-border-dark/50">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500">update</span>
<span class="text-gray-900 dark:text-white text-sm font-medium">Cadence</span>
</div>
<div class="flex items-center gap-2">
<select class="bg-transparent border-none text-right text-primary font-medium text-sm focus:ring-0 p-0 pr-1 cursor-pointer">
<option>Daily</option>
<option>Weekly</option>
<option selected="">Monthly</option>
<option>Quarterly</option>
</select>
</div>
</div>
<!-- Time Horizon -->
<div class="flex flex-col px-4 py-3.5">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500">date_range</span>
<span class="text-gray-900 dark:text-white text-sm font-medium">Time Horizon</span>
</div>
<span class="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded">Last 12 Months</span>
</div>
<!-- Fake Range Slider Visual -->
<div class="relative h-8 w-full flex items-center">
<div class="absolute w-full h-1 bg-gray-200 dark:bg-border-dark rounded-full"></div>
<div class="absolute left-[10%] right-[30%] h-1 bg-primary rounded-full"></div>
<div class="absolute left-[10%] h-4 w-4 bg-white rounded-full border-2 border-primary shadow cursor-pointer -ml-2"></div>
<div class="absolute right-[30%] h-4 w-4 bg-white rounded-full border-2 border-primary shadow cursor-pointer -mr-2"></div>
<div class="absolute top-5 left-[10%] text-[10px] text-gray-500 -ml-2">T-12</div>
<div class="absolute top-5 right-[30%] text-[10px] text-gray-500 -mr-2">T-0</div>
</div>
</div>
</div>
</div>
</section>
<!-- Goodhart Warning -->
<section>
<div class="relative overflow-hidden rounded-xl border border-warning-border bg-yellow-50 dark:bg-warning-bg p-4 flex gap-3 items-start">
<div class="absolute top-0 right-0 p-2 opacity-10">
<span class="material-symbols-outlined text-6xl text-warning-text">warning</span>
</div>
<span class="material-symbols-outlined text-warning-text shrink-0 mt-0.5">warning</span>
<div class="flex flex-col relative z-10">
<h4 class="text-yellow-800 dark:text-warning-text text-sm font-bold mb-1">Goodhart's Law Warning</h4>
<p class="text-yellow-700 dark:text-yellow-200/80 text-xs leading-relaxed">
                            "When a measure becomes a target, it ceases to be a good measure."
                        </p>
<p class="text-yellow-700 dark:text-yellow-200/60 text-xs mt-2 italic">
                            Potential Risk: Agents may artificially suppress cancellation requests to lower Churn Rate.
                        </p>
</div>
</div>
</section>
<!-- Section: Technical Specs -->
<section>
<h3 class="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-3 px-1">Operations &amp; Provenance</h3>
<div class="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark shadow-sm">
<!-- Allowed Operations -->
<div class="p-4 border-b border-gray-100 dark:border-border-dark/50">
<p class="text-gray-500 dark:text-text-secondary text-xs font-medium uppercase mb-3">Allowed Aggregations</p>
<div class="flex flex-wrap gap-2">
<label class="cursor-pointer select-none">
<input checked="" class="peer sr-only" type="checkbox"/>
<div class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#111418] text-gray-600 dark:text-gray-400 border border-transparent peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                                    SUM
                                </div>
</label>
<label class="cursor-pointer select-none">
<input checked="" class="peer sr-only" type="checkbox"/>
<div class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#111418] text-gray-600 dark:text-gray-400 border border-transparent peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                                    AVG
                                </div>
</label>
<label class="cursor-pointer select-none">
<input class="peer sr-only" type="checkbox"/>
<div class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#111418] text-gray-600 dark:text-gray-400 border border-transparent peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                                    MIN
                                </div>
</label>
<label class="cursor-pointer select-none">
<input class="peer sr-only" type="checkbox"/>
<div class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#111418] text-gray-600 dark:text-gray-400 border border-transparent peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                                    MAX
                                </div>
</label>
<label class="cursor-pointer select-none">
<input class="peer sr-only" type="checkbox"/>
<div class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#111418] text-gray-600 dark:text-gray-400 border border-transparent peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                                    COUNT DISTINCT
                                </div>
</label>
</div>
</div>
<!-- Provenance -->
<div class="p-4">
<p class="text-gray-500 dark:text-text-secondary text-xs font-medium uppercase mb-2">Data Source Provenance</p>
<div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#111418] rounded-lg border border-gray-200 dark:border-border-dark group cursor-pointer hover:border-primary/50 transition-colors">
<div class="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">table_view</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-gray-900 dark:text-white text-sm font-medium truncate">dw_prod.subscriptions_fct</p>
<p class="text-gray-500 text-xs truncate">Updated: 2h ago • Snowflake</p>
</div>
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">edit</span>
</div>
</div>
</div>
</section>
<!-- Bottom Spacer for safe area -->
<div class="h-8"></div>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Kpi Studio Definition Editor","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Governance & Compliance"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Kpi Studio Definition Editor","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
