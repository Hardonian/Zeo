1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T3fc5,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sensitivity &amp; Placebo Analysis</title>
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
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
        .font-mono-nums { font-variant-numeric: tabular-nums; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white pb-20">
<!-- Top App Bar -->
<div class="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
<div class="flex items-center justify-between px-4 py-3">
<button class="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model A Diagnostics</span>
<h1 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Sensitivity Analysis</h1>
</div>
<button class="flex items-center justify-center p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-primary">download</span>
</button>
</div>
</div>
<div class="p-4 space-y-6 max-w-lg mx-auto">
<!-- Fragility Warning Banner -->
<div class="relative overflow-hidden rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
<div class="absolute top-0 right-0 p-4 opacity-10">
<span class="material-symbols-outlined text-amber-500 text-6xl">warning</span>
</div>
<div class="relative z-10 flex gap-3">
<span class="material-symbols-outlined text-amber-500 shrink-0 mt-0.5">warning</span>
<div>
<h3 class="text-amber-500 font-bold text-sm uppercase tracking-wide mb-1">Fragility Warning</h3>
<p class="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                        Estimates are highly sensitive to small data perturbations. Removing the top <span class="font-bold text-amber-500">1%</span> of observations flips the sign of the coefficient.
                    </p>
</div>
</div>
</div>
<!-- Effect Variation Chart (Coefficient Stability) -->
<section class="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
<div class="flex items-center justify-between mb-6">
<h2 class="text-base font-bold dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">bar_chart</span>
                    Effect Variation
                </h2>
<div class="px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary">
                    Avg: 0.42
                </div>
</div>
<!-- Custom CSS Chart -->
<div class="relative pt-6 pb-2">
<!-- Zero Line -->
<div class="absolute left-[30%] top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600 border-l border-dashed border-slate-400 dark:border-slate-500 z-0"></div>
<div class="absolute left-[30%] -top-4 -translate-x-1/2 text-[10px] text-slate-400 font-mono">0</div>
<div class="space-y-5 relative z-10">
<!-- Row 1 -->
<div class="grid grid-cols-[100px_1fr] items-center gap-4 group">
<div class="text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Baseline</div>
<div class="relative h-8 flex items-center">
<!-- Bar Container (offset based on value) -->
<div class="absolute left-[30%] h-3 bg-primary rounded-r-sm transition-all w-[45%]"></div>
<!-- Error Bar -->
<div class="absolute left-[55%] h-full w-px bg-slate-800 dark:bg-white/50 h-2 top-3"></div>
<div class="absolute left-[45%] right-auto top-3 h-2 w-[30%] border-l border-r border-slate-800 dark:border-white/50"></div> <!-- CI spread visual -->
<div class="absolute left-[45%] right-auto top-4 h-px w-[30%] bg-slate-800 dark:bg-white/50"></div>
<!-- Value Label -->
<span class="absolute left-[78%] text-[10px] font-bold text-slate-900 dark:text-white pl-2">0.45</span>
</div>
</div>
<!-- Row 2 -->
<div class="grid grid-cols-[100px_1fr] items-center gap-4 group">
<div class="text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Controls A</div>
<div class="relative h-8 flex items-center">
<div class="absolute left-[30%] h-3 bg-primary/80 rounded-r-sm w-[38%]"></div>
<!-- CI -->
<div class="absolute left-[50%] top-4 h-px w-[25%] bg-slate-800 dark:bg-white/50"></div>
<div class="absolute left-[50%] top-3 h-2 w-px bg-slate-800 dark:bg-white/50"></div>
<div class="absolute left-[75%] top-3 h-2 w-px bg-slate-800 dark:bg-white/50"></div>
<span class="absolute left-[70%] text-[10px] font-bold text-slate-900 dark:text-white pl-2">0.38</span>
</div>
</div>
<!-- Row 3 -->
<div class="grid grid-cols-[100px_1fr] items-center gap-4 group">
<div class="text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Controls B</div>
<div class="relative h-8 flex items-center">
<div class="absolute left-[30%] h-3 bg-primary/60 rounded-r-sm w-[52%]"></div>
<!-- CI -->
<div class="absolute left-[60%] top-4 h-px w-[35%] bg-slate-800 dark:bg-white/50"></div>
<div class="absolute left-[60%] top-3 h-2 w-px bg-slate-800 dark:bg-white/50"></div>
<div class="absolute left-[95%] top-3 h-2 w-px bg-slate-800 dark:bg-white/50"></div>
<span class="absolute left-[84%] text-[10px] font-bold text-slate-900 dark:text-white pl-2">0.52</span>
</div>
</div>
<!-- Row 4 -->
<div class="grid grid-cols-[100px_1fr] items-center gap-4 group">
<div class="text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Full Set</div>
<div class="relative h-8 flex items-center">
<div class="absolute left-[30%] h-3 bg-primary/40 rounded-r-sm w-[15%]"></div>
<!-- CI -->
<div class="absolute left-[35%] top-4 h-px w-[20%] bg-slate-800 dark:bg-white/50"></div>
<div class="absolute left-[35%] top-3 h-2 w-px bg-slate-800 dark:bg-white/50"></div>
<div class="absolute left-[55%] top-3 h-2 w-px bg-slate-800 dark:bg-white/50"></div>
<span class="absolute left-[47%] text-[10px] font-bold text-slate-900 dark:text-white pl-2">0.15</span>
</div>
</div>
</div>
<div class="mt-4 text-center">
<span class="text-[10px] text-slate-400 uppercase tracking-widest">Coefficient Magnitude</span>
</div>
</div>
</section>
<!-- Placebo Test Results -->
<section class="bg-white dark:bg-[#1e293b] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
<div class="p-5 pb-2 flex items-center justify-between">
<h2 class="text-base font-bold dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">science</span>
                    Placebo Tests
                </h2>
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">N=50</span>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left text-sm whitespace-nowrap">
<thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
<tr>
<th class="px-5 py-3 font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">Test Scenario</th>
<th class="px-5 py-3 font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider text-right">Coef.</th>
<th class="px-5 py-3 font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider text-right">P-Value</th>
<th class="px-5 py-3 font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider text-center">Status</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
<tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td class="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">Lagged Outcome (t-1)</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">0.002</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">0.854</td>
<td class="px-5 py-3 text-center">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    PASS
                                </span>
</td>
</tr>
<tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td class="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">Random Treatment Shuffle</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">-0.015</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">0.621</td>
<td class="px-5 py-3 text-center">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    PASS
                                </span>
</td>
</tr>
<tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td class="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">Future Placebo (t+3)</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">0.124</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums font-bold text-amber-600 dark:text-amber-400">0.045</td>
<td class="px-5 py-3 text-center">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    FAIL
                                </span>
</td>
</tr>
<tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td class="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">Fake State (Control)</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">0.008</td>
<td class="px-5 py-3 text-right font-mono font-mono-nums text-slate-600 dark:text-slate-400">0.912</td>
<td class="px-5 py-3 text-center">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    PASS
                                </span>
</td>
</tr>
</tbody>
</table>
</div>
<div class="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-center">
<button class="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">View All 50 Tests</button>
</div>
</section>
<!-- Time Shift Analysis -->
<section class="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
<div class="flex items-center justify-between mb-4">
<h2 class="text-base font-bold dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">history</span>
                    Time Shift Analysis
                </h2>
</div>
<div class="relative h-40 w-full mt-6">
<!-- Background Grid -->
<div class="absolute inset-0 grid grid-cols-4 grid-rows-1 border-b border-slate-200 dark:border-slate-700">
<div class="border-r border-dashed border-slate-200 dark:border-slate-700/50"></div>
<div class="border-r border-dashed border-slate-200 dark:border-slate-700/50"></div>
<div class="border-r border-dashed border-slate-200 dark:border-slate-700/50"></div>
<div class=""></div>
</div>
<!-- Zero Line -->
<div class="absolute inset-x-0 top-1/2 h-px bg-slate-300 dark:bg-slate-600"></div>
<!-- Data Line (SVG) -->
<svg class="absolute inset-0 w-full h-full" preserveaspectratio="none">
<!-- Path connecting points -->
<path class="opacity-80" d="M 20 100 L 100 95 L 180 30 L 260 90 L 340 105" fill="none" stroke="#137fec" stroke-width="2"></path>
<!-- Area under curve (subtle gradient) -->
<path class="opacity-10" d="M 20 100 L 100 95 L 180 30 L 260 90 L 340 105 L 340 160 L 20 160 Z" fill="url(#gradientPrimary)"></path>
<defs>
<lineargradient id="gradientPrimary" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#137fec" stop-opacity="0.5"></stop>
<stop offset="100%" stop-color="#137fec" stop-opacity="0"></stop>
</lineargradient>
</defs>
</svg>
<!-- Points -->
<div class="absolute inset-0 relative">
<!-- T-2 -->
<div class="absolute left-[5%] top-[62%] -translate-x-1/2 flex flex-col items-center group">
<div class="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-slate-400 rounded-full z-10"></div>
<span class="mt-2 text-[10px] font-medium text-slate-500">T-2</span>
</div>
<!-- T-1 -->
<div class="absolute left-[28%] top-[59%] -translate-x-1/2 flex flex-col items-center group">
<div class="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-slate-400 rounded-full z-10"></div>
<span class="mt-2 text-[10px] font-medium text-slate-500">T-1</span>
</div>
<!-- T0 (Treatment) -->
<div class="absolute left-[51%] top-[18%] -translate-x-1/2 flex flex-col items-center group">
<div class="w-4 h-4 bg-primary border-2 border-white dark:border-slate-800 shadow-md rounded-full z-10 ring-4 ring-primary/20"></div>
<div class="absolute -top-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] px-2 py-0.5 rounded font-bold">0.42</div>
<span class="mt-2 text-[10px] font-bold text-primary">T0</span>
</div>
<!-- T+1 -->
<div class="absolute left-[74%] top-[56%] -translate-x-1/2 flex flex-col items-center group">
<div class="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-slate-400 rounded-full z-10"></div>
<span class="mt-2 text-[10px] font-medium text-slate-500">T+1</span>
</div>
<!-- T+2 -->
<div class="absolute left-[95%] top-[65%] -translate-x-1/2 flex flex-col items-center group">
<div class="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-slate-400 rounded-full z-10"></div>
<span class="mt-2 text-[10px] font-medium text-slate-500">T+2</span>
</div>
</div>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-2 italic text-center">
                Effect is localized to treatment period (T0). No significant pre-trends.
            </p>
</section>
</div>
<!-- Fixed Bottom Action Bar -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
<div class="max-w-lg mx-auto flex gap-3">
<button class="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold py-3 px-4 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                Modify Params
            </button>
<button class="flex-1 bg-primary text-white font-semibold py-3 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Export Report
            </button>
</div>
</div>
</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Sensitivity & Placebo Analysis"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Sensitivity & Placebo Analysis","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
