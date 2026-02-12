1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T443e,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Scenario Comparison Matrix</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0df26c",
                        "background-light": "#f5f8f7",
                        "background-dark": "#102217",
                        "surface-dark": "#162f21",
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
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }.sticky-col-header {
            position: sticky;
            top: 0;
            z-index: 40;
        }
        .sticky-row-header {
            position: sticky;
            left: 0;
            z-index: 30;
        }
        .sticky-corner {
            position: sticky;
            top: 0;
            left: 0;
            z-index: 50;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-white">
<header class="flex-none pt-safe-top pb-2 px-4 bg-background-light dark:bg-background-dark z-20">
<div class="flex items-center justify-between py-2">
<button class="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-size: 24px;">arrow_back</span>
</button>
<h1 class="text-lg font-bold tracking-tight">Scenario Comparison</h1>
<button class="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-primary font-medium text-sm">
<span class="material-symbols-outlined" style="font-size: 24px;">ios_share</span>
</button>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm px-1 leading-snug">
            Compare scenarios side-by-side to evaluate outcomes and dominant paths.
        </p>
</header>
<section class="flex-none px-4 py-3 space-y-4 bg-background-light dark:bg-background-dark z-10 border-b border-slate-200 dark:border-[#316848]/30 shadow-sm">
<div class="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#316848] bg-white dark:bg-[#162f21] p-3 shadow-sm">
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary" style="font-size: 20px;">sync_alt</span>
<span class="font-bold text-sm">Sync Views</span>
</div>
<span class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lock scroll with Tree View</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<div class="bg-slate-200 dark:bg-[#162f21] p-1 rounded-lg flex relative">
<label class="flex-1 text-center relative z-10 cursor-pointer">
<input checked="" class="peer sr-only" name="view-mode" type="radio" value="dominant"/>
<div class="py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all peer-checked:text-slate-900 dark:peer-checked:text-white">Dominant Paths</div>
<div class="absolute inset-0 bg-white dark:bg-[#2a553c] rounded-md shadow-sm transform scale-95 opacity-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all -z-10"></div>
</label>
<label class="flex-1 text-center relative z-10 cursor-pointer">
<input class="peer sr-only" name="view-mode" type="radio" value="conflict"/>
<div class="py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all peer-checked:text-slate-900 dark:peer-checked:text-white">Conflict Points</div>
<div class="absolute inset-0 bg-white dark:bg-[#2a553c] rounded-md shadow-sm transform scale-95 opacity-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all -z-10"></div>
</label>
</div>
</section>
<main class="flex-1 overflow-hidden relative flex flex-col w-full bg-white dark:bg-[#102217]">
<div class="flex-1 overflow-auto relative hide-scrollbar scroll-smooth">
<table class="min-w-full border-collapse text-left text-sm whitespace-nowrap table-fixed">
<colgroup>
<col class="w-[140px]"/>
<col class="w-[120px]"/>
<col class="w-[120px]"/>
<col class="w-[120px]"/>
<col class="w-[120px]"/>
</colgroup>
<thead class="bg-slate-50 dark:bg-[#162f21] shadow-sm">
<tr>
<th class="sticky-corner p-3 border-b border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] text-xs font-bold text-slate-500 dark:text-primary uppercase tracking-wider backdrop-blur-md shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] z-50">
                            Metrics
                        </th>
<th class="sticky-col-header p-3 text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white bg-slate-50 dark:bg-[#162f21]">
<div class="flex flex-col items-center">
<span class="text-xs text-slate-400 dark:text-slate-400 font-normal">Baseline</span>
<span class="text-sm">Scenario A</span>
</div>
</th>
<th class="sticky-col-header p-3 text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white bg-primary/10 dark:bg-[#1a3828]">
<div class="flex flex-col items-center">
<span class="text-xs text-primary font-normal">Recommended</span>
<span class="text-sm">Scenario B</span>
</div>
</th>
<th class="sticky-col-header p-3 text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white bg-slate-50 dark:bg-[#162f21]">
<div class="flex flex-col items-center">
<span class="text-xs text-slate-400 dark:text-slate-400 font-normal">Aggressive</span>
<span class="text-sm">Scenario C</span>
</div>
</th>
<th class="sticky-col-header p-3 text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white bg-slate-50 dark:bg-[#162f21]">
<div class="flex flex-col items-center">
<span class="text-xs text-slate-400 dark:text-slate-400 font-normal">Conservative</span>
<span class="text-sm">Scenario D</span>
</div>
</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-[#316848]/30">
<tr class="group">
<th class="sticky-row-header p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                            ROI (3yr)
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                145%
                            </div>
</td>
<td class="p-2 text-center align-middle relative bg-primary/5 dark:bg-[#1a3828]/50">
<div class="absolute inset-0 border-2 border-primary rounded-lg m-1 pointer-events-none z-10"></div>
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary text-black font-bold shadow-[0_0_15px_rgba(13,242,108,0.3)]">
                                210%
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/40 dark:bg-primary/30 text-black dark:text-white font-semibold">
                                185%
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                110%
                            </div>
</td>
</tr>
<tr class="group">
<th class="sticky-row-header p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                            Market Growth
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                +4.2%
                            </div>
</td>
<td class="p-2 text-center align-middle bg-primary/5 dark:bg-[#1a3828]/50">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/60 dark:bg-primary/50 text-black dark:text-white font-bold">
                                +12.5%
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary text-black font-bold">
                                +15.1%
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                +2.1%
                            </div>
</td>
</tr>
<tr class="group">
<th class="sticky-row-header p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                            Robustness
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/20 dark:bg-primary/10 text-slate-800 dark:text-slate-200 font-medium">
                                High
                            </div>
</td>
<td class="p-2 text-center align-middle relative bg-primary/5 dark:bg-[#1a3828]/50">
<div class="absolute inset-0 border-2 border-primary rounded-lg m-1 pointer-events-none z-10"></div>
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary text-black font-bold shadow-[0_0_15px_rgba(13,242,108,0.3)]">
                                Elite
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-red-500/50 dark:border-red-400/50">
                                Low
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/20 dark:bg-primary/10 text-slate-800 dark:text-slate-200 font-medium">
                                Med
                            </div>
</td>
</tr>
<tr class="group">
<th class="sticky-row-header p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                            Time to Value
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/30 dark:bg-primary/20 text-slate-900 dark:text-white font-medium">
                                6 mo
                            </div>
</td>
<td class="p-2 text-center align-middle bg-primary/5 dark:bg-[#1a3828]/50">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/50 dark:bg-primary/40 text-black dark:text-white font-semibold">
                                8 mo
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-500">
                                14 mo
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary text-black font-bold">
                                4 mo
                            </div>
</td>
</tr>
<tr class="group">
<th class="sticky-row-header p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                            Risk Score
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                4.5/10
                            </div>
</td>
<td class="p-2 text-center align-middle bg-primary/5 dark:bg-[#1a3828]/50">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/30 dark:bg-primary/20 text-slate-900 dark:text-white font-medium">
                                6.2/10
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-rose-200 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700 font-bold">
                                8.9/10
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary text-black font-bold">
                                2.1/10
                            </div>
</td>
</tr>
<tr class="group">
<th class="sticky-row-header p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                            Scalability
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                Ltd
                            </div>
</td>
<td class="p-2 text-center align-middle relative bg-primary/5 dark:bg-[#1a3828]/50">
<div class="absolute inset-0 border-2 border-primary rounded-lg m-1 pointer-events-none z-10"></div>
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary text-black font-bold shadow-[0_0_15px_rgba(13,242,108,0.3)]">
                                Glob
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/60 dark:bg-primary/50 text-black dark:text-white font-bold">
                                Reg
                            </div>
</td>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                None
                            </div>
</td>
</tr>
</tbody>
</table>
<div class="h-32 w-full"></div>
</div>
<div class="absolute bottom-4 left-4 right-4 z-50">
<div class="bg-slate-900/95 dark:bg-[#162f21]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 dark:border-[#316848] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
<div class="flex flex-col">
<span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Top Choice</span>
<div class="flex items-baseline gap-2">
<span class="text-white text-lg font-bold">Scenario B</span>
<span class="text-primary text-sm font-semibold">92% Match</span>
</div>
</div>
<button class="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-6 rounded-lg text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(13,242,108,0.2)] w-full sm:w-auto">
<span>Select Path</span>
<span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
</button>
</div>
</div>
<div class="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-40"></div>
</main>

</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Scenario Comparison Matrix 2"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Scenario Comparison Matrix 2","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
