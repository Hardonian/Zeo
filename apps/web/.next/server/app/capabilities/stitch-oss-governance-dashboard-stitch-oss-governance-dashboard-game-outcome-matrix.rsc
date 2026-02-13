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
0:{"P":null,"b":"J_kVknmu6GSF5qixhc85u","c":["","capabilities","stitch-oss-governance-dashboard-stitch-oss-governance-dashboard-game-outcome-matrix"],"q":"","i":false,"f":[[["",{"children":["capabilities",{"children":[["slug","stitch-oss-governance-dashboard-stitch-oss-governance-dashboard-game-outcome-matrix","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/37847ea80569b263.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:T35b8,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Game Outcome Matrix</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
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
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for the matrix table */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        /* Table styles to ensure sticky headers work nicely */
        .matrix-table-container {
            overflow: auto;
            max-height: 60vh;
        }
        
        /* Subtly striped or grid lines */
        .matrix-cell {
            border-right: 1px solid rgba(59, 71, 84, 0.5);
            border-bottom: 1px solid rgba(59, 71, 84, 0.5);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col overflow-hidden">
<!-- Top App Bar -->
<header class="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111418] border-b border-gray-200 dark:border-[#283039]">
<div class="flex items-center gap-3">
<button class="text-[#111418] dark:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#283039]">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div>
<h1 class="text-base font-bold leading-tight">Prisoner's Dilemma</h1>
<p class="text-xs text-[#637588] dark:text-[#9dabb9]">Standard Matrix • 2 Players</p>
</div>
</div>
<div class="flex items-center gap-2">
<button class="text-[#111418] dark:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283039]">
<span class="material-symbols-outlined text-[20px]">ios_share</span>
</button>
<button class="text-[#111418] dark:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283039]">
<span class="material-symbols-outlined text-[20px]">settings</span>
</button>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-1 overflow-y-auto pb-24">
<!-- Strategy Selector / Controls -->
<div class="px-4 py-4 space-y-4">
<!-- Strategy Toggle -->
<div class="flex h-10 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-[#283039] p-1">
<button class="flex-1 h-full rounded-md bg-white dark:bg-[#111418] text-[#111418] dark:text-white shadow-sm text-xs font-semibold leading-normal transition-all">
                    Payoff Matrix
                </button>
<button class="flex-1 h-full rounded-md text-[#637588] dark:text-[#9dabb9] hover:text-[#111418] dark:hover:text-white text-xs font-medium leading-normal transition-all">
                    Extensive Form
                </button>
</div>
<!-- Context Info -->
<div class="flex items-center justify-between text-xs">
<span class="text-[#637588] dark:text-[#9dabb9]">Model: <span class="text-[#111418] dark:text-white font-medium">Monte Carlo (N=1000)</span></span>
<span class="text-[#637588] dark:text-[#9dabb9]">Uncertainty: <span class="text-primary font-medium">±5%</span></span>
</div>
</div>
<!-- Matrix Container -->
<div class="relative px-4 pb-4 w-full">
<div class="rounded-lg border border-[#3b4754] bg-[#111418] overflow-hidden shadow-lg">
<!-- Matrix Header (Player B) -->
<div class="flex border-b border-[#3b4754]">
<div class="w-24 shrink-0 flex items-center justify-center p-2 bg-[#1c232b] border-r border-[#3b4754]">
<span class="text-[10px] uppercase font-bold text-[#637588] tracking-wider rotate-[-45deg] origin-center">A \ B</span>
</div>
<!-- Player B Strategies Header -->
<div class="flex-1 flex overflow-hidden">
<div class="flex-1 min-w-[100px] p-3 text-center border-r border-[#3b4754] bg-[#1c232b]">
<p class="text-xs font-bold text-primary">Cooperate</p>
<p class="text-[10px] text-[#637588]">Altruistic</p>
</div>
<div class="flex-1 min-w-[100px] p-3 text-center bg-[#1c232b]">
<p class="text-xs font-bold text-[#ef4444]">Defect</p>
<p class="text-[10px] text-[#637588]">Self-interest</p>
</div>
</div>
</div>
<!-- Matrix Body -->
<!-- Row 1: A Cooperates -->
<div class="flex border-b border-[#3b4754]">
<!-- Row Header (Player A) -->
<div class="w-24 shrink-0 p-3 flex flex-col justify-center border-r border-[#3b4754] bg-[#1c232b]">
<p class="text-xs font-bold text-primary">Cooperate</p>
<p class="text-[10px] text-[#637588]">Silent</p>
</div>
<!-- Cells -->
<div class="flex-1 flex">
<!-- Cell (C, C) -->
<div class="flex-1 min-w-[100px] p-3 flex flex-col items-center justify-center border-r border-[#3b4754] relative group hover:bg-[#283039] transition-colors cursor-pointer">
<span class="text-xs font-medium text-[#9dabb9] mb-1">Pareto Optimal</span>
<div class="flex items-baseline gap-1">
<span class="text-lg font-bold text-white">3</span>
<span class="text-sm text-[#637588]">,</span>
<span class="text-lg font-bold text-white">3</span>
</div>
<span class="text-[10px] text-[#637588] mt-1">±0.15</span>
</div>
<!-- Cell (C, D) -->
<div class="flex-1 min-w-[100px] p-3 flex flex-col items-center justify-center relative group hover:bg-[#283039] transition-colors cursor-pointer bg-red-900/10">
<div class="flex items-baseline gap-1">
<span class="text-lg font-bold text-[#ef4444]">-1</span>
<span class="text-sm text-[#637588]">,</span>
<span class="text-lg font-bold text-primary">5</span>
</div>
<span class="text-[10px] text-[#637588] mt-1">±0.25</span>
</div>
</div>
</div>
<!-- Row 2: A Defects -->
<div class="flex">
<!-- Row Header (Player A) -->
<div class="w-24 shrink-0 p-3 flex flex-col justify-center border-r border-[#3b4754] bg-[#1c232b]">
<p class="text-xs font-bold text-[#ef4444]">Defect</p>
<p class="text-[10px] text-[#637588]">Confess</p>
</div>
<!-- Cells -->
<div class="flex-1 flex">
<!-- Cell (D, C) -->
<div class="flex-1 min-w-[100px] p-3 flex flex-col items-center justify-center border-r border-[#3b4754] relative group hover:bg-[#283039] transition-colors cursor-pointer bg-red-900/10">
<div class="flex items-baseline gap-1">
<span class="text-lg font-bold text-primary">5</span>
<span class="text-sm text-[#637588]">,</span>
<span class="text-lg font-bold text-[#ef4444]">-1</span>
</div>
<span class="text-[10px] text-[#637588] mt-1">±0.25</span>
</div>
<!-- Cell (D, D) -->
<div class="flex-1 min-w-[100px] p-3 flex flex-col items-center justify-center relative group hover:bg-[#283039] transition-colors cursor-pointer ring-2 ring-inset ring-primary/50 bg-primary/5">
<div class="absolute top-1 right-1">
<span class="material-symbols-outlined text-[10px] text-primary">star</span>
</div>
<span class="text-xs font-medium text-primary mb-1">Nash Eq.</span>
<div class="flex items-baseline gap-1">
<span class="text-lg font-bold text-white">1</span>
<span class="text-sm text-[#637588]">,</span>
<span class="text-lg font-bold text-white">1</span>
</div>
<span class="text-[10px] text-[#637588] mt-1">±0.05</span>
</div>
</div>
</div>
</div>
<!-- Matrix Legend -->
<div class="flex flex-wrap gap-3 mt-3 px-1">
<div class="flex items-center gap-1.5">
<div class="w-3 h-3 rounded-sm border border-primary/50 bg-primary/10"></div>
<span class="text-[10px] text-[#9dabb9]">Nash Equilibrium</span>
</div>
<div class="flex items-center gap-1.5">
<div class="w-3 h-3 rounded-sm bg-red-900/20 border border-transparent"></div>
<span class="text-[10px] text-[#9dabb9]">Dominated Strategy</span>
</div>
<div class="flex items-center gap-1.5">
<span class="text-[10px] font-bold text-primary">Blue</span>
<span class="text-[10px] text-[#9dabb9]">= Win</span>
</div>
</div>
</div>
<!-- Analysis Cards -->
<div class="px-4 space-y-4">
<h3 class="text-sm font-semibold text-white px-1">Strategic Analysis</h3>
<!-- Card 1: Dominated Strategies -->
<div class="rounded-lg border border-[#3b4754] bg-[#1c232b] p-4 flex items-start gap-4">
<div class="p-2 rounded-md bg-[#283039] text-[#9dabb9]">
<span class="material-symbols-outlined">visibility_off</span>
</div>
<div class="flex-1">
<h4 class="text-sm font-medium text-white mb-1">Strictly Dominated</h4>
<p class="text-xs text-[#9dabb9] leading-relaxed">
                        Strategy <span class="text-[#ef4444]">Cooperate</span> is strictly dominated for both players. Rational agents will always choose Defect.
                    </p>
</div>
</div>
<!-- Card 2: Simulation Stats -->
<div class="rounded-lg border border-[#3b4754] bg-[#1c232b] p-4">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#9dabb9] text-lg">analytics</span>
<h4 class="text-sm font-medium text-white">Equilibrium Stability</h4>
</div>
<span class="text-xs font-bold text-primary">99.8% Conv.</span>
</div>
<!-- Mini Bar Chart -->
<div class="flex items-end gap-1 h-16 w-full pb-2 border-b border-[#3b4754]">
<div class="w-1/4 bg-[#283039] h-[10%] rounded-t-sm relative group">
<div class="invisible group-hover:visible absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded text-white whitespace-nowrap">0.2%</div>
</div>
<div class="w-1/4 bg-[#283039] h-[5%] rounded-t-sm relative group">
<div class="invisible group-hover:visible absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded text-white whitespace-nowrap">0.1%</div>
</div>
<div class="w-1/4 bg-[#283039] h-[5%] rounded-t-sm relative group">
<div class="invisible group-hover:visible absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded text-white whitespace-nowrap">0.1%</div>
</div>
<div class="w-1/4 bg-primary h-[85%] rounded-t-sm relative group">
<div class="invisible group-hover:visible absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded text-white whitespace-nowrap">99.6%</div>
</div>
</div>
<div class="flex justify-between text-[10px] text-[#637588] mt-1 uppercase font-medium">
<span>(C,C)</span>
<span>(C,D)</span>
<span>(D,C)</span>
<span>(D,D)</span>
</div>
</div>
</div>
</main>
<!-- Bottom Sheet / Controls -->
<div class="fixed bottom-0 left-0 right-0 bg-[#111418] border-t border-[#3b4754] px-4 py-4 z-10 pb-8">
<div class="mx-auto w-12 h-1 bg-[#3b4754] rounded-full mb-4"></div>
<div class="flex items-center justify-between mb-4">
<span class="text-sm font-bold text-white">Visual Overlays</span>
<button class="text-xs text-primary font-medium">Reset Default</button>
</div>
<div class="flex flex-col gap-3">
<label class="flex items-center justify-between p-3 rounded-lg bg-[#1c232b] cursor-pointer active:bg-[#283039]">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#9dabb9]">blur_on</span>
<span class="text-sm font-medium text-white">Show Uncertainty</span>
</div>
<div class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#3b4754] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</div>
</label>
<label class="flex items-center justify-between p-3 rounded-lg bg-[#1c232b] cursor-pointer active:bg-[#283039]">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#9dabb9]">lightbulb</span>
<span class="text-sm font-medium text-white">Highlight Nash</span>
</div>
<div class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#3b4754] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</div>
</label>
<div class="grid grid-cols-2 gap-3 mt-1">
<button class="flex items-center justify-center gap-2 h-11 rounded-lg bg-[#283039] text-white text-sm font-bold active:scale-95 transition-transform">
<span class="material-symbols-outlined text-lg">edit</span>
                    Edit Payoffs
                 </button>
<button class="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white text-sm font-bold active:scale-95 transition-transform">
<span class="material-symbols-outlined text-lg">play_arrow</span>
                    Run Sim
                 </button>
</div>
</div>
</div>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L5",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Game Outcome Matrix"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Game Outcome Matrix","srcDoc":"$f","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}]
