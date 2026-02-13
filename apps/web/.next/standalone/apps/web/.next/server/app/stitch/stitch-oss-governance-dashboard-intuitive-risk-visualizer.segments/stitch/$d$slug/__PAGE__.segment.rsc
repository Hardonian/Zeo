1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T27ab,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Intuitive Risk Visualizer</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "primary-dark": "#0b5bb0",
                        "accent-gold": "#FFD700",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#1c242c",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col items-center">
<div class="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
<!-- Header -->
<header class="flex items-center justify-between p-4 pt-6 bg-background-light dark:bg-background-dark sticky top-0 z-10">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
</button>
<h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Risk Visualizer</h1>
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white">ios_share</span>
</button>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide">
<!-- Data Source Selector -->
<div class="mb-6 mt-2">
<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Data Source</label>
<div class="relative">
<select class="w-full bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 pr-10 appearance-none text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer shadow-sm">
<option>Q3 Governance Audit</option>
<option>Q4 Compliance Review</option>
<option>Annual Risk Assessment</option>
</select>
<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
<span class="material-symbols-outlined">expand_more</span>
</div>
</div>
</div>
<!-- Natural Language Summary Card -->
<section class="mb-6">
<div class="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent border border-primary/20 rounded-xl p-5 shadow-sm">
<div class="flex items-center gap-2 mb-3">
<span class="material-symbols-outlined text-primary text-[20px] fill-1">auto_awesome</span>
<h2 class="text-xs font-bold text-primary uppercase tracking-wider">Summary Insight</h2>
</div>
<p class="text-xl md:text-2xl font-bold leading-snug text-slate-800 dark:text-slate-100">
                        The data suggests a likely trend toward <span class="text-primary">Stability</span>, with a <span class="text-accent-gold/90 dark:text-accent-gold">15%</span> margin for error.
                    </p>
<div class="mt-4 flex items-center gap-2">
<div class="h-1.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
<div class="h-full bg-primary w-[85%] rounded-full"></div>
</div>
<span class="text-xs font-medium text-slate-500 dark:text-slate-400">85% Confidence</span>
</div>
</div>
</section>
<!-- Risk Compass Widget -->
<section class="mb-6">
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Outcome Trajectory</h3>
<button class="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500">
<span class="material-symbols-outlined text-[20px]">info</span>
</button>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative min-h-[280px]">
<!-- Compass Background Visual -->
<div class="relative w-48 h-48 rounded-full border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center">
<!-- Quadrant Lines -->
<div class="absolute w-full h-[1px] bg-slate-200 dark:bg-slate-700"></div>
<div class="absolute h-full w-[1px] bg-slate-200 dark:bg-slate-700"></div>
<!-- Axis Labels -->
<span class="absolute -top-7 text-xs font-bold text-emerald-500 uppercase tracking-widest">Upside</span>
<span class="absolute -bottom-7 text-xs font-bold text-rose-500 uppercase tracking-widest">Downside</span>
<span class="absolute -left-10 text-xs font-bold text-slate-400 uppercase tracking-widest">Risk</span>
<span class="absolute -right-12 text-xs font-bold text-slate-400 uppercase tracking-widest">Safe</span>
<!-- Inner Circles -->
<div class="absolute w-32 h-32 rounded-full border border-slate-100 dark:border-slate-700 border-dashed"></div>
<div class="absolute w-16 h-16 rounded-full border border-slate-100 dark:border-slate-700"></div>
<!-- Needle/Indicator -->
<!-- Rotated to point NE (approx 45deg) for Stability/Upside -->
<div class="absolute w-1 h-24 bg-gradient-to-t from-primary to-transparent origin-bottom rotate-45 bottom-1/2 translate-y-[50%] z-10 flex flex-col justify-start items-center">
<div class="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(19,127,236,0.6)] -mt-1.5"></div>
</div>
<!-- Center Pivot -->
<div class="absolute w-4 h-4 bg-slate-900 dark:bg-white rounded-full z-20 border-2 border-surface-light dark:border-surface-dark"></div>
</div>
<div class="mt-8 text-center">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Positive Outlook
                        </span>
</div>
</div>
</section>
<!-- Certainty Heatmap -->
<section class="mb-4">
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Certainty Heatmap</h3>
<div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span> Low</span>
<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-accent-gold"></span> High</span>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800">
<div class="grid grid-cols-6 gap-1.5 aspect-[16/9] w-full">
<!-- Simulated Heatmap Grid -->
<!-- Using opacity to simulate density, color shift from Primary (blue) to Gold -->
<!-- Row 1 -->
<div class="rounded bg-primary/20"></div>
<div class="rounded bg-primary/30"></div>
<div class="rounded bg-primary/40"></div>
<div class="rounded bg-primary/30"></div>
<div class="rounded bg-primary/10"></div>
<div class="rounded bg-primary/5"></div>
<!-- Row 2 -->
<div class="rounded bg-primary/30"></div>
<div class="rounded bg-gradient-to-br from-primary to-accent-gold opacity-60"></div>
<div class="rounded bg-accent-gold/80"></div>
<div class="rounded bg-accent-gold"></div>
<div class="rounded bg-primary/40"></div>
<div class="rounded bg-primary/10"></div>
<!-- Row 3 -->
<div class="rounded bg-primary/20"></div>
<div class="rounded bg-accent-gold/70"></div>
<div class="rounded bg-accent-gold shadow-[0_0_10px_rgba(255,215,0,0.3)] ring-1 ring-white/20"></div>
<div class="rounded bg-accent-gold/90"></div>
<div class="rounded bg-primary/50"></div>
<div class="rounded bg-primary/20"></div>
<!-- Row 4 -->
<div class="rounded bg-primary/10"></div>
<div class="rounded bg-primary/40"></div>
<div class="rounded bg-accent-gold/60"></div>
<div class="rounded bg-primary/60"></div>
<div class="rounded bg-primary/30"></div>
<div class="rounded bg-primary/10"></div>
</div>
<div class="mt-4 flex justify-between items-center">
<p class="text-sm text-slate-500 dark:text-slate-400">
                            High density observed in <span class="text-slate-900 dark:text-white font-semibold">Zone B (Compliance)</span>
</p>
<button class="text-primary text-sm font-semibold hover:underline">View Detail</button>
</div>
</div>
</section>
</main>
<!-- Bottom Navigation / Action Bar -->
<div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-20">
<button class="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-14 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 font-bold text-base transition-transform active:scale-[0.98]">
<span class="material-symbols-outlined">download</span>
                Export Full Report
            </button>
</div>
<!-- Gradient Overlay for Scroll Bottom -->
<div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none z-10"></div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Intuitive Risk Visualizer","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Governance & Compliance"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Intuitive Risk Visualizer","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
