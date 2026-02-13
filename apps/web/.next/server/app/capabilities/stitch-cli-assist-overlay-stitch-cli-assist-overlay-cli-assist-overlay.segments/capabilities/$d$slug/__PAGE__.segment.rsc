1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2937,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CLI Assist Overlay</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#1A2332",
                        "warning": "#F59E0B",
                        "error": "#EF4444",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
                        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        /* Custom scrollbar for terminal feel */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #101622;
        }
        ::-webkit-scrollbar-thumb {
            background: #232f48;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #334155;
        }
        
        .glass-panel {
            background: rgba(16, 22, 34, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden selection:bg-primary/30">
<!-- Main Container - Mobile Form Factor Simulation -->
<div class="relative flex flex-col h-screen w-full max-w-md mx-auto bg-background-dark border-x border-white/5 shadow-2xl">
<!-- Status Header -->
<header class="flex-none p-4 pt-6 bg-background-dark border-b border-white/5 z-20">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<span class="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
<span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Interactive Session</span>
</div>
<div class="px-2 py-0.5 rounded bg-white/5 border border-white/10">
<span class="text-[10px] font-mono text-slate-400">v2.4.0</span>
</div>
</div>
<div class="flex items-center justify-between">
<h1 class="text-xl font-bold tracking-tight text-white font-mono break-all line-clamp-1 pr-2">
<span class="text-primary mr-1">&gt;</span>./run_patch.sh
                </h1>
<button class="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
<span class="material-symbols-outlined">pause_circle</span>
</button>
</div>
</header>
<!-- Scrollable Content -->
<main class="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 pb-32">
<!-- Context Block -->
<div class="bg-surface-dark rounded-lg p-3 border border-white/5 flex items-start gap-3">
<span class="material-symbols-outlined text-primary mt-0.5 text-[20px]">terminal</span>
<div>
<p class="text-sm text-slate-400 leading-snug">
                        Executing maintenance script for cluster re-indexing.
                    </p>
</div>
</div>
<!-- WARNINGS Section -->
<section class="space-y-3">
<h2 class="text-xs font-bold tracking-widest text-slate-500 uppercase px-1 flex items-center gap-2">
                    Warnings <span class="bg-warning/20 text-warning text-[10px] px-1.5 py-0.5 rounded-sm">2</span>
</h2>
<!-- Warning Item 1 -->
<div class="group relative overflow-hidden rounded-lg bg-warning/5 border border-warning/20 p-4 transition-all hover:bg-warning/10">
<div class="absolute top-0 left-0 w-1 h-full bg-warning"></div>
<div class="flex items-start gap-3">
<span class="material-symbols-outlined text-warning shrink-0">warning</span>
<div class="flex-1 min-w-0">
<h3 class="text-warning font-bold text-sm mb-1">Production Target</h3>
<p class="text-warning/80 text-sm leading-relaxed truncate">Targeting <span class="font-mono bg-warning/10 px-1 rounded">production-cluster-01</span></p>
</div>
<span class="material-symbols-outlined text-warning/50 text-[20px]">chevron_right</span>
</div>
</div>
<!-- Warning Item 2 -->
<div class="group relative overflow-hidden rounded-lg bg-warning/5 border border-warning/20 p-4 transition-all hover:bg-warning/10">
<div class="absolute top-0 left-0 w-1 h-full bg-warning"></div>
<div class="flex items-start gap-3">
<span class="material-symbols-outlined text-warning shrink-0">shield_person</span> <!-- Material symbol replacement for ShieldWarning -->
<div class="flex-1 min-w-0">
<h3 class="text-warning font-bold text-sm mb-1">Elevated Privileges</h3>
<p class="text-warning/80 text-sm leading-relaxed">Root access detected in active session</p>
</div>
</div>
</div>
</section>
<!-- MISSING INPUTS Section -->
<section class="space-y-3">
<h2 class="text-xs font-bold tracking-widest text-slate-500 uppercase px-1 flex items-center gap-2">
                    Missing Inputs <span class="bg-error/20 text-error text-[10px] px-1.5 py-0.5 rounded-sm">2</span>
</h2>
<div class="bg-background-dark rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
<!-- Missing Input 1 -->
<div class="p-4 flex items-center gap-3 bg-error/5 hover:bg-error/10 transition-colors cursor-pointer">
<div class="h-5 w-5 rounded border-2 border-error/50 flex items-center justify-center shrink-0">
<!-- Unchecked state -->
</div>
<div class="flex-1">
<p class="text-error font-mono text-sm font-bold">env: SECRET_TOKEN</p>
<p class="text-slate-400 text-xs mt-0.5">Variable is currently unset</p>
</div>
<button class="text-primary text-xs font-bold uppercase tracking-wider hover:text-primary/80 px-2 py-1 rounded hover:bg-white/5">
                            Set
                        </button>
</div>
<!-- Missing Input 2 -->
<div class="p-4 flex items-center gap-3 bg-error/5 hover:bg-error/10 transition-colors cursor-pointer">
<div class="h-5 w-5 rounded border-2 border-error/50 flex items-center justify-center shrink-0">
<!-- Unchecked state -->
</div>
<div class="flex-1">
<p class="text-error font-mono text-sm font-bold">arg: --region</p>
<p class="text-slate-400 text-xs mt-0.5">Required argument missing</p>
</div>
<div class="relative group/input">
<span class="text-slate-500 text-xs italic group-hover/input:hidden">us-east-1</span>
<span class="material-symbols-outlined text-slate-500 text-[18px] group-hover/input:text-white">edit</span>
</div>
</div>
</div>
</section>
<!-- SUGGESTED FLAGS Section -->
<section class="space-y-3">
<h2 class="text-xs font-bold tracking-widest text-slate-500 uppercase px-1">Suggested Flags</h2>
<div class="flex flex-wrap gap-2">
<button class="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95">
<span class="material-symbols-outlined text-slate-400 text-[18px] group-hover:text-primary">add</span>
<span class="font-mono text-sm text-slate-300 group-hover:text-white">--dry-run</span>
</button>
<button class="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95">
<span class="material-symbols-outlined text-slate-400 text-[18px] group-hover:text-primary">add</span>
<span class="font-mono text-sm text-slate-300 group-hover:text-white">--verbose</span>
</button>
<button class="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95">
<span class="material-symbols-outlined text-slate-400 text-[18px] group-hover:text-primary">add</span>
<span class="font-mono text-sm text-slate-300 group-hover:text-white">--force</span>
</button>
<button class="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95 opacity-50">
<span class="material-symbols-outlined text-slate-500 text-[18px]">lock</span>
<span class="font-mono text-sm text-slate-500">--sudo</span>
</button>
</div>
</section>
</main>
<!-- Sticky Footer - Command Preview -->
<footer class="absolute bottom-0 left-0 right-0 bg-surface-dark border-t border-white/10 p-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)] z-30 rounded-t-2xl">
<div class="mb-3">
<div class="flex justify-between items-end mb-2">
<span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Constructed Command</span>
<button class="text-[10px] text-primary hover:text-primary/80 underline decoration-dotted">Edit Raw</button>
</div>
<div class="bg-background-dark p-3 rounded-lg border border-white/5 font-mono text-sm text-slate-300 break-all relative group">
<span class="text-primary select-none">$ </span>./run_production_patch.sh --region=us-east-1<span class="inline-block w-2 h-4 bg-primary/50 align-middle ml-1 animate-pulse"></span>
</div>
</div>
<button class="w-full h-12 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-bold text-base tracking-wide shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all">
<span class="material-symbols-outlined">terminal</span>
                RUN COMMAND
            </button>
</footer>
</div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Cli Assist Overlay"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"CLI & Automation"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Cli Assist Overlay","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
