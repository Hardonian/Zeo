1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T4578,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Signals Strip</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
                        "background-dark": "#0f172a", // Deep Slate/Navy as requested
                        "surface-dark": "#1e293b", // Slightly lighter for cards
                        "surface-border": "#334155", 
                        "success": "#10b981",
                        "warning": "#f59e0b",
                        "danger": "#ef4444",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for horizontal scrolling areas */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        .pulse-dot {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            animation: pulse-green 2s infinite;
        }

        @keyframes pulse-green {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            }
            70% {
                transform: scale(1);
                box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
            }
            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
            }
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased selection:bg-primary/30">
<!-- App Container -->
<div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl">
<!-- Header -->
<header class="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/90 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl tracking-tighter shadow-lg shadow-primary/20">
                    Z
                </div>
<h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Zeo</h2>
</div>
<div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-full px-3 py-1 border border-slate-200 dark:border-slate-700">
<div class="h-2 w-2 rounded-full bg-success pulse-dot"></div>
<span class="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Live</span>
</div>
</header>
<!-- Filter Strip -->
<div class="sticky top-[60px] z-30 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
<div class="flex gap-2 p-3 overflow-x-auto hide-scrollbar items-center">
<!-- Active Filter -->
<button class="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-primary text-white pl-2.5 pr-3 shadow-lg shadow-primary/20 transition-transform active:scale-95">
<span class="material-symbols-outlined text-[18px]">check_circle</span>
<span class="text-xs font-medium">All Signals</span>
</button>
<!-- Inactive Filters -->
<button class="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border pl-2.5 pr-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[18px]">ecg_heart</span>
<span class="text-xs font-medium">Health</span>
</button>
<button class="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border pl-2.5 pr-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[18px]">schedule</span>
<span class="text-xs font-medium">Recency</span>
</button>
<button class="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border pl-2.5 pr-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[18px]">label</span>
<span class="text-xs font-medium">Category</span>
</button>
</div>
</div>
<!-- Scrollable Content Area -->
<div class="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
<!-- Section Header -->
<div class="flex items-center justify-between px-1 pt-2 pb-1">
<p class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Observations (12)</p>
<span class="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-white">tune</span>
</div>
<!-- Signal Card 1: High Priority -->
<div class="group relative overflow-hidden rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border shadow-sm hover:border-primary/50 transition-all cursor-pointer">
<div class="absolute top-0 left-0 w-1 h-full bg-warning"></div> <!-- Status Strip -->
<div class="p-3 pl-4 flex flex-col gap-3">
<!-- Header Row -->
<div class="flex justify-between items-start">
<div class="flex flex-col">
<h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">Market Volatility</h3>
<span class="text-[10px] text-slate-500 font-medium">VIX Index Tracking</span>
</div>
<div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
<span class="material-symbols-outlined text-[12px] text-slate-400">update</span>
<span class="text-[10px] font-mono text-slate-600 dark:text-slate-300">10s ago</span>
</div>
</div>
<!-- Viz Row: Weighted Band -->
<div class="flex flex-col gap-1.5">
<div class="flex justify-between text-[10px] font-mono text-slate-400">
<span>12.5</span>
<span class="text-white font-bold">42.8</span>
<span>80.0</span>
</div>
<div class="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
<!-- Background markers -->
<div class="absolute left-[20%] top-0 bottom-0 w-[1px] bg-slate-700/50"></div>
<div class="absolute left-[80%] top-0 bottom-0 w-[1px] bg-slate-700/50"></div>
<!-- Active Bar -->
<div class="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary w-[55%] relative group-hover:brightness-110 transition-all duration-500">
<!-- Shine effect -->
<div class="absolute top-0 bottom-0 right-0 w-[1px] bg-white/50 shadow-[0_0_4px_rgba(255,255,255,0.5)]"></div>
</div>
</div>
</div>
<!-- Footer Row -->
<div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-2 mt-1">
<div class="flex items-center gap-2">
<div class="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold">
                                Q: 0.98
                            </div>
<div class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-medium">
                                High Conf
                            </div>
</div>
<div class="flex items-center gap-1.5">
<span class="text-[10px] text-slate-400">Status</span>
<div class="h-1.5 w-1.5 rounded-full bg-warning shadow-[0_0_4px_rgba(245,158,11,0.4)]"></div>
</div>
</div>
</div>
</div>
<!-- Signal Card 2: Good Health -->
<div class="group relative overflow-hidden rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border shadow-sm hover:border-primary/50 transition-all cursor-pointer">
<div class="absolute top-0 left-0 w-1 h-full bg-success"></div>
<div class="p-3 pl-4 flex flex-col gap-3">
<div class="flex justify-between items-start">
<div class="flex flex-col">
<h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">Liquidity Depth</h3>
<span class="text-[10px] text-slate-500 font-medium">Order Book Aggregate</span>
</div>
<div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
<span class="text-[10px] font-mono text-slate-600 dark:text-slate-300">5m ago</span>
</div>
</div>
<div class="flex flex-col gap-1.5">
<div class="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
<div class="absolute left-[30%] top-0 bottom-0 w-[1px] bg-slate-700/50"></div>
<div class="h-full rounded-full bg-success/80 w-[88%] relative"></div>
</div>
<div class="flex justify-between items-center">
<span class="text-[10px] font-mono text-slate-400">Range: <span class="text-slate-300">High</span></span>
<span class="text-[10px] font-mono text-success font-bold">98.2%</span>
</div>
</div>
<div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-2 mt-1">
<div class="flex items-center gap-2">
<div class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold">
                                Q: 0.99
                            </div>
