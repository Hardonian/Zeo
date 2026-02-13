1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3a46,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Opponent Signal Tracker</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar hiding for horizontal scroll areas */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen overflow-x-hidden font-display flex flex-col items-center">
<!-- Mobile Wrapper -->
<div class="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
<!-- Status Header -->
<header class="flex items-center justify-between p-4 bg-[#111418] border-b border-[#283039] sticky top-0 z-20">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center size-10 rounded bg-[#283039] text-primary">
<span class="material-symbols-outlined text-[24px]">terminal</span>
</div>
<div>
<h2 class="text-white text-sm font-bold tracking-tight uppercase">Session: Alpha-9</h2>
<div class="flex items-center gap-1.5">
<span class="size-2 rounded-full bg-green-500 animate-pulse"></span>
<p class="text-[#9dabb9] text-xs font-mono">LIVE • 98% CONFIDENCE</p>
</div>
</div>
</div>
<button class="text-[#9dabb9] hover:text-white transition-colors">
<span class="material-symbols-outlined">settings</span>
</button>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto pb-24">
<!-- Quick Stats -->
<div class="grid grid-cols-3 gap-3 p-4">
<div class="bg-[#1c232b] p-3 rounded-lg border border-[#283039] flex flex-col">
<span class="text-[#9dabb9] text-[10px] uppercase font-bold tracking-wider mb-1">Signals</span>
<span class="text-white text-xl font-bold font-mono">24</span>
<span class="text-[#0bda5b] text-[10px] font-medium">+20%</span>
</div>
<div class="bg-[#1c232b] p-3 rounded-lg border border-[#283039] flex flex-col">
<span class="text-[#9dabb9] text-[10px] uppercase font-bold tracking-wider mb-1">Threats</span>
<span class="text-white text-xl font-bold font-mono">3</span>
<span class="text-primary text-[10px] font-medium">ACTIVE</span>
</div>
<div class="bg-[#1c232b] p-3 rounded-lg border border-[#283039] flex flex-col">
<span class="text-[#9dabb9] text-[10px] uppercase font-bold tracking-wider mb-1">Sys Load</span>
<span class="text-white text-xl font-bold font-mono">12%</span>
<span class="text-[#fa6238] text-[10px] font-medium">-5%</span>
</div>
</div>
<!-- Filters -->
<div class="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">
<button class="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">
                    All Signals
                </button>
<button class="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-[#283039] text-[#9dabb9] text-xs font-medium border border-transparent hover:border-[#3b4754]">
                    Regime Shift
                </button>
<button class="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-[#283039] text-[#9dabb9] text-xs font-medium border border-transparent hover:border-[#3b4754]">
                    Behavior Shift
                </button>
<button class="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-[#283039] text-[#9dabb9] text-xs font-medium border border-transparent hover:border-[#3b4754]">
                    Anomalies
                </button>
</div>
<!-- Focus Item (Major Hypothesis) -->
<div class="p-4">
<div class="relative overflow-hidden rounded-xl bg-[#1c232b] border border-[#283039] group">
<!-- Background accent -->
<div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>
<!-- Content -->
<div class="p-5 relative z-10">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">Primary Hypothesis</p>
<h3 class="text-white text-lg font-bold leading-tight">Liquidity Vampire Attack</h3>
</div>
<span class="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">CRITICAL</span>
</div>
<!-- Graph Placeholder -->
<div class="h-24 w-full bg-[#111418] rounded border border-[#283039] mb-4 relative overflow-hidden" data-alt="Abstract line chart showing a sudden spike in activity followed by a plateau, representing a liquidity attack pattern">
<div class="absolute inset-0 flex items-end px-2 pb-2 gap-1 opacity-50">
<div class="w-1/12 bg-primary/20 h-[30%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/30 h-[45%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/40 h-[35%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/50 h-[60%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/60 h-[50%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/80 h-[85%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary h-[95%] rounded-t-sm shadow-[0_0_10px_rgba(19,127,236,0.5)]"></div>
<div class="w-1/12 bg-primary/90 h-[90%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/70 h-[75%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/50 h-[65%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/30 h-[55%] rounded-t-sm"></div>
<div class="w-1/12 bg-primary/20 h-[45%] rounded-t-sm"></div>
</div>
<!-- Data overlay -->
<div class="absolute top-2 left-2 text-[10px] text-[#9dabb9] font-mono">TVL IMPACT</div>
</div>
<div class="flex items-center justify-between mb-4">
<div class="flex flex-col gap-1 w-full mr-4">
<div class="flex justify-between text-xs mb-1">
<span class="text-white font-medium">Signal Strength</span>
<span class="text-primary font-bold">87%</span>
</div>
<div class="h-1.5 w-full bg-[#283039] rounded-full overflow-hidden">
<div class="h-full bg-primary w-[87%] rounded-full shadow-[0_0_8px_rgba(19,127,236,0.6)]"></div>
</div>
</div>
<div class="text-right shrink-0">
<p class="text-[#9dabb9] text-[10px] uppercase font-bold">ETA</p>
<p class="text-white text-sm font-mono font-medium">04:20:00</p>
</div>
</div>
<button class="w-full flex items-center justify-center gap-2 h-9 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined text-[16px]">check_circle</span>
                            Verify Analysis
                        </button>
</div>
</div>
</div>
<!-- List Divider -->
<div class="px-4 py-2 flex items-center justify-between">
<h3 class="text-[#9dabb9] text-xs font-bold uppercase tracking-wider">Incoming Signals</h3>
<span class="text-[#9dabb9] text-[10px] font-mono">SORT: RELEVANCE</span>
</div>
<!-- Signal List -->
<div class="flex flex-col gap-3 px-4">
<!-- Item 1: Uncertain -->
<div class="bg-[#1c232b] rounded-lg p-4 border border-[#283039] active:border-primary/50 transition-colors">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-white text-sm font-bold">Governance Proposal #402</span>
<span class="text-[#9dabb9] text-xs mt-0.5">Potential Hostile Takeover</span>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px]">more_horiz</span>
</div>
<div class="flex items-center gap-2 mb-3">
<span class="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20 uppercase">Uncertain</span>
<span class="px-1.5 py-0.5 rounded bg-[#283039] text-[#9dabb9] text-[10px] font-bold border border-[#3b4754] uppercase">Regime Shift</span>
</div>
<div class="flex items-center justify-between gap-4">
<!-- Confidence Interval Visual -->
<div class="flex-1 flex flex-col gap-1">
<div class="flex justify-between text-[10px] text-[#9dabb9]">
<span>Conf: 0.62</span>
<span>±0.15</span>
</div>
<div class="relative h-1 w-full bg-[#283039] rounded-full">
<div class="absolute left-[47%] w-[30%] h-full bg-[#9dabb9]/30 rounded-full"></div> <!-- Range -->
<div class="absolute left-[62%] w-1.5 h-1.5 -top-[1px] bg-[#9dabb9] rounded-full border border-[#1c232b]"></div> <!-- Point -->
</div>
</div>
<!-- Timestamp -->
<div class="text-right">
<span class="text-[#5f6a7a] text-[10px] font-mono">T-12m</span>
</div>
</div>
</div>
<!-- Item 2: Non-Causal -->
<div class="bg-[#1c232b] rounded-lg p-4 border border-[#283039] opacity-75 grayscale-[0.5]">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-white text-sm font-bold">Validator Node 7 Offline</span>
<span class="text-[#9dabb9] text-xs mt-0.5">Hardware Failure Detected</span>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px]">more_horiz</span>
</div>
<div class="flex items-center gap-2 mb-3">
<span class="px-1.5 py-0.5 rounded bg-[#283039] text-[#5f6a7a] text-[10px] font-bold border border-[#3b4754] uppercase">Non-Causal</span>
<span class="px-1.5 py-0.5 rounded bg-[#283039] text-[#9dabb9] text-[10px] font-bold border border-[#3b4754] uppercase">Anomaly</span>
</div>
<div class="flex items-center justify-between gap-4">
<div class="flex-1 flex flex-col gap-1">
<div class="flex justify-between text-[10px] text-[#5f6a7a]">
<span>Impact: Negligible</span>
</div>
<div class="h-1 w-full bg-[#283039] rounded-full">
<div class="h-full bg-[#5f6a7a] w-[5%] rounded-full"></div>
</div>
</div>
<!-- Timestamp -->
<div class="text-right">
<span class="text-[#5f6a7a] text-[10px] font-mono">T-45m</span>
</div>
</div>
</div>
<!-- Item 3: Confirmed Behavior Shift -->
<div class="bg-[#1c232b] rounded-lg p-4 border border-[#283039] active:border-primary/50 transition-colors">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-white text-sm font-bold">Wallet Cluster 4 Movement</span>
<span class="text-[#9dabb9] text-xs mt-0.5">Accumulation Pattern</span>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px]">more_horiz</span>
</div>
<div class="flex items-center gap-2 mb-3">
<span class="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold border border-primary/30 uppercase">Confirmed</span>
<span class="px-1.5 py-0.5 rounded bg-[#283039] text-[#9dabb9] text-[10px] font-bold border border-[#3b4754] uppercase">Behavior</span>
</div>
<div class="flex items-center justify-between gap-4">
<div class="flex-1 flex flex-col gap-1">
<div class="flex justify-between text-[10px] text-[#9dabb9]">
<span>Conf: 0.92</span>
<span>±0.02</span>
</div>
<div class="relative h-1 w-full bg-[#283039] rounded-full">
<div class="absolute left-[90%] w-[4%] h-full bg-primary/30 rounded-full"></div>
<div class="absolute left-[92%] w-1.5 h-1.5 -top-[1px] bg-primary rounded-full border border-[#1c232b]"></div>
</div>
</div>
<div class="text-right">
<span class="text-[#5f6a7a] text-[10px] font-mono">T-1h</span>
</div>
</div>
</div>
<!-- Item 4: Confirmed Behavior Shift -->
<div class="bg-[#1c232b] rounded-lg p-4 border border-[#283039] active:border-primary/50 transition-colors">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-white text-sm font-bold">DAO Voting Variance</span>
<span class="text-[#9dabb9] text-xs mt-0.5">Deviation from historical mean</span>
</div>
<span class="material-symbols-outlined text-[#9dabb9] text-[20px]">more_horiz</span>
</div>
<div class="flex items-center gap-2 mb-3">
<span class="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold border border-primary/30 uppercase">Confirmed</span>
<span class="px-1.5 py-0.5 rounded bg-[#283039] text-[#9dabb9] text-[10px] font-bold border border-[#3b4754] uppercase">Behavior</span>
</div>
<div class="flex items-center justify-between gap-4">
<div class="flex-1 flex flex-col gap-1">
<div class="flex justify-between text-[10px] text-[#9dabb9]">
<span>Conf: 0.88</span>
<span>±0.05</span>
</div>
<div class="relative h-1 w-full bg-[#283039] rounded-full">
<div class="absolute left-[83%] w-[10%] h-full bg-primary/30 rounded-full"></div>
<div class="absolute left-[88%] w-1.5 h-1.5 -top-[1px] bg-primary rounded-full border border-[#1c232b]"></div>
</div>
</div>
<div class="text-right">
<span class="text-[#5f6a7a] text-[10px] font-mono">T-2h</span>
</div>
</div>
</div>
</div>
</main>
<!-- Floating Action Button -->
<button class="absolute bottom-20 right-4 size-14 bg-primary rounded-full shadow-[0_4px_14px_rgba(19,127,236,0.5)] flex items-center justify-center text-white z-30 transition-transform active:scale-95">
<span class="material-symbols-outlined text-[28px]">add_comment</span>
</button>
<!-- Bottom Navigation -->
<nav class="h-16 bg-[#111418] border-t border-[#283039] flex items-center justify-around px-2 z-20 absolute bottom-0 w-full">
<button class="flex flex-col items-center justify-center gap-1 p-2 text-primary w-16">
<span class="material-symbols-outlined filled">radar</span>
<span class="text-[10px] font-medium">Signals</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 p-2 text-[#5f6a7a] hover:text-[#9dabb9] w-16">
<span class="material-symbols-outlined">strategy</span>
<span class="text-[10px] font-medium">Strategy</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 p-2 text-[#5f6a7a] hover:text-[#9dabb9] w-16">
<span class="material-symbols-outlined">terminal</span>
<span class="text-[10px] font-medium">Logs</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 p-2 text-[#5f6a7a] hover:text-[#9dabb9] w-16">
<span class="material-symbols-outlined">settings</span>
<span class="text-[10px] font-medium">Settings</span>
</button>
</nav>
</div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Opponent Signal Tracker"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Opponent Signal Tracker","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
