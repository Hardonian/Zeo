1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T32a6,<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Runner List with Health Badges</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#2563EB", // Blue for technical/developer tools
                        "background-light": "#F9FAFB", // Very light gray
                        "background-dark": "#0D1117", // Github-like dark
                        "surface-light": "#FFFFFF",
                        "surface-dark": "#161B22",
                        "border-light": "#E5E7EB",
                        "border-dark": "#30363D",
                        "text-primary-light": "#111827",
                        "text-primary-dark": "#C9D1D9",
                        "text-secondary-light": "#6B7280",
                        "text-secondary-dark": "#8B949E",
                    },
                    fontFamily: {
                        display: ["Inter", "sans-serif"],
                        mono: ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {
                        DEFAULT: "0.375rem",
                    },
                },
            },
        };
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark min-h-screen antialiased flex flex-col">
<header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between">
<div class="flex items-center space-x-3">
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark cursor-pointer">menu</span>
<div class="flex flex-col">
<h1 class="text-sm font-semibold tracking-tight">ControlPlane</h1>
<span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">Runners / Overview</span>
</div>
</div>
<div class="flex items-center space-x-4">
<button class="relative">
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
</button>
<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                HD
            </div>
</div>
</header>
<main class="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
<div class="mb-6 space-y-3">
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark text-lg">search</span>
<input class="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-DEFAULT py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder-text-secondary-light dark:placeholder-text-secondary-dark" placeholder="Filter runners..." type="text"/>
</div>
<div class="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
<span>Showing 5 active runners</span>
<button class="flex items-center space-x-1 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">filter_list</span>
<span>Sort by Status</span>
</button>
</div>
</div>
<ul class="space-y-3">
<li class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-DEFAULT p-4 shadow-sm hover:border-primary/50 transition-colors group relative cursor-pointer">
<div class="flex items-start justify-between">
<div class="flex items-start space-x-3">
<div class="mt-1 flex-shrink-0">
<div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
</div>
<div>
<h3 class="font-mono text-sm font-semibold flex items-center">
                                TruthCore
                                <span class="ml-2 px-1.5 py-0.5 bg-background-light dark:bg-border-dark text-[10px] rounded text-text-secondary-light dark:text-text-secondary-dark font-normal">v2.4.1</span>
</h3>
<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
                                99.9% uptime · 42ms latency
                            </p>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
</div>
</li>
<li class="bg-surface-light dark:bg-surface-dark border border-yellow-500/50 dark:border-yellow-500/40 rounded-DEFAULT p-4 shadow-md relative cursor-pointer">
<div class="flex items-start justify-between">
<div class="flex items-start space-x-3">
<div class="mt-1 flex-shrink-0 relative group/badge">
<div class="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse"></div>
<div class="absolute left-0 top-6 z-10 w-48 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md shadow-lg p-2 border border-gray-700 dark:border-gray-600 animate-in fade-in zoom-in duration-200 origin-top-left">
<div class="flex flex-col space-y-1">
<div class="flex items-center space-x-1 text-red-300">
<span class="material-symbols-outlined text-[10px]">warning</span>
<span class="font-semibold">Degraded: DB-Sync</span>
</div>
<span class="text-gray-400">Last failure: 2m ago</span>
<div class="h-px bg-gray-700 my-1"></div>
<span class="text-[10px] text-gray-500 font-mono">Retry pending (15s)</span>
</div>
<div class="absolute -top-1 left-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-t border-l border-gray-700 dark:border-gray-600 transform rotate-45"></div>
</div>
</div>
<div>
<h3 class="font-mono text-sm font-semibold flex items-center">
                                JobForge
                                <span class="ml-2 px-1.5 py-0.5 bg-background-light dark:bg-border-dark text-[10px] rounded text-text-secondary-light dark:text-text-secondary-dark font-normal">v3.0.0-rc</span>
</h3>
<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
<span class="text-yellow-600 dark:text-yellow-400">High Load (89%)</span> · 12 active jobs
                            </p>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg">expand_more</span>
</div>
<div class="mt-3 pt-3 border-t border-border-light dark:border-border-dark grid grid-cols-3 gap-2 text-center">
<div class="flex flex-col">
<span class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">CPU</span>
<span class="text-sm font-mono font-medium">85%</span>
</div>
<div class="flex flex-col border-l border-border-light dark:border-border-dark">
<span class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Mem</span>
<span class="text-sm font-mono font-medium">1.2GB</span>
</div>
<div class="flex flex-col border-l border-border-light dark:border-border-dark">
<span class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Queue</span>
<span class="text-sm font-mono font-medium text-yellow-600 dark:text-yellow-400">420</span>
</div>
</div>
</li>
<li class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-DEFAULT p-4 shadow-sm hover:border-red-500/50 transition-colors group cursor-pointer">
<div class="flex items-start justify-between">
<div class="flex items-start space-x-3">
<div class="mt-1 flex-shrink-0">
<div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
</div>
<div>
<h3 class="font-mono text-sm font-semibold flex items-center">
                                Autopilot-Suite
                            </h3>
<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
<span class="text-red-600 dark:text-red-400 font-medium">Connection Refused</span> · 5m ago
                            </p>
</div>
</div>
<div class="flex space-x-2">
<button class="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium">
                            Restart
                        </button>
</div>
</div>
</li>
<li class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-DEFAULT p-4 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer">
<div class="flex items-start justify-between">
<div class="flex items-start space-x-3">
<div class="mt-1 flex-shrink-0">
<div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
</div>
<div>
<h3 class="font-mono text-sm font-semibold flex items-center">
                                Ops-Autopilot
                                <span class="ml-2 px-1.5 py-0.5 bg-background-light dark:bg-border-dark text-[10px] rounded text-text-secondary-light dark:text-text-secondary-dark font-normal">v1.2.0</span>
</h3>
<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
                                Idle · Last run 1h ago
                            </p>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
</div>
</li>
<li class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-DEFAULT p-4 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer opacity-75">
<div class="flex items-start justify-between">
<div class="flex items-start space-x-3">
<div class="mt-1 flex-shrink-0">
<div class="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
</div>
<div>
<h3 class="font-mono text-sm font-semibold flex items-center text-text-secondary-light dark:text-text-secondary-dark">
                                Growth-Autopilot
                            </h3>
<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
                                Maintenance Mode
                            </p>
</div>
</div>
<span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark text-[10px] rounded border border-gray-200 dark:border-gray-700">Paused</span>
</div>
</li>
</ul>
</main>
<nav class="sticky bottom-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark pb-6 pt-3 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none z-50">
<div class="flex justify-between items-center text-xs font-medium">
<a class="flex flex-col items-center space-y-1 text-primary" href="#">
<span class="material-symbols-outlined">dns</span>
<span>Runners</span>
</a>
<a class="flex flex-col items-center space-y-1 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined">terminal</span>
<span>Logs</span>
</a>
<div class="relative -top-5">
<button class="bg-primary hover:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all transform active:scale-95">
<span class="material-symbols-outlined">add</span>
</button>
</div>
<a class="flex flex-col items-center space-y-1 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined">hub</span>
<span>Topology</span>
</a>
<a class="flex flex-col items-center space-y-1 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined">settings</span>
<span>Settings</span>
</a>
</div>
</nav>
<div class="bg-border-light dark:bg-border-dark py-1 px-4 text-center">
<p class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-mono">
            ControlPlane System Status: <span class="text-emerald-600 dark:text-emerald-400 font-bold">Operational</span>
</p>
</div>

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Runner List With Health Badges"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Monitoring"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Runner List With Health Badges","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
