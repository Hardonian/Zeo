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
0:{"P":null,"b":"V_sCMn05SiQGXpllElBBM","c":["","stitch","sensitivity-and-flip-thresholds-panel"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","sensitivity-and-flip-thresholds-panel","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T3619,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Sensitivity Analysis</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1258e2",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "card-dark": "#1a2332",
                        "risk-high": "#fbbf24", // Amber
                        "risk-low": "#14b8a6", // Teal
                        "risk-critical": "#ef4444", // Red
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom range slider styling */
        .range-thumb {
            -webkit-appearance: none;
            pointer-events: none;
        }
        .range-thumb::-webkit-slider-thumb {
            pointer-events: auto;
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            margin-top: -6px;
            box-shadow: 0 0 0 2px rgba(0,0,0,0.5);
        }
        /* Hide scrollbar for clean horizontal scroll */
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
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased">
<!-- Top Navigation -->
<header class="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
<div class="flex items-center justify-between px-4 py-3">
<button class="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<h1 class="text-base font-bold tracking-tight">Sensitivity Analysis</h1>
<button class="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-2xl">tune</span>
</button>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col w-full max-w-md mx-auto p-4 pb-24 gap-6">
<!-- Decision Fragility Dashboard -->
<section class="bg-card-dark rounded-2xl p-6 shadow-lg border border-slate-800 relative overflow-hidden group">
<div class="absolute top-0 right-0 w-32 h-32 bg-risk-high/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div>
<h2 class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Decision Fragility</h2>
<div class="flex items-baseline gap-2">
<span class="text-5xl font-bold text-white tracking-tighter">72%</span>
<span class="text-risk-high font-bold text-sm bg-risk-high/10 px-2 py-0.5 rounded flex items-center gap-1">
<span class="material-symbols-outlined text-sm">warning</span>
                            High Risk
                        </span>
</div>
</div>
<!-- Mini Donut Chart Representation -->
<div class="relative w-16 h-16 flex items-center justify-center">
<svg class="w-full h-full transform -rotate-90">
<circle class="text-slate-700" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-width="4"></circle>
<circle cx="32" cy="32" fill="transparent" r="28" stroke="#fbbf24" stroke-dasharray="175.9" stroke-dashoffset="49.2" stroke-linecap="round" stroke-width="4"></circle>
</svg>
</div>
</div>
<p class="text-slate-400 text-sm leading-relaxed relative z-10">
                Your current strategy is highly sensitive to 3 key assumptions. A minor shift in belief could flip the optimal decision.
            </p>
</section>
<!-- Filters -->
<div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
<button class="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold border border-primary/30 whitespace-nowrap">
<span class="material-symbols-outlined text-lg">priority_high</span>
                Most Fragile
            </button>
<button class="flex items-center gap-2 px-4 py-2 bg-card-dark text-slate-300 rounded-full text-sm font-medium border border-slate-700 whitespace-nowrap hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-lg">trending_up</span>
                Highest Impact
            </button>
<button class="flex items-center gap-2 px-4 py-2 bg-card-dark text-slate-300 rounded-full text-sm font-medium border border-slate-700 whitespace-nowrap hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-lg">new_releases</span>
                Newest Beliefs
            </button>
</div>
<!-- Critical Flip-Thresholds List -->
<section class="flex flex-col gap-4">
<h3 class="text-lg font-bold text-white px-1">Critical Flip-Thresholds</h3>
<!-- Card 1: Critical/Fragile -->
<div class="bg-card-dark rounded-xl p-5 border border-risk-high/30 shadow-lg relative overflow-hidden">
<!-- Status Indicator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-risk-high"></div>
<div class="flex justify-between items-start mb-4 pl-2">
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2">
<span class="font-mono text-xs text-risk-high bg-risk-high/10 px-1.5 py-0.5 rounded border border-risk-high/20">ASSUMPTION_04</span>
<span class="text-xs text-slate-400">Market Growth Rate</span>
</div>
<div class="text-white font-semibold text-base mt-1">Growth drops below 3.2%</div>
</div>
<div class="flex flex-col items-end">
<span class="text-xs font-medium text-slate-400 uppercase tracking-wide">Buffer</span>
<span class="text-risk-high font-bold font-mono">+3%</span>
</div>
</div>
<!-- Slider Visualization Area -->
<div class="pl-2 pt-2 pb-1">
<div class="relative h-12 w-full select-none">
<!-- Track Background -->
<div class="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-700 rounded-full -translate-y-1/2 overflow-hidden">
<!-- Danger Zone Gradient -->
<div class="absolute left-0 h-full w-[48%]" style="background: linear-gradient(90deg, #1a2332 0%, #fbbf24 100%); opacity: 0.5;"></div>
</div>
<!-- Threshold Marker (The Flip Point) -->
<div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-help z-10" style="left: 48%;">
<div class="h-4 w-0.5 bg-risk-high"></div> <!-- Vertical Line -->
<div class="w-3 h-3 rotate-45 border-2 border-risk-high bg-card-dark -mt-1.5"></div> <!-- Diamond -->
<span class="absolute -top-7 text-[10px] font-mono text-risk-high whitespace-nowrap opacity-100 transition-opacity bg-background-dark/90 px-1 rounded">Threshold: 48%</span>
</div>
<!-- Current Belief Handle (User Draggable) -->
<div class="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center" style="left: 45%;">
<div class="w-5 h-5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-slate-900 cursor-grab active:cursor-grabbing flex items-center justify-center">
<div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
</div>
<span class="absolute top-7 text-[10px] font-mono text-white font-bold whitespace-nowrap">45%</span>
</div>
<!-- Connection Line (Visualizing the buffer) -->
<div class="absolute top-1/2 -translate-y-1/2 h-0.5 bg-risk-high/50" style="left: 45%; width: 3%;"></div>
</div>
<div class="flex justify-between mt-2 text-[10px] text-slate-500 font-mono uppercase">
<span>Pessimistic (0%)</span>
<span>Optimistic (100%)</span>
</div>
</div>
</div>
<!-- Card 2: Moderate Risk -->
<div class="bg-card-dark rounded-xl p-5 border border-slate-700 shadow-md relative overflow-hidden">
<!-- Status Indicator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-slate-500"></div>
<div class="flex justify-between items-start mb-4 pl-2">
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2">
<span class="font-mono text-xs text-slate-300 bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-600">ASSUMPTION_09</span>
<span class="text-xs text-slate-400">Competitor Response</span>
</div>
<div class="text-white font-semibold text-base mt-1">Launch Delay &gt; 2mo</div>
</div>
<div class="flex flex-col items-end">
<span class="text-xs font-medium text-slate-400 uppercase tracking-wide">Buffer</span>
<span class="text-white font-bold font-mono">+20%</span>
</div>
</div>
<!-- Slider Visualization Area -->
<div class="pl-2 pt-2 pb-1">
<div class="relative h-12 w-full select-none">
<!-- Track -->
<div class="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-700 rounded-full -translate-y-1/2"></div>
<!-- Threshold Marker -->
<div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10" style="left: 40%;">
<div class="h-4 w-0.5 bg-slate-400"></div>
<div class="w-3 h-3 rotate-45 border-2 border-slate-400 bg-card-dark -mt-1.5"></div>
<span class="absolute -top-7 text-[10px] font-mono text-slate-400 whitespace-nowrap">Threshold: 40%</span>
</div>
<!-- Current Belief Handle -->
<div class="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center" style="left: 60%;">
<div class="w-5 h-5 rounded-full bg-white shadow-lg border-2 border-slate-900 cursor-grab flex items-center justify-center">
<div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
</div>
<span class="absolute top-7 text-[10px] font-mono text-white font-bold whitespace-nowrap">60%</span>
</div>
<!-- Connection Line -->
<div class="absolute top-1/2 -translate-y-1/2 h-0.5 bg-white/30 border-t border-b border-white/10" style="left: 40%; width: 20%;"></div>
</div>
</div>
</div>
<!-- Card 3: Stable/Safe -->
<div class="bg-card-dark rounded-xl p-5 border border-slate-800 shadow-md relative overflow-hidden opacity-90">
<!-- Status Indicator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-risk-low"></div>
<div class="flex justify-between items-start mb-4 pl-2">
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2">
<span class="font-mono text-xs text-risk-low bg-risk-low/10 px-1.5 py-0.5 rounded border border-risk-low/20">ASSUMPTION_01</span>
<span class="text-xs text-slate-400">Regulatory Approval</span>
</div>
<div class="text-white font-semibold text-base mt-1">License granted Q1</div>
</div>
<div class="flex flex-col items-end">
<span class="text-xs font-medium text-slate-400 uppercase tracking-wide">Buffer</span>
<span class="text-risk-low font-bold font-mono">+70%</span>
</div>
</div>
<!-- Slider Visualization Area -->
<div class="pl-2 pt-2 pb-1">
<div class="relative h-12 w-full select-none">
<!-- Track -->
<div class="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-700 rounded-full -translate-y-1/2 overflow-hidden">
<!-- Safe Zone Gradient -->
<div class="absolute right-0 h-full w-[80%]" style="background: linear-gradient(90deg, #1a2332 0%, #14b8a6 100%); opacity: 0.3;"></div>
</div>
<!-- Threshold Marker -->
<div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10" style="left: 20%;">
<div class="h-4 w-0.5 bg-risk-low"></div>
<div class="w-3 h-3 rotate-45 border-2 border-risk-low bg-card-dark -mt-1.5"></div>
<span class="absolute -top-7 text-[10px] font-mono text-risk-low whitespace-nowrap">Threshold: 20%</span>
</div>
<!-- Current Belief Handle -->
<div class="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center" style="left: 90%;">
<div class="w-5 h-5 rounded-full bg-white shadow-lg border-2 border-slate-900 cursor-grab flex items-center justify-center">
<div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
</div>
<span class="absolute top-7 text-[10px] font-mono text-white font-bold whitespace-nowrap">90%</span>
</div>
<!-- Connection Line -->
<div class="absolute top-1/2 -translate-y-1/2 h-0.5 bg-risk-low/50 dashed" style="left: 20%; width: 70%;"></div>
</div>
</div>
</div>
</section>
</main>
<!-- Fixed Action Footer -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/95 backdrop-blur-xl border-t border-slate-800 z-30">
<div class="max-w-md mx-auto w-full flex flex-col gap-2">
<div class="flex justify-between items-center px-1 mb-1">
<span class="text-xs text-slate-400">Simulation Mode Active</span>
<span class="text-xs text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-sm">history</span>
                    Changes Unsaved
                </span>
</div>
<button class="w-full bg-primary hover:bg-blue-600 text-white font-bold text-lg h-14 rounded-xl shadow-[0_4px_14px_0_rgba(18,88,226,0.39)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
<span class="material-symbols-outlined">refresh</span>
                Re-run Analysis
            </button>
</div>
</div>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Sensitivity & Flip Thresholds Panel"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Sensitivity & Flip Thresholds Panel","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
