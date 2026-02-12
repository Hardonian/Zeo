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
0:{"P":null,"b":"ncTonRn3hvG10lbw3EzX3","c":["","stitch","voi-breakdown-detail"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","voi-breakdown-detail","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T29fb,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>VOI Breakdown Detail</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Noto+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#111418", // Matching the component example
                        "surface-dark": "#283039",
                        "border-dark": "#3b4754",
                        "text-secondary": "#9dabb9",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "body": ["Noto Sans", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom Radial Progress CSS */
        .radial-progress {
            --value: 0;
            --size: 6rem;
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: 
                radial-gradient(closest-side, #283039 79%, transparent 80% 100%),
                conic-gradient(var(--tw-text-opacity, 1) #137fec calc(var(--value) * 1%), #3b4754 0);
            position: relative;
        }
        .radial-progress::before {
            content: attr(data-value);
            position: absolute;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 1.25rem;
            color: white;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased selection:bg-primary selection:text-white">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto border-x border-border-dark/50">
<!-- Header -->
<div class="sticky top-0 z-20 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-border-dark/30">
<div class="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-dark transition-colors cursor-pointer">
<span class="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
</div>
<h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center truncate px-2">
                Seismic Survey North-Block
            </h2>
<div class="flex size-10 items-center justify-center rounded-full hover:bg-surface-dark transition-colors cursor-pointer text-primary">
<span class="material-symbols-outlined text-[24px]">share</span>
</div>
</div>
<!-- Main Content Scroll Area -->
<div class="flex-1 overflow-y-auto pb-24">
<!-- Hero Metric: Expected Regret Reduction -->
<div class="px-4 py-6">
<div class="flex flex-col gap-2 rounded-xl p-6 bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark shadow-lg relative overflow-hidden group">
<!-- Decorational Glow -->
<div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
<div class="flex justify-between items-start relative z-10">
<div class="flex items-center gap-2 text-text-secondary">
<span class="material-symbols-outlined text-[20px]">currency_exchange</span>
<p class="text-sm font-medium uppercase tracking-wider">Expected Regret Reduction</p>
</div>
</div>
<div class="mt-2 relative z-10">
<p class="text-5xl font-bold tracking-tighter text-white drop-shadow-sm">$2.4M</p>
<div class="flex items-center gap-2 mt-3">
<span class="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20">
                                +15% vs Baseline
                            </span>
<span class="text-xs text-text-secondary">Significant financial impact</span>
</div>
</div>
<!-- Visual Bar -->
<div class="mt-6 h-2 w-full bg-border-dark rounded-full overflow-hidden">
<div class="h-full bg-gradient-to-r from-primary to-green-400 w-[75%] rounded-full"></div>
</div>
</div>
</div>
<!-- Secondary Metrics Grid -->
<div class="grid grid-cols-2 gap-4 px-4 mb-6">
<!-- Uncertainty Reduction -->
<div class="flex flex-col items-center justify-center gap-3 rounded-xl p-5 bg-surface-dark border border-border-dark relative">
<div class="flex items-center justify-between w-full mb-1">
<p class="text-text-secondary text-xs font-bold uppercase tracking-wide">Uncertainty</p>
<span class="material-symbols-outlined text-text-secondary text-[16px]">visibility</span>
</div>
<!-- Custom Radial Gauge -->
<div class="radial-progress text-primary" data-value="45%" style="--value:45;"></div>
<p class="text-text-secondary text-xs text-center">Reduction in unknown variables</p>
</div>
<!-- Flip Probability -->
<div class="flex flex-col justify-between gap-3 rounded-xl p-5 bg-surface-dark border border-border-dark">
<div class="flex items-center justify-between w-full mb-1">
<p class="text-text-secondary text-xs font-bold uppercase tracking-wide">Flip Chance</p>
<span class="material-symbols-outlined text-text-secondary text-[16px]">shuffle</span>
</div>
<div class="flex flex-col items-start gap-1">
<p class="text-3xl font-bold text-white">12%</p>
<span class="text-xs text-orange-400 font-medium">Low Probability</span>
</div>
<div class="w-full bg-border-dark rounded-full h-1.5 mt-2">
<div class="bg-orange-400 h-1.5 rounded-full" style="width: 12%"></div>
</div>
<p class="text-text-secondary text-xs mt-1">Likelihood decision changes</p>
</div>
</div>
<!-- Analysis Context -->
<div class="px-4 mb-6">
<div class="flex gap-4 rounded-xl border border-border-dark bg-background-dark p-5 items-start">
<div class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
<span class="material-symbols-outlined text-[20px]">lightbulb</span>
</div>
<div class="flex flex-col gap-1">
<p class="text-white text-sm font-bold leading-tight">Strategic Insight</p>
<p class="text-text-secondary text-sm font-normal leading-relaxed">
                            High value action. Strong potential to avert negative outcome. This survey significantly reduces the risk of drilling a dry hole in the western sector.
                        </p>
</div>
</div>
</div>
<!-- Assumptions Section -->
<div class="px-4 mb-8">
<div class="flex items-center justify-between mb-4">
<h3 class="text-white text-lg font-bold">Model Assumptions</h3>
<button class="text-primary text-sm font-bold hover:text-primary/80 transition-colors">Edit Model</button>
</div>
<div class="space-y-3">
<!-- Assumption Item 1 -->
<div class="group flex items-center justify-between rounded-lg bg-surface-dark p-4 border border-transparent hover:border-primary/50 transition-all cursor-pointer">
<div class="flex items-center gap-3">
<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-background-dark text-text-secondary group-hover:text-primary transition-colors">
<span class="material-symbols-outlined">water_drop</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-text-secondary uppercase font-bold tracking-wider">Oil Price</span>
<span class="text-white font-medium text-base">$80 / bbl</span>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors text-[20px]">edit</span>
</div>
<!-- Assumption Item 2 -->
<div class="group flex items-center justify-between rounded-lg bg-surface-dark p-4 border border-transparent hover:border-primary/50 transition-all cursor-pointer">
<div class="flex items-center gap-3">
<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-background-dark text-text-secondary group-hover:text-primary transition-colors">
<span class="material-symbols-outlined">check_circle</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-text-secondary uppercase font-bold tracking-wider">Base Success Rate</span>
<span class="text-white font-medium text-base">30%</span>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors text-[20px]">edit</span>
</div>
<!-- Assumption Item 3 -->
<div class="group flex items-center justify-between rounded-lg bg-surface-dark p-4 border border-transparent hover:border-primary/50 transition-all cursor-pointer">
<div class="flex items-center gap-3">
<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-background-dark text-text-secondary group-hover:text-primary transition-colors">
<span class="material-symbols-outlined">payments</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-text-secondary uppercase font-bold tracking-wider">Survey Cost</span>
<span class="text-white font-medium text-base">$500k</span>
</div>
</div>
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors text-[20px]">edit</span>
</div>
<!-- Add New -->
<button class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-dark p-3 text-sm font-medium text-text-secondary hover:bg-surface-dark hover:text-white transition-colors">
<span class="material-symbols-outlined text-[20px]">add</span>
                        Add Assumption
                    </button>
</div>
</div>
</div>
<!-- Sticky Bottom Action -->
<div class="absolute bottom-6 left-0 right-0 px-4">
<button class="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold py-4 text-base shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined">play_arrow</span>
                Execute Strategy
            </button>
</div>
</div>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Voi Breakdown Detail"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Voi Breakdown Detail","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
