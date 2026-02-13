1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T401b,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Strategy Lab Configuration</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
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
        }#plain-language-toggle:checked ~ div .lang-technical {
            display: none;
        }
        #plain-language-toggle:not(:checked) ~ div .lang-plain {
            display: none;
        }.toggle-checkbox:checked {
            right: 0;
            border-color: #137fec;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #137fec;
        }#plain-language-toggle:checked ~ main .strategy-nash { content: "Optimal Balance"; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white overflow-hidden">
<input class="peer sr-only" id="plain-language-toggle" type="checkbox"/>
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-y-auto">
<header class="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 dark:border-border-dark justify-between">
<button class="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h2 class="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-tight">Strategy Lab</h2>
<label class="flex items-center gap-2 cursor-pointer mt-1 group" for="plain-language-toggle">
<span class="text-[10px] font-medium uppercase tracking-wide text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Plain Language</span>
<div class="relative inline-flex h-4 w-7 items-center rounded-full border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-surface-dark transition-colors peer-checked:bg-primary peer-checked:border-primary">
<span class="absolute left-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-3"></span>
</div>
</label>
</div>
<button class="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-sm font-bold tracking-wide shrink-0 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                RESET
            </button>
</header>
<main class="flex-1 flex flex-col gap-6 p-4 pb-24">
<div class="flex items-end justify-between border-b border-slate-200 dark:border-border-dark pb-2">
<h3 class="text-slate-900 dark:text-white text-lg font-bold">
<span class="lang-technical">Agent Configuration</span>
<span class="lang-plain">Setup Players</span>
</h3>
<span class="text-xs font-mono text-slate-500 dark:text-slate-400">v1.4.2-RC</span>
</div>
<div class="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">person</span>
<p class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
<span class="lang-technical">Agent: Self</span>
<span class="lang-plain">You (My Strategy)</span>
</p>
</div>
<span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">ACTIVE</span>
</div>
<div class="grid grid-cols-1 gap-4">
<label class="flex flex-col gap-1.5">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">
<span class="lang-technical">Utility Profile</span>
<span class="lang-plain">Your Goal Style</span>
</span>
<div class="relative">
<select class="w-full appearance-none rounded border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark-light px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
<option value="logarithmic">
Logarithmic (Risk Averse)
Cautious (Avoid Risk)
</option>
<option value="linear">
Linear (Risk Neutral)
Balanced (Neutral)
</option>
<option value="exponential">
Exponential (Risk Seeking)
Aggressive (Seek Risk)
</option>
</select>
<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
<span class="material-symbols-outlined text-lg">expand_more</span>
</span>
</div>
</label>
<div class="flex flex-col gap-2">
<div class="flex justify-between text-xs">
<span class="font-medium text-slate-500 dark:text-slate-400">
<span class="lang-technical">Uncertainty Band</span>
<span class="lang-plain">Wiggle Room</span>
</span>
<span class="font-mono text-primary">±5.0%</span>
</div>
<div class="relative h-6 w-full pt-1">
<div class="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-surface-dark-light">
<div class="absolute left-[40%] right-[40%] h-full rounded-full bg-primary/30"></div> 
<div class="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-white/50"></div> 
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
<div class="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-orange-500 text-xl">swords</span>
<p class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
<span class="lang-technical">Agent: Opponent</span>
<span class="lang-plain">The Other Player</span>
</p>
</div>
<span class="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-orange-500">ADVERSARY</span>
</div>
<div class="grid grid-cols-1 gap-4">
<label class="flex flex-col gap-1.5">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">
<span class="lang-technical">Strategy Model</span>
<span class="lang-plain">Their Behavior</span>
</span>
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
<span class="font-medium text-slate-500 dark:text-slate-400">
<span class="lang-technical">Estimated Variance</span>
<span class="lang-plain">Guess Accuracy</span>
</span>
<span class="font-mono text-orange-400">±12.0%</span>
</div>
<div class="relative h-6 w-full pt-1">
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
<div class="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm">
<div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#137fec_1px,transparent_1px)] [background-size:16px_16px]"></div>
<div class="relative z-10 flex items-center justify-between mb-3">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-xl">language</span>
<p class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
<span class="lang-technical">Env: Market</span>
<span class="lang-plain">Setting: Market</span>
</p>
</div>
</div>
<div class="relative z-10 grid grid-cols-2 gap-3">
<div class="rounded bg-slate-50 dark:bg-surface-dark-light p-2 border border-slate-200 dark:border-border-dark/50">
<span class="block text-[10px] font-medium text-slate-500 uppercase">
<span class="lang-technical">Volatility</span>
<span class="lang-plain">Instability</span>
</span>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">High</span>
</div>
<div class="rounded bg-slate-50 dark:bg-surface-dark-light p-2 border border-slate-200 dark:border-border-dark/50">
<span class="block text-[10px] font-medium text-slate-500 uppercase">
<span class="lang-technical">Horizon</span>
<span class="lang-plain">Duration</span>
</span>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">Infinite</span>
</div>
</div>
</div>
<div class="flex flex-col gap-2 pt-2">
<div class="flex items-center justify-between">
<h3 class="text-slate-900 dark:text-white text-base font-bold">
<span class="lang-technical">Strategy Metrics</span>
<span class="lang-plain">Outcome Summary</span>
</h3>
<button class="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-base">tune</span>
                        Configure
                     </button>
