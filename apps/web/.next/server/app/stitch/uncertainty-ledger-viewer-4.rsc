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
0:{"P":null,"b":"V_sCMn05SiQGXpllElBBM","c":["","stitch","uncertainty-ledger-viewer-4"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","uncertainty-ledger-viewer-4","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T64d7,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Uncertainty Ledger Viewer</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "card-dark": "#1a2632",
                        "card-light": "#ffffff",
                        "ai-highlight": "rgba(124, 58, 237, 0.1)","ai-border": "rgba(124, 58, 237, 0.3)",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 2px;
        }#plain-language-toggle:checked ~ main .technical-term {
            display: none;
        }
        #plain-language-toggle:not(:checked) ~ main .plain-term {
            display: none;
        }#plain-language-toggle:checked ~ header label .toggle-dot {
            transform: translateX(100%);
            background-color: white;
        }
        #plain-language-toggle:checked ~ header label .toggle-bg {
            background-color: #7c3aed;}#plain-language-toggle:checked ~ main .ai-modified {
            background-color: rgba(124, 58, 237, 0.05);
            border-left-color: #7c3aed;
            position: relative;
        }#plain-language-toggle:checked ~ main .card-container {
             border-color: rgba(124, 58, 237, 0.2);
        }
        #plain-language-toggle:checked ~ header .ai-badge {
            display: flex;
        }
        #plain-language-toggle:not(:checked) ~ header .ai-badge {
            display: none;
        }.confidence-pill {
            display: none;
        }
        #plain-language-toggle:checked ~ main .confidence-pill {
            display: inline-flex;
        }
        .source-toggle {
            display: none;
        }
        #plain-language-toggle:checked ~ main .source-toggle {
            display: inline-flex;
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
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary/30">
<div class="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light dark:bg-background-dark shadow-2xl">
<input class="peer hidden" id="plain-language-toggle" type="checkbox"/>
<header class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 backdrop-blur-md">
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<div class="flex items-center gap-1.5">
<h1 class="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Research Console</h1>
<div class="hidden ai-badge items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
<span class="material-symbols-outlined text-[10px]">auto_awesome</span>
        AI Active
    </div>
</div>
<h2 class="text-sm font-bold leading-tight text-slate-900 dark:text-white technical-term">Uncertainty Ledger</h2>
<h2 class="hidden text-sm font-bold leading-tight text-slate-900 dark:text-white plain-term">Simplified Insights</h2>
</div>
<label class="flex flex-col items-center gap-1 cursor-pointer group" for="plain-language-toggle">
<div class="relative h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors toggle-bg">
<div class="absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-400 dark:bg-slate-400 transition-transform toggle-dot shadow-sm flex items-center justify-center">
<span class="material-symbols-outlined text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">auto_awesome</span>
</div>
</div>
<span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#7c3aed] transition-colors">AI Translate</span>
</label>
</header>
<main class="flex-1 overflow-y-auto pb-24">
<div class="px-4 pt-6 pb-2">
<div class="flex flex-col items-start gap-1">
<span class="text-xs font-medium uppercase tracking-wider text-primary technical-term">System Confidence</span>
<span class="hidden text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400 plain-term flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">psychology</span>
    AI Trust Score
</span>
<div class="flex w-full items-baseline justify-between">
<h2 class="font-mono text-4xl font-bold tracking-tighter text-slate-900 dark:text-white technical-term">84.2<span class="text-2xl text-slate-400">%</span></h2>
<h2 class="hidden font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white plain-term">High Reliability</h2>
<div class="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
<span class="material-symbols-outlined text-[14px]">trending_up</span>
<span class="technical-term">+2.4%</span>
<span class="hidden plain-term">Improving</span>
</div>
</div>
<p class="text-sm text-slate-500 dark:text-slate-400 technical-term">Confidence interval: 95% (±2.4%)</p>
<p class="hidden text-sm text-slate-500 dark:text-slate-400 plain-term">The system is confident in its analysis. Results are consistent within expected ranges.</p>
</div>
<div class="mt-6 grid grid-cols-2 gap-3">
<div class="flex flex-col gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark p-3 shadow-sm card-container transition-colors">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-slate-400 technical-term">blur_on</span>
<span class="hidden material-symbols-outlined text-[16px] text-purple-400 plain-term">scatter_plot</span>
<span class="text-xs font-medium text-slate-500 dark:text-slate-400 technical-term">Total Variance</span>
<span class="hidden text-xs font-medium text-slate-500 dark:text-slate-400 plain-term">Data Spread</span>
</div>
<span class="font-mono text-lg font-semibold text-slate-900 dark:text-white technical-term">σ: 0.04</span>
<span class="hidden font-display text-sm font-semibold text-slate-900 dark:text-white plain-term leading-7">Very Low (Stable)</span>
</div>
<div class="flex flex-col gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark p-3 shadow-sm card-container transition-colors">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-slate-400 technical-term">ssid_chart</span>
<span class="hidden material-symbols-outlined text-[16px] text-purple-400 plain-term">history</span>
<span class="text-xs font-medium text-slate-500 dark:text-slate-400 technical-term">Drift Rate</span>
<span class="hidden text-xs font-medium text-slate-500 dark:text-slate-400 plain-term">Change Over Time</span>
</div>
<span class="font-mono text-lg font-semibold text-slate-900 dark:text-white technical-term">1.2e-4</span>
<span class="hidden font-display text-sm font-semibold text-slate-900 dark:text-white plain-term leading-7">Negligible</span>
</div>
</div>
</div>
<div class="mt-6">
<div class="mb-3 flex items-center justify-between px-4">
<h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 technical-term">Ledger Entries</h3>
<h3 class="hidden text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 plain-term flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">auto_stories</span>
    Narrative Summary
