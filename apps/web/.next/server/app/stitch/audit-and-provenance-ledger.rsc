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
0:{"P":null,"b":"V_sCMn05SiQGXpllElBBM","c":["","stitch","audit-and-provenance-ledger"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","audit-and-provenance-ledger","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T33bf,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Audit &amp; Provenance Ledger</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#13a4ec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                        "surface-dark": "#1a262d",
                        "surface-highlight": "#233038",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["Space Grotesk", "monospace"] // Using Space Grotesk for mono feel as requested, or fallback
                    },
                    borderRadius: {
                        "DEFAULT": "0.375rem", // rounded-md approx 6px
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
        /* Custom scrollbar for webkit to match the technical aesthetic */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #101c22;
        }
        ::-webkit-scrollbar-thumb {
            background: #233038;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #3b4b54;
        }
        .timeline-line {
            background: linear-gradient(180deg, #3b4b54 0%, #3b4b54 50%, transparent 100%);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden">
<!-- Top Navigation / Header -->
<header class="flex-none bg-background-light dark:bg-background-dark z-20 pb-2 border-b border-slate-200 dark:border-slate-800">
<div class="px-4 pt-4 pb-2 flex flex-col gap-4">
<!-- Top Bar -->
<div class="flex items-center justify-between h-12">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-surface-highlight text-slate-600 dark:text-slate-300 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<div class="flex items-center gap-2">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-surface-highlight text-slate-600 dark:text-slate-300 transition-colors">
<span class="material-symbols-outlined text-[24px]">search</span>
</button>
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-surface-highlight text-primary transition-colors relative">
<span class="material-symbols-outlined text-[24px]">tune</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
</div>
</div>
<!-- Title -->
<div>
<h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Ledger</h1>
<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Immutable record of governance events</p>
</div>
<!-- Filter Chips (Horizontal Scroll) -->
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
<button class="flex-shrink-0 px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium border border-transparent">
                    All Events
                </button>
<button class="flex-shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-surface-highlight text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-primary dark:hover:border-primary transition-colors">
                    KPI Approvals
                </button>
<button class="flex-shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-surface-highlight text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-primary dark:hover:border-primary transition-colors">
                    Signal Discoveries
                </button>
<button class="flex-shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-surface-highlight text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-primary dark:hover:border-primary transition-colors">
                    Model Runs
                </button>
</div>
</div>
</header>
<!-- Main Content: Timeline Feed -->
<main class="flex-1 overflow-y-auto relative px-4 pt-2 pb-24">
<!-- Timeline Connector Line -->
<div class="absolute left-[27px] top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
<!-- Today Section Header -->
<div class="relative z-10 flex items-center mb-6 mt-2">
<div class="w-3 h-3 rounded-full bg-primary border-4 border-background-light dark:border-background-dark shadow-sm ml-[15px]"></div>
<span class="ml-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Feed • Today</span>
</div>
<!-- Log Entry 1: Model Run (Detailed/Expanded view concept) -->
<div class="relative z-10 grid grid-cols-[40px_1fr] gap-x-3 mb-6 group">
<!-- Icon Column -->
<div class="flex flex-col items-center pt-1">
<div class="w-10 h-10 rounded-full bg-surface-highlight border border-slate-700 flex items-center justify-center text-primary shadow-lg shadow-primary/10 z-10">
<span class="material-symbols-outlined text-[20px]">memory</span>
</div>
</div>
<!-- Content Card -->
<div class="bg-white dark:bg-surface-dark rounded-md p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm active:scale-[0.99] transition-transform">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">14:02:45 UTC</span>
<h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight mt-0.5">Model Training: v4.2.0-alpha</h3>
</div>
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        VERIFIED
                    </span>
</div>
<div class="flex flex-col gap-2 mt-3">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-slate-500">fingerprint</span>
<code class="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-primary/20 transition-colors">0x8f3...b21</code>
<span class="text-xs text-slate-500 dark:text-slate-400 ml-auto">Hash</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-slate-500">dataset</span>
<span class="text-xs text-slate-300">Input: dataset_v9</span>
<button class="ml-auto text-xs text-primary flex items-center gap-1 hover:underline">
                            Provenance
                            <span class="material-symbols-outlined text-[12px]">open_in_new</span>
</button>
</div>
</div>
</div>
</div>
<!-- Log Entry 2: KPI Approval -->
<div class="relative z-10 grid grid-cols-[40px_1fr] gap-x-3 mb-6 group">
<div class="flex flex-col items-center pt-1">
<div class="w-10 h-10 rounded-full bg-surface-dark border border-slate-800 flex items-center justify-center text-emerald-400 z-10">
<span class="material-symbols-outlined text-[20px]">verified_user</span>
</div>
</div>
<div class="bg-white dark:bg-surface-dark/50 rounded-md p-3 border border-slate-200 dark:border-slate-800 active:bg-surface-highlight transition-colors">
<div class="flex justify-between items-start">
<div>
<span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">13:45:10 UTC</span>
<h3 class="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5">Risk Threshold Approval</h3>
</div>
<span class="material-symbols-outlined text-slate-600 text-[18px]">more_horiz</span>
</div>
<div class="mt-2 flex items-center justify-between">
<div class="flex items-center gap-2">
<div class="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">SA</div>
<span class="text-xs text-slate-400">SysAdmin</span>
</div>
<code class="text-[11px] text-primary/80 font-mono">0xa12...c99</code>
</div>
</div>
</div>
<!-- Log Entry 3: Signal Discovery (Alert State) -->
<div class="relative z-10 grid grid-cols-[40px_1fr] gap-x-3 mb-6 group">
<div class="flex flex-col items-center pt-1">
<div class="w-10 h-10 rounded-full bg-surface-dark border border-amber-500/30 flex items-center justify-center text-amber-500 z-10 relative">
<span class="absolute inset-0 rounded-full bg-amber-500/10 animate-pulse"></span>
<span class="material-symbols-outlined text-[20px]">notifications_active</span>
</div>
</div>
<div class="bg-white dark:bg-surface-dark/50 rounded-md p-3 border border-slate-200 dark:border-slate-800 border-l-4 dark:border-l-amber-500 active:bg-surface-highlight transition-colors">
<div class="flex justify-between items-start">
<div>
<span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">12:10:00 UTC</span>
<h3 class="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5">Anomaly Detected: Variance &gt; 5%</h3>
</div>
</div>
<div class="mt-2 flex items-center justify-between">
<span class="text-xs text-amber-500 font-medium">Attention Required</span>
<code class="text-[11px] text-primary/80 font-mono">0xc44...f00</code>
</div>
</div>
</div>
<!-- Yesterday Header -->
<div class="relative z-10 flex items-center mb-6 mt-8">
<div class="w-2 h-2 rounded-full bg-slate-600 border-2 border-background-light dark:border-background-dark ml-[19px]"></div>
<span class="ml-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">Yesterday</span>
</div>
<!-- Log Entry 4: Dataset Ingestion -->
<div class="relative z-10 grid grid-cols-[40px_1fr] gap-x-3 mb-6 group opacity-75">
<div class="flex flex-col items-center pt-1">
<div class="w-10 h-10 rounded-full bg-surface-dark border border-slate-800 flex items-center justify-center text-slate-400 z-10">
<span class="material-symbols-outlined text-[20px]">database</span>
</div>
</div>
<div class="bg-white dark:bg-surface-dark/30 rounded-md p-3 border border-slate-200 dark:border-slate-800/50">
<div class="flex justify-between items-start">
<div>
<span class="text-[11px] font-mono text-slate-500 dark:text-slate-500">23:30:22 UTC</span>
<h3 class="text-sm font-medium text-slate-900 dark:text-slate-300 mt-0.5">Dataset Ingestion: v9-beta</h3>
</div>
</div>
<div class="mt-2 flex items-center justify-end">
<code class="text-[11px] text-primary/60 font-mono">0xd99...e11</code>
</div>
</div>
</div>
<!-- Log Entry 5: Model Evaluation -->
<div class="relative z-10 grid grid-cols-[40px_1fr] gap-x-3 mb-6 group opacity-75">
<div class="flex flex-col items-center pt-1">
<div class="w-10 h-10 rounded-full bg-surface-dark border border-slate-800 flex items-center justify-center text-slate-400 z-10">
<span class="material-symbols-outlined text-[20px]">analytics</span>
</div>
</div>
<div class="bg-white dark:bg-surface-dark/30 rounded-md p-3 border border-slate-200 dark:border-slate-800/50">
<div class="flex justify-between items-start">
<div>
<span class="text-[11px] font-mono text-slate-500 dark:text-slate-500">21:15:00 UTC</span>
<h3 class="text-sm font-medium text-slate-900 dark:text-slate-300 mt-0.5">Model Evaluation: v4.1.9</h3>
</div>
</div>
<div class="mt-2 flex items-center justify-end">
<code class="text-[11px] text-primary/60 font-mono">0x7a...b2</code>
</div>
</div>
</div>
</main>
<!-- Bottom Detail Drawer / Quick Action Bar (Floating) -->
<div class="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-12">
<div class="bg-surface-highlight border border-slate-700 rounded-lg shadow-2xl p-4 flex items-center justify-between backdrop-blur-md bg-opacity-95">
<div class="flex items-center gap-3">
<div class="p-2 bg-primary/20 rounded text-primary">
<span class="material-symbols-outlined">qr_code_scanner</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-slate-400 font-medium">Last Verified Block</span>
<span class="text-sm text-white font-mono">#89,204 • 2m ago</span>
</div>
</div>
<button class="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-4 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-95">
                Audit
            </button>
</div>
</div>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Audit & Provenance Ledger"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Audit & Provenance Ledger","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
