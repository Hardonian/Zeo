1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T36ea,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Strategy Lab Configuration</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
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
                        "surface-dark": "#1c242e",
                        "surface-dark-light": "#252e3a",
                        "border-dark": "#2e3a4b",
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
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white overflow-hidden">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-y-auto">
<!-- Top App Bar -->
<header class="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 border-b border-slate-200 dark:border-border-dark justify-between">
<button class="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h2 class="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-tight">Strategy Lab</h2>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<span class="text-[10px] font-mono text-primary uppercase tracking-widest">System Ready</span>
</div>
</div>
<button class="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-sm font-bold tracking-wide shrink-0 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                RESET
            </button>
</header>
<!-- Main Content Scroll Area -->
<main class="flex-1 flex flex-col gap-6 p-4 pb-24">
<!-- Section Header -->
<div class="flex items-end justify-between border-b border-slate-200 dark:border-border-dark pb-2">
<h3 class="text-slate-900 dark:text-white text-lg font-bold">Agent Configuration</h3>
<span class="text-xs font-mono text-slate-500 dark:text-slate-400">v1.4.2-RC</span>
</div>
<!-- Agent: Self -->
<div class="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">person</span>
<p class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Agent: Self</p>
</div>
<span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">ACTIVE</span>
</div>
<div class="grid grid-cols-1 gap-4">
<label class="flex flex-col gap-1.5">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Utility Profile</span>
<div class="relative">
<select class="w-full appearance-none rounded border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark-light px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
<option value="logarithmic">Logarithmic (Risk Averse)</option>
<option value="linear">Linear (Risk Neutral)</option>
<option value="exponential">Exponential (Risk Seeking)</option>
</select>
<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
<span class="material-symbols-outlined text-lg">expand_more</span>
</span>
</div>
</label>
<div class="flex flex-col gap-2">
<div class="flex justify-between text-xs">
<span class="font-medium text-slate-500 dark:text-slate-400">Uncertainty Band</span>
<span class="font-mono text-primary">±5.0%</span>
</div>
<div class="relative h-6 w-full pt-1">
<!-- Custom Range Slider Visual -->
<div class="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-surface-dark-light">
<div class="absolute left-[40%] right-[40%] h-full rounded-full bg-primary/30"></div> <!-- Range visual -->
<div class="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-white/50"></div> <!-- Center mark -->
<!-- Knobs -->
<div class="absolute left-[40%] top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow hover:scale-110 transition-transform cursor-grab"></div>
<div class="absolute right-[40%] top-1/2 size-3.5 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow hover:scale-110 transition-transform cursor-grab"></div>
</div>
<div class="mt-1 flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
<span>-20%</span>
<span>0%</span>
<span>+20%</span>
</div>
</div>
</div>
</div>
</div>
<!-- Agent: Opponent -->
<div class="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-orange-500 text-xl">swords</span>
<p class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Agent: Opponent</p>
</div>
<span class="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-orange-500">ADVERSARY</span>
</div>
<div class="grid grid-cols-1 gap-4">
<label class="flex flex-col gap-1.5">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Strategy Model</span>
<div class="relative">
<select class="w-full appearance-none rounded border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark-light px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
<option value="tit-for-tat">Tit-for-Tat (Reciprocal)</option>
<option value="grim-trigger">Grim Trigger (Unforgiving)</option>
<option value="random">Stochastic (Random)</option>
</select>
<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
<span class="material-symbols-outlined text-lg">expand_more</span>
</span>
</div>
</label>
<div class="flex flex-col gap-2">
<div class="flex justify-between text-xs">
<span class="font-medium text-slate-500 dark:text-slate-400">Estimated Variance</span>
<span class="font-mono text-orange-400">±12.0%</span>
</div>
<div class="relative h-6 w-full pt-1">
<!-- Custom Range Slider Visual -->
<div class="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-surface-dark-light">
<div class="absolute left-[20%] right-[35%] h-full rounded-full bg-orange-500/30"></div>
<div class="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-white/50"></div>
<div class="absolute left-[20%] top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500 bg-white shadow"></div>
<div class="absolute right-[35%] top-1/2 size-3.5 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500 bg-white shadow"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Environment -->
<div class="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm">
<!-- Abstract background pattern for environment -->
<div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#137fec_1px,transparent_1px)] [background-size:16px_16px]"></div>
<div class="relative z-10 flex items-center justify-between mb-3">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-xl">language</span>
<p class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Env: Market</p>
</div>
</div>
<div class="relative z-10 grid grid-cols-2 gap-3">
<div class="rounded bg-slate-50 dark:bg-surface-dark-light p-2 border border-slate-200 dark:border-border-dark/50">
<span class="block text-[10px] font-medium text-slate-500 uppercase">Volatility</span>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">High</span>
</div>
<div class="rounded bg-slate-50 dark:bg-surface-dark-light p-2 border border-slate-200 dark:border-border-dark/50">
<span class="block text-[10px] font-medium text-slate-500 uppercase">Horizon</span>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">Infinite</span>
</div>
</div>
</div>
<!-- Comparison Table -->
<div class="flex flex-col gap-2 pt-2">
<div class="flex items-center justify-between">
<h3 class="text-slate-900 dark:text-white text-base font-bold">Strategy Metrics</h3>
<button class="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-base">tune</span>
                        Configure
                     </button>
