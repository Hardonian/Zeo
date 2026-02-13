1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3b44,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Branch Explorer</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1258e2",
                        "primary-dark": "#0e45b3",
                        "background-light": "#f6f6f8",
                        "background-dark": "#0f172a", // Deep slate for technical look
                        "surface-dark": "#1e293b", // Slightly lighter slate for cards
                        "surface-dark-hover": "#334155",
                        "accent-teal": "#2dd4bf",
                        "accent-rose": "#fb7185",
                        "accent-amber": "#fbbf24",
                        "line-color": "#334155",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "md": "0.375rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for technical look */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0f172a; 
        }
        ::-webkit-scrollbar-thumb {
            background: #334155; 
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569; 
        }

        /* Tree connector lines */
        .tree-line {
            position: absolute;
            left: 20px;
            top: 40px;
            bottom: -20px;
            width: 1px;
            background-color: #334155;
            z-index: 0;
        }
        .tree-line-last {
            display: none;
        }
        .tree-node-connector {
            position: absolute;
            left: -20px;
            top: 24px;
            width: 20px;
            height: 1px;
            background-color: #334155;
        }
        .tree-node-connector-vertical {
            position: absolute;
            left: -21px;
            top: -24px;
            bottom: 24px;
            width: 1px;
            background-color: #334155;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen overflow-x-hidden selection:bg-primary selection:text-white">
<!-- Mobile Container -->
<div class="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark relative shadow-2xl overflow-hidden flex flex-col">
<!-- Top App Bar -->
<header class="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
<div class="flex items-center justify-between px-4 h-16">
<button class="p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-300">arrow_back</span>
</button>
<h1 class="text-lg font-bold tracking-tight flex-1 text-center">Branch Explorer</h1>
<button class="p-2 -mr-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-300">settings</span>
</button>
</div>
<!-- Toolbar / Controls -->
<div class="px-4 pb-4 pt-2 flex flex-col gap-4">
<!-- Depth Control -->
<div class="bg-white dark:bg-surface-dark rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
<div class="flex justify-between items-center mb-2">
<label class="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Tree Depth</label>
<span class="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">LEVEL 3</span>
</div>
<div class="relative h-6 flex items-center">
<div class="absolute w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
<div class="h-full bg-primary w-3/5"></div>
</div>
<input class="w-full absolute opacity-0 cursor-pointer h-full z-10" max="5" min="1" type="range" value="3"/>
<div class="absolute left-[60%] -ml-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md z-0 pointer-events-none"></div>
<!-- Ticks -->
<div class="absolute w-full flex justify-between px-0.5 pointer-events-none top-3">
<span class="w-px h-1 bg-slate-300 dark:bg-slate-600"></span>
<span class="w-px h-1 bg-slate-300 dark:bg-slate-600"></span>
<span class="w-px h-1 bg-slate-300 dark:bg-slate-600"></span>
<span class="w-px h-1 bg-slate-300 dark:bg-slate-600"></span>
<span class="w-px h-1 bg-slate-300 dark:bg-slate-600"></span>
</div>
</div>
</div>
<!-- Toggle -->
<div class="flex items-center justify-between bg-white dark:bg-surface-dark rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
<div class="flex flex-col">
<span class="text-sm font-semibold">Show Dominated Actions</span>
<span class="text-xs text-slate-500 dark:text-slate-400">Reveal sub-optimal paths</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</header>
<!-- Main Tree Content -->
<main class="flex-1 overflow-y-auto px-4 py-6 pb-24 relative">
<!-- Root Node -->
<div class="relative pl-0 mb-6">
<div class="flex items-start gap-3">
<div class="mt-1 flex-shrink-0 z-10">
<div class="h-4 w-4 rounded-sm bg-primary border-2 border-primary flex items-center justify-center shadow-[0_0_10px_rgba(18,88,226,0.5)]">
<span class="material-symbols-outlined text-white text-[10px] font-bold">check</span>
</div>
</div>
<div class="flex-1">
<h2 class="text-lg font-bold leading-tight">Market Entry Strategy</h2>
<div class="mt-1 flex flex-wrap gap-2">
<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">ROOT</span>
</div>
</div>
</div>
<!-- Connector to children -->
<div class="absolute left-[7px] top-6 bottom-[-24px] w-px bg-slate-300 dark:bg-slate-700"></div>
</div>
<!-- Branch A (Active) -->
<div class="relative pl-8 mb-4 group/node">
<!-- Connectors -->
<div class="absolute left-[7px] top-[-24px] bottom-0 w-px bg-slate-300 dark:bg-slate-700"></div>
<div class="absolute left-[7px] top-6 w-5 h-px bg-slate-300 dark:bg-slate-700"></div>
<div class="relative bg-white dark:bg-surface-dark border-l-2 border-l-primary rounded-r-lg shadow-sm overflow-hidden hover:bg-slate-50 dark:hover:bg-surface-dark-hover transition-colors cursor-pointer">
<div class="p-3">
<div class="flex justify-between items-start mb-1">
<span class="font-mono text-xs font-bold text-accent-teal tracking-tight bg-accent-teal/10 px-1.5 py-0.5 rounded-md">[60%-70%]</span>
<span class="material-symbols-outlined text-slate-400 text-lg transform group-hover/node:rotate-90 transition-transform">chevron_right</span>
</div>
<h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Aggressive Expansion</h3>
<!-- Chips -->
<div class="flex flex-wrap gap-1.5">
<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
<span class="w-1.5 h-1.5 rounded-full bg-accent-teal mr-1"></span>Bull Market
                            </span>
<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
<span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"></span>Low Rates
                            </span>
</div>
</div>
</div>
<!-- Children Container (Branch A) -->
<div class="relative pl-4 mt-4 border-l border-slate-300 dark:border-slate-700 ml-3">
<!-- Child A1 -->
<div class="relative pl-4 mb-3">
<div class="absolute left-0 top-3.5 w-3 h-px bg-slate-300 dark:border-slate-700 bg-slate-300 dark:bg-slate-700"></div>
<div class="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-surface-dark-hover transition-colors">
<div class="flex justify-between items-center mb-1">
<span class="font-mono text-xs font-bold text-primary tracking-tight">[80%]</span>
</div>
<h4 class="text-sm font-medium text-slate-700 dark:text-slate-200">Capture 10% Market Share</h4>
</div>
</div>
<!-- Child A2 -->
<div class="relative pl-4">
<div class="absolute left-0 top-3.5 w-3 h-px bg-slate-300 dark:border-slate-700 bg-slate-300 dark:bg-slate-700"></div>
<div class="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg p-3 opacity-60">
<div class="flex justify-between items-center mb-1">
<span class="font-mono text-xs font-bold text-slate-500 tracking-tight">[20%]</span>
</div>
<h4 class="text-sm font-medium text-slate-700 dark:text-slate-200">Stagnation</h4>
</div>
</div>
</div>
</div>
<!-- Branch B (Dominated) -->
<div class="relative pl-8 mb-4 group/node opacity-75">
<!-- Connectors -->
<div class="absolute left-[7px] top-[-24px] bottom-6 w-px bg-slate-300 dark:bg-slate-700"></div>
<div class="absolute left-[7px] top-6 w-5 h-px bg-slate-300 dark:bg-slate-700"></div>
<div class="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden hover:bg-slate-50 dark:hover:bg-surface-dark-hover transition-colors cursor-pointer">
<div class="p-3">
<div class="flex justify-between items-start mb-1">
<span class="font-mono text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight">[30%-40%]</span>
<span class="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
</div>
<h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Defensive Hold</h3>
<!-- Chips -->
<div class="flex flex-wrap gap-1.5">
<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
<span class="w-1.5 h-1.5 rounded-full bg-accent-rose mr-1"></span>Recession Risk
                            </span>
</div>
</div>
</div>
</div>
<!-- Branch C (Hidden/Dominated) -->
<div class="relative pl-8 mb-4 group/node opacity-50 border-l border-dashed border-slate-300 dark:border-slate-700 ml-2 pl-6">
<div class="absolute -left-[1px] top-6 w-4 h-px border-t border-dashed border-slate-300 dark:border-slate-700"></div>
<div class="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 border-dashed rounded-lg p-2.5">
<div class="flex justify-between items-center">
<span class="text-xs text-slate-400 italic">Dominated Path: Exit Strategy</span>
<span class="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded">ROI &lt; 2%</span>
</div>
</div>
</div>
</main>
<!-- Node Detail Overlay (Simulated Bottom Sheet) -->
<div class="absolute bottom-0 w-full bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] transform transition-transform duration-300 translate-y-full peer-checked:translate-y-0 z-40">
<div class="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1"></div>
<div class="p-5 pb-8">
<div class="flex items-center gap-2 mb-4">
<div class="p-1.5 bg-accent-teal/10 rounded-md">
<span class="material-symbols-outlined text-accent-teal text-xl">trending_up</span>
</div>
<div>
<h3 class="text-base font-bold leading-none">Aggressive Expansion</h3>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">ID: node_284a</p>
</div>
</div>
<div class="grid grid-cols-2 gap-3 mb-4">
<div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
<p class="text-[10px] uppercase text-slate-500 font-bold mb-1">Probability</p>
<p class="font-mono text-lg font-bold text-slate-800 dark:text-slate-200">65% <span class="text-xs font-normal text-slate-400">avg</span></p>
</div>
<div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
<p class="text-[10px] uppercase text-slate-500 font-bold mb-1">Expected Value</p>
<p class="font-mono text-lg font-bold text-primary">$2.4M</p>
</div>
</div>
<button class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
<span class="material-symbols-outlined text-lg">play_arrow</span>
                    Simulate This Path
                </button>
</div>
</div>
<!-- Floating Action Button for Quick Add -->
<button class="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:bg-primary-dark transition-colors z-30">
<span class="material-symbols-outlined text-2xl">add_road</span>
</button>
<!-- Decorative gradient overlay for bottom fade -->
<div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none z-20"></div>
</div>
<script>
        // Simple JS to toggle theme for demonstration purposes 
        // In a real React app this would be state management
        // but user requested "No JS" for functionality, this is just for preview if needed.
        // The tailwind config handles class="dark" on HTML.
    </script>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Branch Explorer Panel"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Decision Intelligence"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Branch Explorer Panel","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
