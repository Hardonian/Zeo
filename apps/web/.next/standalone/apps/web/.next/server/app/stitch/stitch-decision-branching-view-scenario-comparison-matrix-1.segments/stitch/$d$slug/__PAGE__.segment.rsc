1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T424c,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Scenario Comparison Matrix</title>
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
        /* Custom scrollbar hiding for cleaner mobile look */
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
<body class="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-white">
<!-- Header Section -->
<header class="flex-none pt-2 pb-2 px-4 bg-background-light dark:bg-background-dark z-20">
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
<!-- Controls Section -->
<section class="flex-none px-4 py-3 space-y-4 bg-background-light dark:bg-background-dark z-10 border-b border-slate-200 dark:border-[#316848]/30 shadow-sm">
<!-- Sync Toggle -->
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
<!-- Segmented Control -->
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
<!-- Matrix Container -->
<main class="flex-1 overflow-hidden relative flex flex-col w-full bg-white dark:bg-[#102217]">
<!-- Scrollable Area Wrapper -->
<div class="flex-1 overflow-auto relative">
<!-- Matrix Table -->
<table class="w-full border-collapse text-left text-sm whitespace-nowrap">
<!-- Sticky Header -->
<thead class="sticky top-0 z-20 bg-slate-50 dark:bg-[#162f21] shadow-sm">
<tr>
<th class="sticky left-0 z-30 p-3 w-32 min-w-[140px] border-b border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] text-xs font-bold text-slate-500 dark:text-primary uppercase tracking-wider backdrop-blur-sm">
                            Metrics
                        </th>
<th class="p-3 w-28 min-w-[110px] text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white">
<div class="flex flex-col items-center">
<span class="text-xs text-slate-400 dark:text-slate-400 font-normal">Baseline</span>
<span class="text-sm">Scenario A</span>
</div>
</th>
<th class="p-3 w-28 min-w-[110px] text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white bg-primary/10">
<div class="flex flex-col items-center">
<span class="text-xs text-primary font-normal">Recommended</span>
<span class="text-sm">Scenario B</span>
</div>
</th>
<th class="p-3 w-28 min-w-[110px] text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white">
<div class="flex flex-col items-center">
<span class="text-xs text-slate-400 dark:text-slate-400 font-normal">Aggressive</span>
<span class="text-sm">Scenario C</span>
</div>
</th>
<th class="p-3 w-28 min-w-[110px] text-center border-b border-slate-200 dark:border-[#316848] font-semibold text-slate-700 dark:text-white">
<div class="flex flex-col items-center">
<span class="text-xs text-slate-400 dark:text-slate-400 font-normal">Conservative</span>
<span class="text-sm">Scenario D</span>
</div>
</th>
</tr>
</thead>
<!-- Table Body -->
<tbody class="divide-y divide-slate-100 dark:divide-[#316848]/30">
<!-- Row 1: ROI -->
<tr class="group">
<th class="sticky left-0 z-10 p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300">
                            ROI (3yr)
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                145%
                            </div>
</td>
<td class="p-2 text-center align-middle relative">
<!-- Highlighted Cell (Dominant) -->
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
<!-- Row 2: Market Growth -->
<tr class="group">
<th class="sticky left-0 z-10 p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300">
                            Market Growth
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                +4.2%
                            </div>
</td>
<td class="p-2 text-center align-middle">
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
<!-- Row 3: Robustness -->
<tr class="group">
<th class="sticky left-0 z-10 p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300">
                            Robustness
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/20 dark:bg-primary/10 text-slate-800 dark:text-slate-200 font-medium">
                                High
                            </div>
</td>
<td class="p-2 text-center align-middle relative">
<!-- Highlighted Cell (Dominant) -->
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
<!-- Row 4: Implementation Time -->
<tr class="group">
<th class="sticky left-0 z-10 p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300">
                            Time to Value
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-primary/30 dark:bg-primary/20 text-slate-900 dark:text-white font-medium">
                                6 mo
                            </div>
</td>
<td class="p-2 text-center align-middle">
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
<!-- Row 5: Risk Score -->
<tr class="group">
<th class="sticky left-0 z-10 p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300">
                            Risk Score
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                4.5/10
                            </div>
</td>
<td class="p-2 text-center align-middle">
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
<!-- Row 6: Scalability -->
<tr class="group">
<th class="sticky left-0 z-10 p-3 border-r border-slate-200 dark:border-[#316848] bg-slate-50 dark:bg-[#162f21] font-medium text-slate-600 dark:text-slate-300">
                            Scalability
                        </th>
<td class="p-2 text-center align-middle">
<div class="inline-flex items-center justify-center w-full h-10 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                Ltd
                            </div>
</td>
<td class="p-2 text-center align-middle relative">
<!-- Highlighted Cell (Dominant) -->
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
</div>
<!-- Bottom Floating Summary/Action -->
<div class="absolute bottom-4 left-4 right-4 z-40">
<div class="bg-slate-900/95 dark:bg-[#162f21]/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 dark:border-[#316848] p-4 flex items-center justify-between gap-4">
<div class="flex flex-col">
<span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Top Choice</span>
<div class="flex items-baseline gap-2">
<span class="text-white text-lg font-bold">Scenario B</span>
<span class="text-primary text-sm font-semibold">92% Match</span>
</div>
</div>
<button class="bg-primary hover:bg-primary/90 text-black font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(13,242,108,0.2)]">
<span>Select Path</span>
<span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
</button>
</div>
</div>
<!-- Background Gradient for visual depth -->
<div class="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-30"></div>
</main>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Scenario Comparison Matrix 1","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Scenario Comparison Matrix 1","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
