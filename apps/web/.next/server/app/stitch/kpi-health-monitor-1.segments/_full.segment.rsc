1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-e24765025faea277.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/51624f46484614f8.css","style"]
0:{"P":null,"b":"ncTonRn3hvG10lbw3EzX3","c":["","stitch","kpi-health-monitor-1"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","kpi-health-monitor-1","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T4a07,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>KPI Health Monitor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#1c2333", // Slightly lighter for cards
                        "surface-darker": "#151b28", // Slightly darker for contrast areas
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for horizontal scrolling */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col antialiased">
<!-- Top App Bar -->
<header class="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
<div class="flex items-center gap-3">
<button class="text-gray-900 dark:text-white flex items-center justify-center p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-2xl">menu</span>
</button>
<h1 class="text-gray-900 dark:text-white text-lg font-bold tracking-tight">KPI Monitor</h1>
</div>
<div class="flex items-center gap-2">
<button class="relative text-gray-900 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-2xl">notifications</span>
<span class="absolute top-2 right-2 flex h-2.5 w-2.5">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
</span>
</button>
<div class="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-400 p-[2px]">
<img alt="User Profile" class="rounded-full h-full w-full object-cover border-2 border-white dark:border-background-dark" data-alt="User avatar profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBIqGURHrE5fUzCREcDy20cN5UWYUx6_Dz6vpN1_jzhzTQ87MJMuo1IwmjbrcxwLtkv9e_LDp3S8HIY8UVVvTBWjlVen9nSlk-NXfbEjbeYRTYvp4jfJvWFq-IHkjEhPpKVznMnI5bC0xPbKLE1GeCacCYWWfJINoCrKUw9HP4R64nq6zleERmkkYcxNvFD8kfw1y8wRZV9wWLtC6VL2rw7x_PHijk05CvVg313cVh5B_myTGBeN3VE0KPh9i3GYOW-cWIrvfjiCsR"/>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 pb-24 overflow-x-hidden">
<!-- Summary Stats -->
<section class="p-4 grid grid-cols-3 gap-3">
<div class="flex flex-col gap-1 rounded-xl p-3 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
<p class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Total</p>
<p class="text-gray-900 dark:text-white text-xl font-bold">142</p>
<div class="flex items-center text-emerald-500 text-xs font-medium">
<span class="material-symbols-outlined text-sm mr-0.5">trending_up</span>
<span>+2%</span>
</div>
</div>
<div class="flex flex-col gap-1 rounded-xl p-3 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
<p class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Healthy</p>
<p class="text-gray-900 dark:text-white text-xl font-bold">128</p>
<div class="flex items-center text-emerald-500 text-xs font-medium">
<span class="material-symbols-outlined text-sm mr-0.5">check_circle</span>
<span>90%</span>
</div>
</div>
<div class="flex flex-col gap-1 rounded-xl p-3 bg-white dark:bg-surface-dark shadow-sm border border-red-500/30 ring-1 ring-red-500/20">
<p class="text-red-600 dark:text-red-400 text-xs font-medium uppercase tracking-wider">Critical</p>
<p class="text-red-600 dark:text-white text-xl font-bold">14</p>
<div class="flex items-center text-red-500 text-xs font-medium">
<span class="material-symbols-outlined text-sm mr-0.5">warning</span>
<span>Action Req</span>
</div>
</div>
</section>
<!-- Critical Alerts Section -->
<section class="px-4 mb-6">
<div class="flex items-center justify-between mb-3">
<h2 class="text-gray-900 dark:text-white text-lg font-bold flex items-center gap-2">
<span class="material-symbols-outlined text-red-500">campaign</span>
                    Priority Alerts
                </h2>
<button class="text-primary text-sm font-medium hover:underline">View All</button>
</div>
<div class="flex overflow-x-auto hide-scrollbar gap-4 pb-2 snap-x">
<!-- Alert Card 1 -->
<div class="snap-center min-w-[280px] rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 p-4 relative overflow-hidden group">
<div class="absolute top-0 right-0 p-3 opacity-10">
<span class="material-symbols-outlined text-6xl text-red-500">error</span>
</div>
<div class="relative z-10">
<div class="flex items-center gap-2 mb-2">
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase tracking-wider">Critical</span>
<span class="text-red-400 text-xs font-mono">ID: KPI-882</span>
</div>
<h3 class="text-gray-900 dark:text-white text-base font-bold leading-tight mb-1">Revenue Drop Detected</h3>
<p class="text-gray-600 dark:text-gray-300 text-sm mb-4">Data Missing &gt; 4 hrs in EU Region</p>
<button class="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-500 transition-colors">
                            INVESTIGATE
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
<!-- Alert Card 2 -->
<div class="snap-center min-w-[280px] rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 p-4 relative overflow-hidden group">
<div class="absolute top-0 right-0 p-3 opacity-10">
<span class="material-symbols-outlined text-6xl text-amber-500">warning</span>
</div>
<div class="relative z-10">
<div class="flex items-center gap-2 mb-2">
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">At Risk</span>
<span class="text-amber-500 text-xs font-mono">ID: KPI-104</span>
</div>
<h3 class="text-gray-900 dark:text-white text-base font-bold leading-tight mb-1">Signups Anomaly</h3>
<p class="text-gray-600 dark:text-gray-300 text-sm mb-4">Volatility +20% vs 30-day Avg</p>
<button class="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors">
                            VIEW DETAILS
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
</section>
<!-- Filter Bar -->
<section class="px-4 mb-4">
<div class="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
<button class="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shadow-sm shadow-primary/20">All Metrics</button>
<button class="bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Favorites</button>
<button class="bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Most Volatile</button>
<button class="bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Stale Data</button>
</div>
</section>
<!-- KPI List -->
<section class="px-4 flex flex-col gap-3">
<h2 class="text-gray-900 dark:text-white text-lg font-bold mb-1">Active Monitors</h2>
<!-- KPI Card 1: Healthy -->
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
<span class="material-symbols-outlined">payments</span>
</div>
<div>
<h3 class="text-gray-900 dark:text-white font-bold text-base">Subscription Revenue</h3>
<p class="text-gray-500 dark:text-gray-400 text-xs">Updated 2m ago</p>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wide border border-emerald-500/20">Healthy</span>
</div>
<div class="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Freshness</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">2m</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Missing</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">0%</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Volatility</p>
<p class="text-emerald-500 font-mono text-sm font-semibold">Low</p>
</div>
</div>
<!-- Sparkline Area -->
<div class="relative h-12 w-full mt-1">
<div class="absolute inset-0 flex items-end gap-1">
<!-- Simulated Sparkline using Tailwind height utilities -->
<div class="bg-primary/20 w-1/12 h-[40%] rounded-t-sm"></div>
<div class="bg-primary/30 w-1/12 h-[60%] rounded-t-sm"></div>
<div class="bg-primary/40 w-1/12 h-[50%] rounded-t-sm"></div>
<div class="bg-primary/50 w-1/12 h-[70%] rounded-t-sm"></div>
<div class="bg-primary/60 w-1/12 h-[55%] rounded-t-sm"></div>
<div class="bg-primary/70 w-1/12 h-[80%] rounded-t-sm"></div>
<div class="bg-primary/80 w-1/12 h-[75%] rounded-t-sm"></div>
<div class="bg-primary/90 w-1/12 h-[85%] rounded-t-sm"></div>
<div class="bg-primary w-1/12 h-[90%] rounded-t-sm"></div>
<div class="bg-primary w-1/12 h-[95%] rounded-t-sm"></div>
<div class="bg-primary w-1/12 h-[88%] rounded-t-sm"></div>
<div class="bg-primary w-1/12 h-[92%] rounded-t-sm"></div>
</div>
<!-- Trend line overlay -->
<svg class="absolute inset-0 w-full h-full" preserveaspectratio="none">
<path class="drop-shadow-sm" d="M0,30 L30,20 L60,25 L90,15 L120,22 L150,10 L180,12 L210,8 L240,5 L270,8 L300,5" fill="none" stroke="#135bec" stroke-width="2" vector-effect="non-scaling-stroke"></path>
</svg>
</div>
</div>
<!-- KPI Card 2: Warning -->
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
<span class="material-symbols-outlined">group_add</span>
</div>
<div>
<h3 class="text-gray-900 dark:text-white font-bold text-base">Daily Active Users</h3>
<p class="text-gray-500 dark:text-gray-400 text-xs">Updated 15m ago</p>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wide border border-amber-500/20">At Risk</span>
</div>
<div class="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Freshness</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">15m</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Missing</p>
<p class="text-amber-500 font-mono text-sm font-semibold">5%</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Volatility</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">Med</p>
</div>
</div>
<!-- Sparkline Area -->
<div class="relative h-12 w-full mt-1">
<svg class="w-full h-full overflow-visible" preserveaspectratio="none">
<path d="M0,40 C20,40 20,20 40,20 C60,20 60,45 80,45 C100,45 100,10 120,10 C140,10 140,30 160,30 C180,30 180,5 200,5 C220,5 220,25 240,25 C260,25 260,15 280,15 L320,35" fill="none" stroke="#f59e0b" stroke-width="2" vector-effect="non-scaling-stroke"></path>
<!-- Gaps indicator -->
<rect fill="#f59e0b" fill-opacity="0.1" height="48" rx="4" width="40" x="280" y="0"></rect>
</svg>
</div>
</div>
<!-- KPI Card 3: Critical -->
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-l-4 border-l-red-500 border-y-gray-100 dark:border-y-gray-800 border-r-gray-100 dark:border-r-gray-800 flex flex-col gap-4">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
<span class="material-symbols-outlined">shopping_cart_checkout</span>
</div>
<div>
<h3 class="text-gray-900 dark:text-white font-bold text-base">Checkout Conversion</h3>
<p class="text-red-500 text-xs font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-[10px]">timer</span>
                                Stale: 5h ago
                            </p>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wide border border-red-500/20">Critical</span>
</div>
<div class="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Freshness</p>
<p class="text-red-500 font-mono text-sm font-bold">5h</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Missing</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">12%</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Volatility</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">High</p>
</div>
</div>
<!-- Sparkline Area -->
<div class="relative h-12 w-full mt-1 bg-red-500/5 rounded border border-red-500/10 flex items-center justify-center">
<p class="text-red-500/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
<span class="material-symbols-outlined text-sm">signal_disconnected</span>
                        No Signal
                    </p>
</div>
</div>
<!-- KPI Card 4: Healthy -->
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
<span class="material-symbols-outlined">cloud_download</span>
</div>
<div>
<h3 class="text-gray-900 dark:text-white font-bold text-base">API Latency</h3>
<p class="text-gray-500 dark:text-gray-400 text-xs">Updated 30s ago</p>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wide border border-emerald-500/20">Healthy</span>
</div>
<div class="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Freshness</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">30s</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Missing</p>
<p class="text-gray-900 dark:text-white font-mono text-sm font-semibold">0.1%</p>
</div>
<div>
<p class="text-[10px] text-gray-500 uppercase font-medium">Volatility</p>
<p class="text-emerald-500 font-mono text-sm font-semibold">Low</p>
</div>
</div>
<!-- Sparkline Area -->
<div class="relative h-12 w-full mt-1">
<svg class="w-full h-full overflow-visible" preserveaspectratio="none">
<path d="M0,25 L20,28 L40,22 L60,25 L80,24 L100,26 L120,25 L140,22 L160,28 L180,25 L200,24 L220,26 L240,25 L260,22 L280,25 L320,24" fill="none" stroke="#10b981" stroke-width="2" vector-effect="non-scaling-stroke"></path>
</svg>
</div>
</div>
</section>
</main>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 z-50">
<div class="flex justify-between items-center max-w-md mx-auto h-14">
<button class="flex flex-col items-center gap-1 text-primary w-16">
<span class="material-symbols-outlined text-2xl">dashboard</span>
<span class="text-[10px] font-medium">Monitor</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-16">
<span class="material-symbols-outlined text-2xl">list_alt</span>
<span class="text-[10px] font-medium">Metrics</span>
</button>
<div class="relative -top-5">
<button class="bg-primary hover:bg-blue-600 text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95">
<span class="material-symbols-outlined text-2xl">add</span>
</button>
</div>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-16">
<span class="material-symbols-outlined text-2xl">history</span>
<span class="text-[10px] font-medium">Logs</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-16">
<span class="material-symbols-outlined text-2xl">settings</span>
<span class="text-[10px] font-medium">Settings</span>
</button>
</div>
</nav>
<div class="h-6 w-full bg-white dark:bg-surface-dark fixed bottom-0 z-40"></div> <!-- Safe area filler -->
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Kpi Health Monitor 1"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Kpi Health Monitor 1","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
