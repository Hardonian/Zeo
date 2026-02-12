1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-e24765025faea277.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/51624f46484614f8.css","style"]
0:{"P":null,"b":"V_sCMn05SiQGXpllElBBM","c":["","stitch","kpi-studio-definition-editor"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","kpi-studio-definition-editor","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T370b,<!DOCTYPE html>

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
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Kpi Studio Definition Editor"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Kpi Studio Definition Editor","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