</div>
<div class="overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark">
<div class="overflow-x-auto">
<table class="w-full text-left text-xs">
<thead class="bg-slate-50 dark:bg-surface-dark-light text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider border-b border-slate-200 dark:border-border-dark">
<tr>
<th class="px-3 py-2 font-semibold">Strategy</th>
<th class="px-3 py-2 font-semibold text-right">E[V]</th>
<th class="px-3 py-2 font-semibold text-right">Minimax</th>
<th class="px-3 py-2 font-semibold text-right">Regret</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-200 dark:divide-border-dark/50 font-mono">
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
<td class="px-3 py-2.5 font-bold text-primary group-hover:underline">Nash Eq.</td>
<td class="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">4.20</td>
<td class="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">-1.10</td>
<td class="px-3 py-2.5 text-right text-slate-500 dark:text-slate-400">0.05</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
<td class="px-3 py-2.5 font-medium text-slate-900 dark:text-white">Tit-for-Tat</td>
<td class="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">3.85</td>
<td class="px-3 py-2.5 text-right text-rose-500 dark:text-rose-400 font-bold">-0.50</td>
<td class="px-3 py-2.5 text-right text-slate-500 dark:text-slate-400">0.12</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
<td class="px-3 py-2.5 font-medium text-slate-900 dark:text-white">Grim Trigger</td>
<td class="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">5.10</td>
<td class="px-3 py-2.5 text-right text-rose-500 dark:text-rose-400 font-bold">-4.00</td>
<td class="px-3 py-2.5 text-right text-amber-500 dark:text-amber-400 font-bold">0.88</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
<td class="px-3 py-2.5 font-medium text-slate-900 dark:text-white">Pavlov</td>
<td class="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">3.92</td>
<td class="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">-2.10</td>
<td class="px-3 py-2.5 text-right text-slate-500 dark:text-slate-400">0.45</td>
</tr>
</tbody>
</table>
</div>
<div class="border-t border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark-light px-3 py-1.5 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
<span>Updated: 14ms ago</span>
<span>Confidence: 98.2%</span>
</div>
</div>
</div>
</main>
<!-- Bottom Action Bar -->
<div class="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-border-dark bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 max-w-md mx-auto">
<div class="flex gap-3">
<button class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-surface-dark-light">
<span class="material-symbols-outlined">ios_share</span>
</button>
<button class="group flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined text-white animate-spin [animation-duration:3s]" style="font-variation-settings: 'FILL' 1;">data_saver_on</span>
<span class="font-semibold text-white">Compute Equilibrium</span>
</button>
</div>
</div>
</div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Strategy Lab Configuration 1"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Strategy Lab Configuration 1","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
