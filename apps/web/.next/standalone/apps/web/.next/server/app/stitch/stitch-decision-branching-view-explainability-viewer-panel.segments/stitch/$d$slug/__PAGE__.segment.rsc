1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2a7c,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Explainability Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#1a2333", // Slightly lighter than background-dark for cards
                        "surface-light": "#ffffff", // White for cards in light mode
                        "border-dark": "#2a3649",
                        "border-light": "#e2e4e9",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for code blocks */
        .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #3f4c63;
            border-radius: 20px;
        }
        
        /* Details summary marker hidden */
        details > summary {
            list-style: none;
        }
        details > summary::-webkit-details-marker {
            display: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-gray-900 dark:text-gray-100 min-h-screen flex flex-col overflow-hidden">
<!-- Top App Bar -->
<header class="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-border-light dark:border-border-dark shrink-0">
<div class="size-10 flex items-center justify-center opacity-0 pointer-events-none">
<!-- Placeholder for balance -->
</div>
<h1 class="text-base font-semibold tracking-tight">Explainability Viewer</h1>
<button class="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined !text-[24px]">close</span>
</button>
</header>
<!-- Scrollable Content Area -->
<main class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24">
<!-- Narrative Section -->
<section class="p-5">
<h2 class="text-xl font-bold tracking-tight mb-3 text-gray-900 dark:text-white">Decision Logic</h2>
<div class="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
<p>
                    Based on the input parameters, <span class="font-semibold text-primary">Model v4.2</span> prioritized <span class="font-medium text-gray-900 dark:text-white">revenue stability</span> over growth velocity. The confidence interval is <span class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-xs font-mono font-medium">94%</span> due to strong historical correlation in Q3.
                </p>
<p>
                    The logic tree identified that reduced volatility in supply chain inputs outweighs the potential 15% upside from aggressive expansion strategies. This decision path aligns with the "Conservative Growth" profile selected in user settings.
                </p>
</div>
</section>
<!-- Deep Dive Data Section -->
<section class="px-5 pb-5">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined !text-[20px] text-primary">terminal</span>
<h3 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Deep Dive Data</h3>
</div>
<div class="flex flex-col gap-3">
<!-- Accordion 1: Assumptions Used -->
<details class="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden transition-all duration-300" open="">
<summary class="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors select-none">
<span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Assumptions Used</span>
<span class="material-symbols-outlined text-gray-400 transition-transform duration-300 group-open:rotate-180">expand_more</span>
</summary>
<div class="px-4 pb-4 pt-0">
<div class="relative mt-2 rounded-lg bg-gray-50 dark:bg-[#0d1117] border border-border-light dark:border-border-dark overflow-hidden">
<div class="absolute right-2 top-2">
<button class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-primary transition-colors" title="Copy JSON">
<span class="material-symbols-outlined !text-[16px]">content_copy</span>
</button>
</div>
<pre class="font-mono text-xs text-gray-700 dark:text-gray-300 p-4 overflow-x-auto custom-scrollbar">{
  <span class="text-purple-600 dark:text-purple-400">"risk_tolerance"</span>: <span class="text-green-600 dark:text-green-400">"low"</span>,
  <span class="text-purple-600 dark:text-purple-400">"inflation_adj"</span>: <span class="text-blue-600 dark:text-blue-400">true</span>,
  <span class="text-purple-600 dark:text-purple-400">"weights"</span>: [
    0.4,
    0.1,
    0.5
  ],
  <span class="text-purple-600 dark:text-purple-400">"model_id"</span>: <span class="text-green-600 dark:text-green-400">"v4.2-stable"</span>
}</pre>
</div>
</div>
</details>
<!-- Accordion 2: Dominant Branches -->
<details class="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden transition-all duration-300">
<summary class="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors select-none">
<div class="flex items-center gap-2">
<span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Dominant Branches</span>
<span class="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Top 1</span>
</div>
<span class="material-symbols-outlined text-gray-400 transition-transform duration-300 group-open:rotate-180">expand_more</span>
</summary>
<div class="px-4 pb-4 pt-0">
<div class="relative mt-2 rounded-lg bg-gray-50 dark:bg-[#0d1117] border border-border-light dark:border-border-dark overflow-hidden">
<div class="absolute right-2 top-2">
<button class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-primary transition-colors" title="Copy JSON">
<span class="material-symbols-outlined !text-[16px]">content_copy</span>
</button>
</div>
<pre class="font-mono text-xs text-gray-700 dark:text-gray-300 p-4 overflow-x-auto custom-scrollbar">{
  <span class="text-purple-600 dark:text-purple-400">"path_id"</span>: <span class="text-green-600 dark:text-green-400">"b-209"</span>,
  <span class="text-purple-600 dark:text-purple-400">"robustness_score"</span>: <span class="text-blue-600 dark:text-blue-400">0.98</span>,
  <span class="text-purple-600 dark:text-purple-400">"features"</span>: [
    <span class="text-green-600 dark:text-green-400">"revenue_stability"</span>,
    <span class="text-green-600 dark:text-green-400">"supply_chain_idx"</span>
  ]
}</pre>
</div>
</div>
</details>
<!-- Accordion 3: Next-best Evidence -->
<details class="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden transition-all duration-300">
<summary class="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors select-none">
<span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Next-best Evidence</span>
<span class="material-symbols-outlined text-gray-400 transition-transform duration-300 group-open:rotate-180">expand_more</span>
</summary>
<div class="px-4 pb-4 pt-0">
<div class="relative mt-2 rounded-lg bg-gray-50 dark:bg-[#0d1117] border border-border-light dark:border-border-dark overflow-hidden">
<div class="absolute right-2 top-2">
<button class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-primary transition-colors" title="Copy JSON">
<span class="material-symbols-outlined !text-[16px]">content_copy</span>
</button>
</div>
<pre class="font-mono text-xs text-gray-700 dark:text-gray-300 p-4 overflow-x-auto custom-scrollbar">{
  <span class="text-purple-600 dark:text-purple-400">"suggested_query"</span>: <span class="text-green-600 dark:text-green-400">"competitor_pricing_q4"</span>,
  <span class="text-purple-600 dark:text-purple-400">"uncertainty_reduction"</span>: <span class="text-green-600 dark:text-green-400">"12%"</span>,
  <span class="text-purple-600 dark:text-purple-400">"cost_estimate"</span>: <span class="text-green-600 dark:text-green-400">"low"</span>
}</pre>
</div>
</div>
</details>
</div>
</section>
<!-- Divider -->
<div class="mx-5 h-px bg-border-light dark:bg-border-dark mb-5"></div>
<!-- Metadata Footer -->
<div class="px-5 pb-8 text-center">
<p class="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Generated by Zeo Engine</p>
<p class="text-xs text-gray-500 font-mono">Session ID: 8f92a-2039x-22</p>
</div>
</main>
<!-- Sticky Footer Action -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark z-20 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
<button class="w-full flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined !text-[20px]">ios_share</span>
            Export Analysis
        </button>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Explainability Viewer Panel","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Explainability Viewer Panel","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
