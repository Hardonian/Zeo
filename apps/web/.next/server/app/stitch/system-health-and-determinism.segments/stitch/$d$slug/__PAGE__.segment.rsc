1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T2828,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>System Health &amp; Determinism</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#13a4ec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                        "surface-dark": "#1c2327",
                        "surface-darker": "#111618",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
            font-family: "Space Grotesk", sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display overflow-x-hidden">
<div class="relative flex flex-col w-full max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<!-- Top App Bar -->
<header class="flex items-center justify-between p-4 sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
<div class="flex items-center gap-4">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div class="flex flex-col">
<h2 class="text-lg font-bold leading-tight tracking-tight">System Health</h2>
<span class="text-xs font-medium text-emerald-500 flex items-center gap-1">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
</span>
                        Systems Nominal
                    </span>
</div>
</div>
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined">more_vert</span>
</button>
</header>
<main class="flex-1 flex flex-col p-4 gap-6">
<!-- Determinism Status Card (Hero) -->
<section class="flex flex-col gap-3">
<h1 class="text-2xl font-bold tracking-tight px-1">Determinism Status</h1>
<div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-200 dark:border-gray-800">
<!-- Status Image / Visualization -->
<div class="relative h-48 w-full overflow-hidden bg-slate-900">
<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
<div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&amp;w=2070&amp;auto=format&amp;fit=crop')] bg-cover bg-center opacity-60" data-alt="Abstract digital network visualization showing secure connections"></div>
<!-- Status Badge Overlay -->
<div class="absolute top-4 right-4 z-20">
<div class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg">
<span class="material-symbols-outlined text-sm">verified_user</span>
                                Deterministic
                            </div>
</div>
<div class="absolute bottom-4 left-4 z-20 text-white">
<p class="text-xs font-medium text-slate-300 mb-1">CURRENT STATE</p>
<div class="flex items-center gap-2">
<h3 class="text-xl font-bold">Safe Mode Active</h3>
</div>
</div>
</div>
<!-- Card Body -->
<div class="p-5 flex flex-col gap-4">
<p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            The trading engine is operating with full determinism. Randomness seeds are locked and verify against the build hash.
                        </p>
<div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
<div class="flex flex-col">
<span class="text-xs text-slate-500 dark:text-slate-500 uppercase font-semibold">Uptime</span>
<span class="text-sm font-bold text-slate-900 dark:text-white">14d 2h 12m</span>
</div>
<button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-sky-400 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-primary/20">
<span class="material-symbols-outlined text-[18px]">article</span>
                                View Logs
                            </button>
</div>
</div>
</div>
</section>
<!-- Configuration Grid -->
<section class="flex flex-col gap-3">
<h2 class="text-lg font-bold tracking-tight px-1 text-slate-900 dark:text-white">Configuration</h2>
<div class="grid grid-cols-2 gap-3">
<!-- Seed Card -->
<div class="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
<div class="flex items-center justify-between">
<span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Current Seed</span>
<span class="material-symbols-outlined text-primary text-lg">casino</span>
</div>
<div class="flex items-end gap-2 mt-1">
<span class="text-xl font-bold tracking-tight font-mono text-slate-900 dark:text-white">0x8F92A1</span>
</div>
<div class="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
</div>
<!-- Build Hash Card -->
<div class="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-transform">
<div class="flex items-center justify-between">
<span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Build Hash</span>
<span class="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-lg">content_copy</span>
</div>
<div class="flex items-end gap-2 mt-1">
<span class="text-xl font-bold tracking-tight font-mono text-slate-900 dark:text-white">a1b2c3d</span>
</div>
<div class="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
</div>
</div>
</section>
<!-- Eval Suite Status -->
<section class="flex flex-col gap-3">
<div class="flex items-center justify-between px-1">
<h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Eval Suite Status</h2>
<span class="text-sm font-bold text-emerald-500">98% Passed</span>
</div>
<div class="p-5 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm">
<div class="flex justify-between text-xs mb-2 text-slate-500 dark:text-slate-400">
<span>Progress</span>
<span>490/500 Tests</span>
</div>
<div class="relative w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" style="width: 98%"></div>
</div>
<div class="mt-4 flex flex-col gap-2">
<div class="flex items-center justify-between text-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
<span class="text-slate-700 dark:text-slate-300">Core Logic</span>
</div>
<span class="text-emerald-500 font-mono text-xs">PASS</span>
</div>
<div class="flex items-center justify-between text-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
<span class="text-slate-700 dark:text-slate-300">Risk Limits</span>
</div>
<span class="text-emerald-500 font-mono text-xs">PASS</span>
</div>
<div class="flex items-center justify-between text-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
<span class="text-slate-700 dark:text-slate-300">Latency Checks</span>
</div>
<span class="text-amber-500 font-mono text-xs">WARN</span>
</div>
</div>
<button class="w-full mt-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        Run Diagnostics
                    </button>
</div>
</section>
<!-- Last Green CI Run -->
<section class="mb-4">
<div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
<div class="mt-0.5 p-1.5 bg-emerald-500/20 rounded-full text-emerald-500">
<span class="material-symbols-outlined text-lg">history</span>
</div>
<div class="flex flex-col">
<span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-0.5">Last Green CI Run</span>
<span class="text-sm font-bold text-slate-900 dark:text-white">Oct 27, 2023 at 14:05 UTC</span>
<span class="text-xs text-slate-500 dark:text-slate-400 mt-1">Version v2.4.1-stable</span>
</div>
</div>
</section>
<!-- Bottom Spacer for better scrolling on mobile -->
<div class="h-6"></div>
</main>
</div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"System Health & Determinism"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"System Health & Determinism","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
