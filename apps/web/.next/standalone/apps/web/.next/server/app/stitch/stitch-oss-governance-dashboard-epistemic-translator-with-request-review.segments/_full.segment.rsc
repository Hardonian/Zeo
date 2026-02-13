1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-17b4afe27e88d3cd.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/bc06321d88be975e.css","style"]
0:{"P":null,"b":"8ZfsPSrfgPx8SRye8yuF4","c":["","stitch","stitch-oss-governance-dashboard-epistemic-translator-with-request-review"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","stitch-oss-governance-dashboard-epistemic-translator-with-request-review","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/bc06321d88be975e.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
10:T42b7,<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Epistemic Translator Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "plain-lang": "#10b981", 
                        "ai-accent": "#8b5cf6",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                    animation: {
                        'scan-line': 'scan 2s linear infinite',
                    },
                    keyframes: {
                        scan: {
                            '0%': { top: '0%' },
                            '100%': { top: '100%' },
                        }
                    }
                },
            },
        }
    </script>
<style>
        body {
            min-height: max(884px, 100dvh);
        }
        .ai-badge {
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        }
        .scanning-overlay {
            background: linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.1) 50%, transparent);
            pointer-events: none;
        }.tooltip-container {
            position: relative;
        }
        .tooltip-text {
            visibility: hidden;
            width: 140px;
            background-color: #334155;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px;
            position: absolute;
            z-index: 100;
            bottom: 125%;
            left: 50%;
            margin-left: -70px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 0.7rem;
            line-height: 1.2;
        }
        .tooltip-container:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex justify-center">
<div class="relative w-full max-w-md h-full min-h-screen bg-white dark:bg-[#1a2632] shadow-2xl overflow-x-hidden flex flex-col">
<header class="flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-sm z-20 border-b border-slate-100 dark:border-slate-800">
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<h1 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Epistemic Translator</h1>
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">settings</span>
</button>
</header>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-[65px] z-10 backdrop-blur-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-ai-accent text-[20px] fill-1">smart_toy</span>
<span class="text-slate-900 dark:text-white font-semibold text-sm">Real-time AI Translate</span>
</div>
<button class="relative group overflow-hidden bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm transition-all border border-slate-200 dark:border-slate-600" data-action="trigger-translation">
<div class="absolute inset-0 bg-gradient-to-r from-ai-accent/0 via-ai-accent/30 to-ai-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
<span class="material-symbols-outlined text-[18px]">auto_fix_high</span>
<span class="text-xs font-bold uppercase tracking-wide">Translate</span>
</button>
</div>
<div class="px-5 py-4 relative">
<div class="relative flex items-center w-full h-12 rounded-xl focus-within:ring-2 focus-within:ring-ai-accent/50 shadow-sm bg-slate-100 dark:bg-slate-800 overflow-hidden border border-transparent focus-within:border-ai-accent/20">
<div class="grid place-items-center h-full w-12 text-slate-400 dark:text-slate-500">
<span class="material-symbols-outlined text-[24px]">search</span>
</div>
<input class="peer h-full w-full outline-none text-sm text-slate-700 dark:text-slate-200 pr-2 bg-transparent placeholder-slate-400 dark:placeholder-slate-500" id="search" placeholder="Search jargon (e.g. Heteroskedasticity)..." type="text"/>
</div>
<div class="mt-3 flex justify-end">
<button class="flex items-center gap-1 text-ai-accent text-xs font-semibold hover:text-ai-accent/80 transition-colors">
<span class="material-symbols-outlined text-[16px]">tune</span>
                    Refine Simplification Level
                 </button>
