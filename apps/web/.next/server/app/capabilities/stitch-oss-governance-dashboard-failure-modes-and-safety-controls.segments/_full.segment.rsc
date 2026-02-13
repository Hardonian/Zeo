1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-e24765025faea277.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/37847ea80569b263.css","style"]
0:{"P":null,"b":"J_kVknmu6GSF5qixhc85u","c":["","capabilities","stitch-oss-governance-dashboard-failure-modes-and-safety-controls"],"q":"","i":false,"f":[[["",{"children":["capabilities",{"children":[["slug","stitch-oss-governance-dashboard-failure-modes-and-safety-controls","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/37847ea80569b263.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:T3125,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Safety Controls</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#f20d0d",
              "background-light": "#f8f5f5",
              "background-dark": "#181111", 
              "surface-dark": "#221010",
              "surface-border": "#392828",
            },
            fontFamily: {
              "display": ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem", 
                "lg": "0.5rem", 
                "xl": "0.75rem", 
                "full": "9999px"
            },
          },
        },
      }
    </script>
<style>
        /* Custom scrollbar hiding for clean mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        /* Toggle Switch Styling */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #f20d0d;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #f20d0d;
        }
        
        /* Pulse animation for critical status */
        @keyframes pulse-red {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-red {
            animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white h-screen flex flex-col overflow-hidden">
<!-- Top App Bar -->
<header class="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-surface-border z-10">
<button class="flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<h1 class="text-sm font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">Terminal 01 // Controls</h1>
<button class="flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative">
<span class="material-symbols-outlined text-2xl">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping"></span>
<span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto no-scrollbar p-4 pb-24 space-y-6">
<!-- System Status -->
<div class="flex items-center justify-between px-2">
<div>
<h2 class="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider">SYSTEM STATUS</h2>
<div class="flex items-center gap-2 mt-1">
<span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
<span class="text-xl font-bold tracking-tight">OPERATIONAL</span>
</div>
</div>
<div class="text-right">
<h2 class="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider">UPTIME</h2>
<span class="text-lg font-mono text-gray-700 dark:text-gray-300">14d 03h 22m</span>
</div>
</div>
<!-- Kill Switch Section -->
<section class="relative group">
<div class="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-600 rounded-xl opacity-20 blur group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
<div class="relative flex flex-col items-center justify-center p-6 bg-surface-dark border border-primary/30 rounded-xl shadow-2xl">
<div class="w-full flex justify-between items-start mb-4">
<span class="material-symbols-outlined text-primary text-3xl">gpp_maybe</span>
<span class="text-[10px] font-mono text-primary border border-primary/30 px-2 py-0.5 rounded bg-primary/10 uppercase tracking-widest">Emergency Override</span>
</div>
<button class="w-full h-20 bg-primary hover:bg-red-600 active:scale-[0.98] transition-all transform rounded-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(242,13,13,0.3)] group-hover:shadow-[0_0_30px_rgba(242,13,13,0.5)]">
<span class="material-symbols-outlined text-white text-4xl">hexagon</span>
<span class="text-2xl font-bold text-white tracking-wider">FREEZE MARKETS</span>
</button>
<p class="mt-4 text-center text-primary text-sm font-medium bg-primary/5 border border-primary/10 px-4 py-2 rounded w-full">
<span class="material-symbols-outlined align-middle text-sm mr-1">warning</span>
                    EMERGENCY ONLY: Halts all trading engines immediately.
                </p>
</div>
</section>
<!-- Divider -->
<div class="h-px bg-gradient-to-r from-transparent via-surface-border to-transparent w-full"></div>
<!-- Safety Toggles Grid -->
<div class="space-y-4">
<h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">Intervention Protocols</h3>
<!-- Safe Mode Toggle -->
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-lg p-4 flex items-center justify-between shadow-sm">
<div class="flex-1 pr-4">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-gray-400 text-xl">shield</span>
<h4 class="text-base font-bold text-gray-900 dark:text-white">Safe Mode</h4>
</div>
<p class="text-xs text-primary font-mono leading-relaxed bg-primary/5 inline-block px-1 rounded">
                        Limits position sizing to 10% max allocation.
                    </p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<!-- Disable AI Assist Toggle -->
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-lg p-4 flex items-center justify-between shadow-sm">
<div class="flex-1 pr-4">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-gray-400 text-xl">psychology_alt</span>
<h4 class="text-base font-bold text-gray-900 dark:text-white">Disable AI Assist</h4>
</div>
<p class="text-xs text-primary font-mono leading-relaxed bg-primary/5 inline-block px-1 rounded">
                        Reverts to manual algo execution. ML models offline.
                    </p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<!-- Disable Adapters Toggle -->
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-lg p-4 flex items-center justify-between shadow-sm">
<div class="flex-1 pr-4">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-gray-400 text-xl">cable</span>
<h4 class="text-base font-bold text-gray-900 dark:text-white">Disable Adapters</h4>
</div>
<p class="text-xs text-primary font-mono leading-relaxed bg-primary/5 inline-block px-1 rounded">
                        Sever connection to exchange APIs (Binance, NYSE).
                    </p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<!-- Force Max Uncertainty Toggle -->
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-lg p-4 flex items-center justify-between shadow-sm">
<div class="flex-1 pr-4">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-gray-400 text-xl">storm</span>
<h4 class="text-base font-bold text-gray-900 dark:text-white">Force Max Uncertainty</h4>
</div>
<p class="text-xs text-primary font-mono leading-relaxed bg-primary/5 inline-block px-1 rounded">
                        Artificially inflates risk metrics to prevent new entries.
                    </p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
</div>
</main>
<!-- Bottom Navigation -->
<nav class="bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-surface-border fixed bottom-0 w-full z-20 pb-safe">
<div class="flex justify-around items-center h-16 px-2">
<button class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors gap-1">
<span class="material-symbols-outlined text-[24px]">monitoring</span>
<span class="text-[10px] font-medium tracking-wide">Monitor</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors gap-1">
<span class="material-symbols-outlined text-[24px]">terminal</span>
<span class="text-[10px] font-medium tracking-wide">Logs</span>
</button>
<!-- Active Tab Indicator -->
<div class="relative w-full h-full">
<div class="absolute -top-[1px] left-1/2 -translate-x-1/2 w-12 h-[2px] bg-primary rounded-b-full shadow-[0_2px_8px_rgba(242,13,13,0.5)]"></div>
<button class="flex flex-col items-center justify-center w-full h-full text-primary transition-colors gap-1">
<span class="material-symbols-outlined text-[24px] fill-current">shield</span>
<span class="text-[10px] font-bold tracking-wide">Safety</span>
</button>
</div>
<button class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors gap-1">
<span class="material-symbols-outlined text-[24px]">wallet</span>
<span class="text-[10px] font-medium tracking-wide">Portfolio</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors gap-1">
<span class="material-symbols-outlined text-[24px]">settings</span>
<span class="text-[10px] font-medium tracking-wide">Settings</span>
</button>
</div>
<!-- Safe Area Spacer for iPhone Home Bar -->
<div class="h-[env(safe-area-inset-bottom)] w-full bg-white dark:bg-surface-dark"></div>
</nav>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L5",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Failure Modes & Safety Controls"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Failure Modes & Safety Controls","srcDoc":"$f","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}]
