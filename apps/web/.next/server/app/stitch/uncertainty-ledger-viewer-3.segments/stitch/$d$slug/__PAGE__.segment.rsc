1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T3b8d,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Uncertainty Ledger Viewer</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "card-dark": "#1a2632",
                        "card-light": "#ffffff",
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
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 2px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary/30">
<div class="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light dark:bg-background-dark shadow-2xl">
<!-- Top App Bar -->
<header class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 backdrop-blur-md">
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h1 class="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Research Console</h1>
<h2 class="text-base font-bold leading-none text-slate-900 dark:text-white">Uncertainty Ledger</h2>
</div>
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">settings</span>
</button>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto pb-24">
<!-- Global Confidence Summary -->
<div class="px-4 pt-6 pb-2">
<div class="flex flex-col items-start gap-1">
<span class="text-xs font-medium uppercase tracking-wider text-primary">System Confidence</span>
<div class="flex w-full items-baseline justify-between">
<h2 class="font-mono text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">84.2<span class="text-2xl text-slate-400">%</span></h2>
<div class="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
<span class="material-symbols-outlined text-[14px]">trending_up</span>
<span>+2.4%</span>
</div>
</div>
<p class="text-sm text-slate-500 dark:text-slate-400">Confidence interval: 95% (±2.4%)</p>
</div>
<!-- Global Metrics Grid -->
<div class="mt-6 grid grid-cols-2 gap-3">
<div class="flex flex-col gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark p-3 shadow-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-slate-400">blur_on</span>
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Total Variance</span>
</div>
<span class="font-mono text-lg font-semibold text-slate-900 dark:text-white">σ: 0.04</span>
</div>
<div class="flex flex-col gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark p-3 shadow-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-slate-400">ssid_chart</span>
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Drift Rate</span>
</div>
<span class="font-mono text-lg font-semibold text-slate-900 dark:text-white">1.2e-4</span>
</div>
</div>
</div>
<!-- Ledger Feed -->
<div class="mt-6">
<div class="mb-3 flex items-center justify-between px-4">
<h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ledger Entries</h3>
<button class="text-xs font-medium text-primary hover:underline">View Log</button>
</div>
<div class="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
<!-- Entry 1: Measurement Noise -->
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[16px]">sensors</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white">Measurement Noise</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">12%</span>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
<div class="flex justify-between">
<span class="text-slate-500">Sensor var</span>
<span class="font-mono text-slate-900 dark:text-slate-300">12.4ms</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">SNR</span>
<span class="font-mono text-slate-900 dark:text-slate-300">88dB</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Calibration</span>
<span class="font-mono text-green-600 dark:text-green-400">OK</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Latency</span>
<span class="font-mono text-slate-900 dark:text-slate-300">4ms</span>
</div>
</div>
<!-- Sparkline/Bar -->
<div class="flex flex-col gap-1">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Low</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[12%] rounded-full bg-slate-400 dark:bg-slate-500"></div>
</div>
</div>
</div>
<!-- Entry 2: Model Variance -->
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[16px]">model_training</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white">Model Variance</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">28%</span>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
<div class="flex justify-between">
<span class="text-slate-500">Overfitting</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.02</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Param Drift</span>
<span class="font-mono text-orange-500">High</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Epoch</span>
<span class="font-mono text-slate-900 dark:text-slate-300">#942</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Loss</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.14</span>
</div>
</div>
<div class="flex flex-col gap-1">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Med</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[28%] rounded-full bg-primary/70"></div>
</div>
</div>
</div>
<!-- Entry 3: Regime Shift (Highlighted) -->
<div class="group relative flex flex-col gap-3 bg-primary/[0.03] p-4 hover:bg-primary/[0.06] transition-colors">
<div class="absolute left-0 top-0 h-full w-1 bg-primary"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-primary/20 text-primary">
<span class="material-symbols-outlined text-[16px]">area_chart</span>
</span>
<span class="font-semibold text-primary">Regime Shift</span>
</div>
<span class="font-mono text-sm font-bold text-primary">45%</span>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">Volatility</span>
<span class="font-mono text-slate-900 dark:text-white">82.4</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">Hist Corr</span>
<span class="font-mono text-slate-900 dark:text-white">-0.41</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">State</span>
<span class="font-mono text-red-500">Unstable</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">Delta</span>
<span class="font-mono text-slate-900 dark:text-white">Δ 4.2</span>
</div>
</div>
<div class="flex flex-col gap-1">
<div class="flex justify-between text-[10px] uppercase text-primary/70">
<span>Impact Contribution</span>
<span>Critical</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[45%] rounded-full bg-primary"></div>
</div>
</div>
</div>
<!-- Entry 4: Adversarial Input -->
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[16px]">security</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white">Adversarial Input</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">8%</span>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
<div class="flex justify-between">
<span class="text-slate-500">Vector Prob</span>
<span class="font-mono text-slate-900 dark:text-slate-300">1.2%</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Robustness</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.98</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Attempts</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Filter</span>
<span class="font-mono text-green-600 dark:text-green-400">Active</span>
</div>
</div>
<div class="flex flex-col gap-1">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Minimal</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[8%] rounded-full bg-slate-400 dark:bg-slate-500"></div>
</div>
</div>
</div>
<!-- Entry 5: AI-Proposal Uncertainty -->
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[16px]">smart_toy</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white">AI-Proposal</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white">7%</span>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
<div class="flex justify-between">
<span class="text-slate-500">Hallucination</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.5%</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Log-prob</span>
<span class="font-mono text-slate-900 dark:text-slate-300">-2.4</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Tokens</span>
<span class="font-mono text-slate-900 dark:text-slate-300">420</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Temp</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.7</span>
</div>
</div>
<div class="flex flex-col gap-1">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Minimal</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[7%] rounded-full bg-slate-400 dark:bg-slate-500"></div>
</div>
</div>
</div>
</div>
<!-- Spacer for scrolling past sticky footer -->
<div class="h-24"></div>
</div>
</main>
<!-- Sticky Footer Actions -->
<div class="absolute bottom-0 z-50 w-full border-t border-slate-200 dark:border-slate-800 bg-background-light/90 dark:bg-background-dark/90 px-4 py-4 backdrop-blur-md">
<div class="flex gap-3">
<button class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white transition-transform active:scale-95">
<span class="material-symbols-outlined text-[18px]">tune</span>
                    Normalize
                </button>
<button class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
<span class="material-symbols-outlined text-[18px]">download</span>
                    Export Log
                </button>
</div>
</div>
</div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Uncertainty Ledger Viewer 3"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Uncertainty Ledger Viewer 3","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