</div>
<div class="lang-plain hidden bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-200 mb-2">
<strong class="text-primary font-bold block mb-1">TL;DR Analysis:</strong>
                    "Optimal Balance" gives you the best average return. However, "Unforgiving" is too risky if things go wrong. Stick to "Reciprocal" for a safer long-term bet.
                </div>
<div class="overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark">
<div class="overflow-x-auto">
<table class="w-full text-left text-xs">
<thead class="bg-slate-50 dark:bg-surface-dark-light text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider border-b border-slate-200 dark:border-border-dark">
<tr>
<th class="px-3 py-2 font-semibold">Strategy</th>
<th class="px-3 py-2 font-semibold text-right">
<span class="lang-technical">E[V]</span>
<span class="lang-plain">Avg. Win</span>
</th>
<th class="px-3 py-2 font-semibold text-right">
<span class="lang-technical">Minimax</span>
<span class="lang-plain">Safe Play</span>
</th>
<th class="px-3 py-2 font-semibold text-right">
<span class="lang-technical">Regret</span>
<span class="lang-plain">Missed Out</span>
</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-200 dark:divide-border-dark/50 font-mono">
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
<td class="px-3 py-2.5 font-bold text-primary group-hover:underline">
<span class="lang-technical">Nash Eq.</span>
<span class="lang-plain">Optimal Balance</span>
</td>
<td class="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">4.20</td>
<td class="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">-1.10</td>
<td class="px-3 py-2.5 text-right text-slate-500 dark:text-slate-400">0.05</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
<td class="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
<span class="lang-technical">Tit-for-Tat</span>
<span class="lang-plain">Reciprocal</span>
</td>
<td class="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">3.85</td>
<td class="px-3 py-2.5 text-right text-rose-500 dark:text-rose-400 font-bold">-0.50</td>
<td class="px-3 py-2.5 text-right text-slate-500 dark:text-slate-400">0.12</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
<td class="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
<span class="lang-technical">Grim Trigger</span>
<span class="lang-plain">Unforgiving</span>
</td>
<td class="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">5.10</td>
<td class="px-3 py-2.5 text-right text-rose-500 dark:text-rose-400 font-bold">-4.00</td>
<td class="px-3 py-2.5 text-right text-amber-500 dark:text-amber-400 font-bold">0.88</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
<td class="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
<span class="lang-technical">Pavlov</span>
<span class="lang-plain">Win-Stay</span>
</td>
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

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Strategy Lab Configuration 2"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Strategy Lab Configuration 2","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