</div>
<div class="flex items-center gap-1.5">
<span class="text-[10px] text-slate-400">Healthy</span>
<div class="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_4px_rgba(16,185,129,0.4)]"></div>
</div>
</div>
</div>
</div>
<!-- Signal Card 3: Warning -->
<div class="group relative overflow-hidden rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border shadow-sm hover:border-primary/50 transition-all cursor-pointer">
<div class="absolute top-0 left-0 w-1 h-full bg-danger"></div>
<div class="p-3 pl-4 flex flex-col gap-3">
<div class="flex justify-between items-start">
<div class="flex flex-col">
<h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">News Flow Sentiment</h3>
<span class="text-[10px] text-slate-500 font-medium">Global Macro</span>
</div>
<div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
<span class="text-[10px] font-mono text-slate-600 dark:text-slate-300">2m ago</span>
</div>
</div>
<div class="flex flex-col gap-1.5">
<div class="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
<div class="h-full rounded-full bg-danger/80 w-[12%] relative"></div>
</div>
<div class="flex justify-between items-center">
<span class="text-[10px] font-mono text-slate-400">Bearish</span>
<span class="text-[10px] font-mono text-danger font-bold">-0.85</span>
</div>
</div>
<div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-2 mt-1">
<div class="flex items-center gap-2">
<div class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold">
                                Q: 0.92
                            </div>
<div class="px-1.5 py-0.5 rounded bg-danger/10 text-danger text-[10px] font-medium">
                                Low Volume
                            </div>
</div>
<div class="flex items-center gap-1.5">
<span class="text-[10px] text-slate-400">Warning</span>
<div class="h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_4px_rgba(239,68,68,0.4)]"></div>
</div>
</div>
</div>
</div>
<!-- Signal Card 4: Standard -->
<div class="group relative overflow-hidden rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border shadow-sm hover:border-primary/50 transition-all cursor-pointer opacity-80">
<div class="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
<div class="p-3 pl-4 flex flex-col gap-3">
<div class="flex justify-between items-start">
<div class="flex flex-col">
<h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">System Latency</h3>
<span class="text-[10px] text-slate-500 font-medium">Infrastructure</span>
</div>
<div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
<span class="text-[10px] font-mono text-slate-600 dark:text-slate-300">14m ago</span>
</div>
</div>
<!-- Mini chart representation for variety -->
<div class="flex items-end gap-0.5 h-6 w-full pt-1">
<div class="w-full bg-slate-800 rounded-sm h-[40%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[60%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[30%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[80%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[50%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[45%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[70%]"></div>
<div class="w-full bg-slate-800 rounded-sm h-[55%]"></div>
<div class="w-full bg-primary/50 rounded-sm h-[65%]"></div>
<div class="w-full bg-primary rounded-sm h-[60%]"></div>
</div>
<div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-2 mt-1">
<div class="flex items-center gap-2">
<div class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold">
                                Q: 0.99
                            </div>
</div>
<div class="flex items-center gap-1.5">
<span class="text-[10px] text-slate-400">Stable</span>
<div class="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Details Drawer (Simulated as positioned absolute at bottom) -->
<div class="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-[#0f172a] border-t border-slate-700 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transform translate-y-[calc(100%-60px)] hover:translate-y-0 transition-transform duration-300 ease-out z-50">
<!-- Drag Handle -->
<div class="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
<div class="h-1.5 w-12 rounded-full bg-slate-600"></div>
</div>
<!-- Drawer Header (Always visible peek) -->
<div class="px-4 pb-4 pt-1 flex items-center justify-between">
<div>
<h3 class="text-white text-base font-bold">Signal Details</h3>
<p class="text-xs text-slate-400">Swipe up to view analysis</p>
</div>
<button class="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
<span class="material-symbols-outlined">expand_less</span>
</button>
</div>
<!-- Drawer Content (Hidden until expanded) -->
<div class="px-4 pb-8 space-y-4">
<div class="h-[1px] w-full bg-slate-800 mb-4"></div>
<!-- Expanded Data View -->
<div class="grid grid-cols-2 gap-3">
<div class="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
<p class="text-[10px] text-slate-400 uppercase font-mono mb-1">Raw Value</p>
<p class="text-xl text-white font-mono font-medium">42.8 <span class="text-sm text-slate-500">idx</span></p>
</div>
<div class="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
<p class="text-[10px] text-slate-400 uppercase font-mono mb-1">Deviation</p>
<p class="text-xl text-warning font-mono font-medium">+2.4σ</p>
</div>
</div>
<!-- Abstract Chart Placeholder -->
<div class="bg-slate-900/50 p-3 rounded-lg border border-slate-800 h-40 flex items-center justify-center relative overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
<!-- Using CSS for a simple chart line -->
<svg class="w-full h-full text-primary" preserveaspectratio="none" viewbox="0 0 100 40">
<path d="M0 30 Q 10 25, 20 28 T 40 20 T 60 25 T 80 10 T 100 15" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"></path>
<path d="M0 30 Q 10 25, 20 28 T 40 20 T 60 25 T 80 10 T 100 15 V 40 H 0 Z" fill="currentColor" fill-opacity="0.2" stroke="none"></path>
</svg>
<p class="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">1H Trend</p>
</div>
<div class="flex gap-2">
<button class="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                        Investigate
                    </button>
<button class="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg transition-colors">
<span class="material-symbols-outlined text-[20px]">share</span>
</button>
</div>
</div>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Signals Strip Panel","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Signals Strip Panel","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
