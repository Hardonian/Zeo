1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3e32,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Uncertainty Components</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
                        "surface-dark": "#16202a",
                        "surface-highlight": "#1c2834",
                        "border-dark": "#2a3845",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Space Grotesk', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        /* Custom gradient for density bars */
        .density-gradient-blue {
            background: linear-gradient(90deg, rgba(19, 127, 236, 0) 0%, rgba(19, 127, 236, 0.2) 20%, rgba(19, 127, 236, 1) 50%, rgba(19, 127, 236, 0.2) 80%, rgba(19, 127, 236, 0) 100%);
        }
        .density-gradient-gray {
            background: linear-gradient(90deg, rgba(157, 171, 185, 0) 0%, rgba(157, 171, 185, 0.2) 20%, rgba(157, 171, 185, 0.8) 50%, rgba(157, 171, 185, 0.2) 80%, rgba(157, 171, 185, 0) 100%);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
<div class="max-w-md mx-auto min-h-screen relative flex flex-col bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden border-x border-slate-200 dark:border-border-dark">
<!-- Header -->
<header class="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-border-dark p-4 pb-3">
<div class="flex items-center justify-between mb-1">
<button class="flex items-center justify-center size-8 rounded hover:bg-slate-200 dark:hover:bg-surface-highlight transition-colors text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[20px]">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h1 class="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Uncertainty</h1>
<span class="text-[10px] text-primary font-mono tracking-tight">V2.4 — EPISTEMIC PRECISION</span>
</div>
<button class="flex items-center justify-center size-8 rounded hover:bg-slate-200 dark:hover:bg-surface-highlight transition-colors text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[20px]">settings</span>
</button>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 p-4 space-y-6">
<!-- Section 1: Inline Notation -->
<section>
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">01 / Inline Notation</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">TEXT-BAND</span>
</div>
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg divide-y divide-slate-100 dark:divide-border-dark">
<!-- Item 1 -->
<div class="flex items-center justify-between p-3.5 group hover:bg-slate-50 dark:hover:bg-surface-highlight transition-colors">
<div class="flex flex-col">
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Global Temperature</span>
<span class="text-[10px] text-slate-400">NASA GISS Source</span>
</div>
<div class="font-mono text-sm text-right">
<span class="text-slate-900 dark:text-white">14.2°C</span>
<span class="text-slate-500 dark:text-slate-500 ml-1 text-xs">[±0.4]</span>
</div>
</div>
<!-- Item 2 -->
<div class="flex items-center justify-between p-3.5 group hover:bg-slate-50 dark:hover:bg-surface-highlight transition-colors">
<div class="flex flex-col">
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Q3 Revenue Proj.</span>
<span class="text-[10px] text-slate-400">Conservative Model</span>
</div>
<div class="font-mono text-sm text-right">
<span class="text-slate-900 dark:text-white">$12.4M</span>
<span class="text-slate-500 dark:text-slate-500 ml-1 text-xs">[±0.2]</span>
</div>
</div>
</div>
</section>
<!-- Section 2: Taxonomy Badges -->
<section>
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">02 / Taxonomy</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">STATUS-BADGE</span>
</div>
<div class="flex flex-wrap gap-2">
<!-- Epistemic Badge -->
<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
<span class="size-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                        Epistemic: High
                    </div>
<!-- Aleatory Badge -->
<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 text-teal-700 dark:text-teal-300 text-xs font-medium">
<span class="size-1.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
                        Aleatory: Low
                    </div>
<!-- Regime Badge -->
<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-surface-highlight border border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-400 text-xs font-medium">
<span class="material-symbols-outlined text-[14px]">show_chart</span>
                        Regime: Volatile
                    </div>
</div>
</section>
<!-- Section 3: Confidence Density -->
<section>
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">03 / Density Indicators</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">DENSITY-BAR</span>
</div>
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg p-4 space-y-4">
<!-- Density Item 1 -->
<div>
<div class="flex justify-between items-end mb-1">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Parameter Alpha</span>
<span class="text-xs font-mono text-primary">0.85 <span class="text-slate-600 opacity-50">CI 95%</span></span>
</div>
<div class="relative h-6 w-full bg-slate-100 dark:bg-surface-highlight rounded overflow-hidden flex items-center justify-center">
<!-- Grid lines -->
<div class="absolute inset-0 flex justify-between px-[10%] opacity-20">
<div class="w-px h-full bg-slate-400"></div>
<div class="w-px h-full bg-slate-400"></div>
<div class="w-px h-full bg-slate-400"></div>
</div>
<!-- Density Gradient -->
<div class="h-4 w-3/4 density-gradient-blue rounded-sm opacity-90 relative">
<div class="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-primary shadow-[0_0_8px_rgba(19,127,236,0.8)]"></div>
</div>
</div>
</div>
<!-- Density Item 2 -->
<div>
<div class="flex justify-between items-end mb-1">
<span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Parameter Beta</span>
<span class="text-xs font-mono text-slate-400">2.14 <span class="text-slate-600 opacity-50">CI 80%</span></span>
</div>
<div class="relative h-6 w-full bg-slate-100 dark:bg-surface-highlight rounded overflow-hidden flex items-center justify-center">
<!-- Density Gradient -->
<div class="h-4 w-1/2 density-gradient-gray rounded-sm opacity-80 relative">
<div class="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-slate-400 dark:bg-slate-300"></div>
</div>
</div>
</div>
</div>
</section>
<!-- Section 4: Contextual Analysis -->
<section>
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">04 / Contextual Analysis</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">TOOLTIP-TRIG</span>
</div>
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg p-3.5">
<div class="flex items-start gap-3">
<div class="flex-1">
<div class="flex items-baseline gap-2 mb-1">
<h4 class="text-sm font-medium text-slate-800 dark:text-slate-200">System Volatility</h4>
<span class="text-xs font-mono text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded border border-red-100 dark:border-red-900/30">High: 45.2</span>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Variance exceeds standard deviation thresholds by 2.4σ.
                            </p>
</div>
<div class="shrink-0 relative group">
<button class="flex items-center gap-1 pl-2 pr-2.5 py-1 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary rounded-full text-[10px] font-bold uppercase transition-all border border-primary/20">
<span class="material-symbols-outlined text-[14px]">help</span>
                                Why High?
                            </button>
<!-- Tooltip Content (visible on hover for demo purposes, normally click) -->
<div class="absolute right-0 top-8 w-48 p-3 bg-slate-800 dark:bg-surface-highlight border border-slate-700 dark:border-border-dark rounded shadow-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
<p class="text-[10px] text-slate-300 leading-snug">
<strong class="text-white block mb-1">Liquidity Event</strong>
                                    Low market depth in Asian trading hours caused transient spikes.
                                </p>
<div class="mt-2 h-0.5 w-full bg-slate-700">
<div class="h-full w-2/3 bg-primary"></div>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Section 5: Historical Drift -->
<section>
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">05 / Comparative Bands</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">COMP-ROW</span>
</div>
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg overflow-hidden">
<div class="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-100 dark:border-border-dark/50 items-center">
<div class="flex flex-col">
<span class="text-xs text-slate-500 dark:text-slate-400">Current Model (v2.4)</span>
<div class="h-1.5 w-24 bg-primary/20 rounded-full mt-1 relative overflow-hidden">
<div class="absolute left-1/4 right-1/4 h-full bg-primary/60 rounded-full"></div>
<div class="absolute left-1/2 w-0.5 h-full bg-primary -translate-x-1/2"></div>
</div>
</div>
<span class="text-xs font-mono text-slate-900 dark:text-white">0.42 <span class="text-slate-500">[±0.05]</span></span>
</div>
<div class="grid grid-cols-[1fr_auto] gap-4 p-3 items-center bg-slate-50/50 dark:bg-surface-highlight/30">
<div class="flex flex-col opacity-75">
<span class="text-xs text-slate-400 dark:text-slate-500">Legacy Model (v2.1)</span>
<div class="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 relative overflow-hidden">
<div class="absolute left-0 right-1/3 h-full bg-slate-400/40 dark:bg-slate-500/40 rounded-full"></div>
<div class="absolute left-1/3 w-0.5 h-full bg-slate-500 dark:bg-slate-400 -translate-x-1/2"></div>
</div>
</div>
<span class="text-xs font-mono text-slate-500 dark:text-slate-400 decoration-slate-400">0.31 <span class="text-slate-600 dark:text-slate-600">[±0.12]</span></span>
</div>
</div>
</section>
<!-- Section 6: Heuristics Warnings -->
<section>
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">06 / Heuristics</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">ALERT-BOX</span>
</div>
<div class="flex items-start gap-3 p-3 bg-orange-50 dark:bg-[#1a1612] border border-orange-200 dark:border-orange-900/40 rounded-lg">
<span class="material-symbols-outlined text-orange-500 dark:text-orange-400 shrink-0" style="font-size: 20px;">warning</span>
<div class="flex flex-col">
<h4 class="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-0.5">Narrowing without Evidence</h4>
<p class="text-xs text-orange-800/80 dark:text-orange-300/80 leading-relaxed">
                            Confidence interval has tightened by 40% despite constant sample size n=240. Check for overfitting.
                        </p>
<div class="mt-2 flex gap-2">
<button class="text-[10px] font-bold text-orange-700 dark:text-orange-400 border-b border-orange-300 dark:border-orange-800 hover:text-orange-900 dark:hover:text-orange-200 transition-colors">REVIEW DATA</button>
<button class="text-[10px] font-bold text-slate-500 dark:text-slate-500 border-b border-transparent hover:text-slate-700 dark:hover:text-slate-300 transition-colors">DISMISS</button>
</div>
</div>
</div>
</section>
<!-- Map Visualization (Abstract) -->
<section class="pb-8">
<div class="flex items-center justify-between mb-2">
<h3 class="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">07 / Spatial Uncertainty</h3>
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-surface-highlight px-1.5 py-0.5 rounded font-mono">MAP-LAYER</span>
</div>
<div class="h-32 w-full rounded-lg bg-surface-dark border border-border-dark overflow-hidden relative">
<div class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" data-alt="Dark global map with interconnected data points" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6nGT6wdG0S6gNhnmwozmNRlsxs431ZhGXd7exliViMCpyjtNzVZdFTEsiAIXvIpEN_todeZKQoV8w7StNy_XRE2FOZ2Yn8x2RQvUuik6dD5wIw38kjssmxtHZZ1yGjqVn4exYleYHIeZUNXoPtkFxRMyqqEWREP1_Ypkt6oqZJy6_kTVFpshxaRZiPGiH-ah6qa2BunKZKbJotj05b4Ha6d23CqOe_6alX5Dr2YJg4EEnudChJVVt8U-WsL6uNdM-SeLKMAbkA1-e');"></div>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
<div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
<div class="flex flex-col">
<span class="text-[10px] text-slate-400 font-mono">LAT: 34.05 | LON: -118.24</span>
<span class="text-xs font-bold text-white">Los Angeles Node</span>
</div>
<span class="flex items-center justify-center size-6 rounded-full bg-primary/20 text-primary border border-primary/40 material-symbols-outlined text-[14px]">my_location</span>
</div>
</div>
</section>
</main>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Uncertainty Band Variations","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Governance & Compliance"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Uncertainty Band Variations","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