</div>
</div>
<main class="flex-1 px-5 pb-8 space-y-6 relative" data-bind="content-area">
<div class="absolute inset-0 pointer-events-none z-0 opacity-0 scanning-overlay"></div>
<button class="w-full group relative overflow-hidden bg-gradient-to-r from-ai-accent to-indigo-600 rounded-xl p-4 shadow-lg shadow-indigo-500/20 text-left transition-all hover:shadow-indigo-500/30 z-10">
<div class="relative z-10 flex items-center justify-between">
<div>
<div class="flex items-center gap-2 mb-1">
<h3 class="text-white font-bold text-base">Executive Summary</h3>
<span class="bg-white/20 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium border border-white/10">AI Generated</span>
</div>
<p class="text-indigo-100 text-xs">Convert current report data into a 1-page plain language brief.</p>
</div>
<div class="bg-white/20 p-2 rounded-full backdrop-blur-sm">
<span class="material-symbols-outlined text-white text-[24px]">description</span>
</div>
</div>
<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
</button>
<section class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm z-10 relative">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-ai-accent text-[20px]">equalizer</span>
<h3 class="text-slate-900 dark:text-white text-sm font-semibold">Certainty Scale</h3>
</div>
<div class="flex items-center gap-1 px-2 py-0.5 rounded bg-ai-accent/10 border border-ai-accent/20">
<span class="material-symbols-outlined text-ai-accent text-[12px]">auto_awesome</span>
<span class="text-ai-accent text-[10px] font-bold uppercase">Translated</span>
</div>
</div>
<div class="mb-2">
<p class="text-slate-600 dark:text-slate-300 text-xs mb-3">
<span class="bg-yellow-100 dark:bg-yellow-900/30 text-slate-800 dark:text-slate-200 px-1 rounded">Confidence Intervals</span>
<span class="material-symbols-outlined text-[12px] text-slate-400 mx-1 align-middle">arrow_forward</span>
                        How sure we are:
                    </p>
</div>
<div class="relative w-full h-12 flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg px-3 border border-slate-100 dark:border-slate-700">
<div class="flex-1 flex flex-col items-center border-r border-slate-200 dark:border-slate-700 opacity-40">
<span class="text-[10px] uppercase font-bold text-slate-500">Unsure</span>
<div class="w-2 h-2 rounded-full bg-slate-300 mt-1"></div>
</div>
<div class="flex-1 flex flex-col items-center border-r border-slate-200 dark:border-slate-700 opacity-40">
<span class="text-[10px] uppercase font-bold text-slate-500">Likely</span>
<div class="w-2 h-2 rounded-full bg-slate-300 mt-1"></div>
</div>
<div class="flex-1 flex flex-col items-center">
<span class="text-[10px] uppercase font-bold text-ai-accent">Verified</span>
<div class="w-3 h-3 rounded-full bg-ai-accent shadow-md shadow-ai-accent/40 mt-1 ring-2 ring-ai-accent/20"></div>
</div>
</div>
</section>
<section class="space-y-4 z-10 relative">
<div class="flex items-center justify-between">
<h3 class="text-slate-900 dark:text-white text-base font-bold flex items-center gap-2">
                        Detected Jargon
                        <span class="ai-badge text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">AI Active</span>
</h3>
</div>
<article class="bg-white dark:bg-slate-800 rounded-xl border border-ai-accent/30 shadow-sm overflow-hidden ring-1 ring-ai-accent/10">
<div class="p-4 bg-ai-accent/5 border-b border-ai-accent/10 relative overflow-hidden">
<div class="absolute top-0 right-0 p-2 opacity-50">
<span class="material-symbols-outlined text-ai-accent/20 text-[64px] translate-x-4 -translate-y-4">psychology</span>
</div>
<div class="flex items-center justify-between mb-2 relative z-10">
<div class="flex items-center gap-1.5">
<span class="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
<span class="material-symbols-outlined text-[10px]">auto_awesome</span> AI
                                </span>
<span class="text-xs font-bold text-ai-accent uppercase tracking-wide">Plain English</span>
</div>
<div class="tooltip-container flex items-center gap-1">
<span class="text-[10px] uppercase font-bold text-ai-accent/80 tracking-tight">Confidence</span>
<div class="flex gap-0.5" data-bind="confidence-meter-high">
<div class="w-1.5 h-3 bg-ai-accent rounded-sm"></div>
<div class="w-1.5 h-3 bg-ai-accent rounded-sm"></div>
<div class="w-1.5 h-3 bg-ai-accent rounded-sm"></div>
</div>
<span class="tooltip-text">High confidence. Term matches verified definition.</span>
</div>
</div>
<h4 class="text-slate-900 dark:text-white text-lg font-bold relative z-10">"Uneven Variability"</h4>
<p class="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed relative z-10">
                             Imagine a delivery driver who is usually on time (low variance) but gets wildy unpredictable during rush hour (high variance). The reliability changes based on the situation.
                        </p>