</h3>
<button class="text-xs font-medium text-primary hover:underline">View Log</button>
</div>
<div class="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ai-modified">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors technical-term"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 technical-term">
<span class="material-symbols-outlined text-[16px]">sensors</span>
</span>
<span class="hidden size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 plain-term">
<span class="material-symbols-outlined text-[16px]">graphic_eq</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white technical-term">Measurement Noise</span>
<span class="hidden font-semibold text-slate-900 dark:text-white plain-term">Sensor Quality Issues</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white technical-term">12%</span>
<button class="source-toggle items-center justify-center text-slate-400 hover:text-purple-500 transition-colors" title="View Source Metrics">
<span class="material-symbols-outlined text-[18px]">data_object</span>
</button>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs technical-term">
<div class="flex justify-between">
<span class="text-slate-500">Sensor var</span>
<span class="font-mono text-slate-900 dark:text-slate-300">12.4ms</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">SNR</span>
<span class="font-mono text-slate-900 dark:text-slate-300">88dB</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Calibration</span>
<span class="font-mono text-green-600 dark:text-green-400">OK</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Latency</span>
<span class="font-mono text-slate-900 dark:text-slate-300">4ms</span>
</div>
</div>
<div class="hidden flex-col gap-2 plain-term mt-2">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            Minor fluctuations in data input. Sensors are calibrated correctly, but there is slight delay affecting real-time precision.
                        </p>
<div class="flex items-center gap-2">
<div class="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide confidence-pill">
<span class="material-symbols-outlined text-[10px]">check_circle</span>
                                98% Conf
                            </div>
</div>
</div>
<div class="flex flex-col gap-1 technical-term">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Low</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[12%] rounded-full bg-slate-400 dark:bg-slate-500"></div>
</div>
</div>
</div>
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ai-modified">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors technical-term"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 technical-term">
<span class="material-symbols-outlined text-[16px]">model_training</span>
</span>
<span class="hidden size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 plain-term">
<span class="material-symbols-outlined text-[16px]">psychology_alt</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white technical-term">Model Variance</span>
<span class="hidden font-semibold text-slate-900 dark:text-white plain-term">Prediction Uncertainty</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white technical-term">28%</span>
<button class="source-toggle items-center justify-center text-slate-400 hover:text-purple-500 transition-colors" title="View Source Metrics">
<span class="material-symbols-outlined text-[18px]">data_object</span>
</button>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs technical-term">
<div class="flex justify-between">
<span class="text-slate-500">Overfitting</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.02</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Param Drift</span>
<span class="font-mono text-orange-500">High</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Epoch</span>
<span class="font-mono text-slate-900 dark:text-slate-300">#942</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Loss</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.14</span>
</div>
</div>
<div class="hidden flex-col gap-2 plain-term mt-2">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            The AI model is adjusting to new patterns. While accuracy is generally good, recent parameters have shifted more than expected.
                        </p>
<div class="flex items-center gap-2">
<div class="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide confidence-pill">
<span class="material-symbols-outlined text-[10px]">check_circle</span>
                                92% Conf
                            </div>
</div>
</div>
<div class="flex flex-col gap-1 technical-term">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Med</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[28%] rounded-full bg-primary/70"></div>
</div>
</div>
</div>
<div class="group relative flex flex-col gap-3 bg-primary/[0.03] p-4 hover:bg-primary/[0.06] transition-colors ai-modified">
<div class="absolute left-0 top-0 h-full w-1 bg-primary technical-term"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-primary/20 text-primary technical-term">
<span class="material-symbols-outlined text-[16px]">area_chart</span>
</span>
<span class="hidden size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 plain-term">
<span class="material-symbols-outlined text-[16px]">crisis_alert</span>
</span>
<span class="font-semibold text-primary technical-term">Regime Shift</span>
<span class="hidden font-semibold text-slate-900 dark:text-white plain-term">Market Environment Change</span>
</div>
<span class="font-mono text-sm font-bold text-primary technical-term">45%</span>
<button class="source-toggle items-center justify-center text-slate-400 hover:text-purple-500 transition-colors" title="View Source Metrics">
<span class="material-symbols-outlined text-[18px]">data_object</span>
</button>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs technical-term">
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">Volatility</span>
<span class="font-mono text-slate-900 dark:text-white">82.4</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">Hist Corr</span>
<span class="font-mono text-slate-900 dark:text-white">-0.41</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">State</span>
<span class="font-mono text-red-500">Unstable</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500 dark:text-slate-400">Delta</span>
<span class="font-mono text-slate-900 dark:text-white">Δ 4.2</span>
</div>
</div>
<div class="hidden flex-col gap-2 plain-term mt-2">
<p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                             Significant change in the underlying environment. Current conditions are unstable and deviate sharply from historical trends (high volatility).
                        </p>
<div class="flex items-center gap-2">
<div class="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide confidence-pill">
<span class="material-symbols-outlined text-[10px]">warning</span>
                                68% Conf
                            </div>
<span class="text-[10px] font-medium text-slate-400 italic">Consult Researcher for nuance</span>
</div>
</div>
<div class="flex flex-col gap-1 technical-term">
<div class="flex justify-between text-[10px] uppercase text-primary/70">
<span>Impact Contribution</span>
<span>Critical</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[45%] rounded-full bg-primary"></div>
</div>
</div>
</div>
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ai-modified">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors technical-term"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 technical-term">
<span class="material-symbols-outlined text-[16px]">security</span>
</span>
<span class="hidden size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 plain-term">
<span class="material-symbols-outlined text-[16px]">shield</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white technical-term">Adversarial Input</span>
<span class="hidden font-semibold text-slate-900 dark:text-white plain-term">Security Threats</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white technical-term">8%</span>
<button class="source-toggle items-center justify-center text-slate-400 hover:text-purple-500 transition-colors" title="View Source Metrics">
<span class="material-symbols-outlined text-[18px]">data_object</span>
</button>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs technical-term">
<div class="flex justify-between">
<span class="text-slate-500">Vector Prob</span>
<span class="font-mono text-slate-900 dark:text-slate-300">1.2%</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Robustness</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.98</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Attempts</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Filter</span>
<span class="font-mono text-green-600 dark:text-green-400">Active</span>
</div>
</div>
<div class="hidden flex-col gap-2 plain-term mt-2">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            System is actively filtering potential malicious inputs. No successful attempts recorded. Defenses are robust.
                        </p>
<div class="flex items-center gap-2">
<div class="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide confidence-pill">
<span class="material-symbols-outlined text-[10px]">check_circle</span>
                                99% Conf
                            </div>
</div>
</div>
<div class="flex flex-col gap-1 technical-term">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Minimal</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[8%] rounded-full bg-slate-400 dark:bg-slate-500"></div>
</div>
</div>
</div>
<div class="group relative flex flex-col gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ai-modified">
<div class="absolute left-0 top-0 h-full w-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors technical-term"></div>
<div class="flex items-start justify-between">
<div class="flex items-center gap-2">
<span class="flex size-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 technical-term">
<span class="material-symbols-outlined text-[16px]">smart_toy</span>
</span>
<span class="hidden size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 plain-term">
<span class="material-symbols-outlined text-[16px]">lightbulb</span>
</span>
<span class="font-semibold text-slate-900 dark:text-white technical-term">AI-Proposal</span>
<span class="hidden font-semibold text-slate-900 dark:text-white plain-term">Information Gaps</span>
</div>
<span class="font-mono text-sm font-bold text-slate-900 dark:text-white technical-term">7%</span>
<button class="source-toggle items-center justify-center text-slate-400 hover:text-purple-500 transition-colors" title="View Source Metrics">
<span class="material-symbols-outlined text-[18px]">data_object</span>
</button>
</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs technical-term">
<div class="flex justify-between">
<span class="text-slate-500">Hallucination</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.5%</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Log-prob</span>
<span class="font-mono text-slate-900 dark:text-slate-300">-2.4</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Tokens</span>
<span class="font-mono text-slate-900 dark:text-slate-300">420</span>
</div>
<div class="flex justify-between">
<span class="text-slate-500">Temp</span>
<span class="font-mono text-slate-900 dark:text-slate-300">0.7</span>
</div>
</div>
<div class="hidden flex-col gap-2 plain-term mt-2">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            The AI generated proposal contains small uncertainties or potential "hallucinations" (0.5% risk), but remains within safe operational limits.
                        </p>
<div class="flex items-center gap-2">
<div class="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide confidence-pill">
<span class="material-symbols-outlined text-[10px]">check_circle</span>
                                85% Conf
                            </div>
</div>
</div>
<div class="flex flex-col gap-1 technical-term">
<div class="flex justify-between text-[10px] uppercase text-slate-400">
<span>Impact Contribution</span>
<span>Minimal</span>
</div>
<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
<div class="h-full w-[7%] rounded-full bg-slate-400 dark:bg-slate-500"></div>
</div>
</div>
</div>
</div>
<div class="h-24"></div>
</div>
</main>
<div class="absolute bottom-0 z-50 w-full border-t border-slate-200 dark:border-slate-800 bg-background-light/90 dark:bg-background-dark/90 px-4 py-4 backdrop-blur-md">
<div class="flex gap-3">
<button class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white transition-transform active:scale-95">
<span class="material-symbols-outlined text-[18px]">tune</span>
                    Normalize
                </button>
<button class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
<span class="material-symbols-outlined text-[18px]">download</span>
                    Export Log
                </button>
</div>
</div>
</div>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Uncertainty Ledger Viewer 4"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Uncertainty Ledger Viewer 4","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