</div>
<div class="p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[16px]">code</span>
<span class="text-xs font-mono text-slate-500 line-through decoration-slate-400">Heteroskedasticity</span>
</div>
<button class="text-[10px] text-slate-400 hover:text-ai-accent underline decoration-dashed">Original</button>
</div>
</article>
<article class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-ai-accent/30 transition-colors">
<div class="p-4 bg-white dark:bg-slate-800 relative group">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-1.5">
<span class="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
<span class="material-symbols-outlined text-[10px]">auto_awesome</span> AI
                                </span>
<span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Plain English</span>
</div>
<div class="tooltip-container flex items-center gap-1">
<span class="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Confidence</span>
<div class="flex gap-0.5" data-bind="confidence-meter-med">
<div class="w-1.5 h-3 bg-amber-400 rounded-sm"></div>
<div class="w-1.5 h-3 bg-amber-400 rounded-sm"></div>
<div class="w-1.5 h-3 bg-slate-200 dark:bg-slate-600 rounded-sm"></div>
</div>
<span class="tooltip-text">Medium confidence. Context implies statistical use, but could be general.</span>
</div>
</div>
<h4 class="text-slate-900 dark:text-white text-lg font-bold">"The Surprise Factor"</h4>
<p class="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                             How surprised should you be by this result if nothing special was actually happening? Lower means more surprised.
                        </p>
</div>
<div class="p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[16px]">code</span>
<span class="text-xs font-mono text-slate-500 line-through decoration-slate-400">p-value</span>
</div>
<button class="text-[10px] text-slate-400 hover:text-ai-accent underline decoration-dashed">Original</button>
</div>
</article>
<article class="bg-white dark:bg-slate-800 rounded-xl border border-amber-500/30 shadow-sm overflow-hidden ring-1 ring-amber-500/20">
<div class="p-4 bg-white dark:bg-slate-800 relative group">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-1.5">
<span class="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
<span class="material-symbols-outlined text-[10px]">auto_awesome</span> AI
                                </span>
<span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Plain English</span>
</div>
<div class="tooltip-container flex items-center gap-1">
<span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 tracking-tight">Low Confidence</span>
<div class="flex gap-0.5" data-bind="confidence-meter-low">
<div class="w-1.5 h-3 bg-red-500 rounded-sm"></div>
<div class="w-1.5 h-3 bg-slate-200 dark:bg-slate-600 rounded-sm"></div>
<div class="w-1.5 h-3 bg-slate-200 dark:bg-slate-600 rounded-sm"></div>
</div>
<span class="tooltip-text">Caution: Complex technical nuance may be lost in simplification.</span>
</div>
</div>
<h4 class="text-slate-900 dark:text-white text-lg font-bold">"Crying Wolf"</h4>
<p class="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                            The system claims there is a problem when everything is actually fine. <span class="text-amber-600 text-xs italic">(Simplification may lack precision)</span>
</p>
</div>
<div class="p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[16px]">code</span>
<span class="text-xs font-mono text-slate-500 line-through decoration-slate-400">Type I Error</span>
</div>
<button class="text-[10px] text-slate-400 hover:text-ai-accent flex items-center gap-1 border border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded transition-colors mr-2" data-action="request-review">
<span class="material-symbols-outlined text-[12px]">rate_review</span>
Request Review
</button><button class="text-[10px] text-slate-400 hover:text-ai-accent underline decoration-dashed">Original</button>
</div>
</article>
</section>
<div class="mt-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
<div class="inline-flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-sm mb-3">
<span class="material-symbols-outlined text-ai-accent text-[20px]">psychology_alt</span>
</div>
<h4 class="text-slate-900 dark:text-white font-bold text-sm mb-1">Needs more context?</h4>
<p class="text-slate-500 dark:text-slate-400 text-xs mb-4">Ask the AI to generate a custom analogy based on your industry.</p>
<button class="w-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[16px]">chat_spark</span>
                    Generate Custom Analogy
                </button>
</div>
</main>
<div class="h-4 w-full bg-transparent"></div>
</div>
</body></html>6:["$","$Lf",null,{"title":"Epistemic Translator With Request Review","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Governance & Compliance"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Epistemic Translator With Request Review","srcDoc":"$10","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}]
