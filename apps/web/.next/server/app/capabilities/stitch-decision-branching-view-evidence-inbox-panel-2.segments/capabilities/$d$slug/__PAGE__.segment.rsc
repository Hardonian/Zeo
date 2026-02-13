1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T4312,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Evidence Inbox</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#13ec5b",
                        "background-light": "#f6f8f6",
                        "background-dark": "#102216",
                        "surface-dark": "#162b1e",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #102216;
        }
        ::-webkit-scrollbar-thumb {
            background: #23482f;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #326744;
        }
        .hash-text {
            font-variant-ligatures: none;
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
<body class="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 antialiased overflow-hidden h-screen flex flex-col w-full max-w-full">
<header class="shrink-0 flex items-center justify-between px-4 py-3 bg-surface-light dark:bg-[#0b1810] border-b border-gray-200 dark:border-[#23482f] sticky top-0 z-30">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">terminal</span>
<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate">Evidence Inbox</h2>
</div>
<div class="flex items-center gap-2 px-2 py-1 bg-green-900/20 rounded-full border border-green-900/30 shrink-0">
<div class="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(19,236,91,0.6)]"></div>
<span class="text-primary text-xs font-bold uppercase tracking-wider">Live</span>
</div>
</header>
<main class="flex-1 overflow-y-auto overflow-x-hidden pb-24 w-full">
<div class="w-full max-w-3xl mx-auto">
<section class="p-4 space-y-4 border-b border-dashed border-gray-200 dark:border-[#23482f] w-full">
<div class="flex items-center justify-between mb-2">
<label class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Quick Note</label>
<div class="flex items-center gap-2">
<span class="text-[10px] text-gray-500 font-mono">MD</span>
<button aria-label="Toggle Markdown" class="w-8 h-4 rounded-full bg-[#23482f] relative transition-colors focus:outline-none">
<div class="absolute left-0.5 top-0.5 w-3 h-3 bg-primary rounded-full shadow-sm"></div>
</button>
</div>
</div>
<div class="flex flex-col w-full">
<textarea class="w-full bg-gray-50 dark:bg-[#162b1e] text-sm border-gray-200 dark:border-[#23482f] rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-[#587c65] focus:ring-1 focus:ring-primary focus:border-primary font-mono min-h-[100px] resize-none" placeholder="&gt; Enter observation or raw fact..."></textarea>
</div>
<div class="mt-4 w-full">
<label class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">Staged Evidence</label>
<div class="relative group rounded-lg border border-[#326744] bg-[#1a3324] p-3 flex flex-col gap-2 overflow-hidden w-full">
<div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(#13ec5b 1px, transparent 1px); background-size: 8px 8px;"></div>
<div class="flex items-start justify-between z-10 w-full gap-2">
<div class="flex items-center gap-3 min-w-0 flex-1">
<div class="w-10 h-10 rounded bg-[#23482f] flex items-center justify-center text-primary border border-[#326744] shrink-0">
<span class="material-symbols-outlined text-xl">data_object</span>
</div>
<div class="min-w-0">
<h4 class="text-sm font-bold text-white leading-tight truncate">audit_log_v4.json</h4>
<p class="text-xs text-gray-400 font-mono mt-0.5 truncate">2.4MB • JSON</p>
</div>
</div>
<button class="text-gray-400 hover:text-white transition-colors shrink-0 p-1">
<span class="material-symbols-outlined text-lg">close</span>
</button>
</div>
<div class="mt-1 bg-black/40 rounded border border-white/5 p-2 flex items-center gap-2 overflow-hidden">
<span class="material-symbols-outlined text-[14px] text-gray-500 shrink-0">fingerprint</span>
<code class="text-[10px] text-primary font-mono hash-text truncate leading-tight opacity-90 block w-full">
                            sha256:8f4b2e1a9c...3a1c7d2e9f
                        </code>
</div>
</div>
</div>
</section>
<section class="p-4 pt-2 w-full">
<div class="flex items-center justify-between mb-3 sticky top-0 bg-background-light dark:bg-background-dark z-20 py-2">
<h3 class="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
<span class="material-symbols-outlined text-sm">history</span>
                    Evidence Stream
                </h3>
<span class="text-xs font-mono text-gray-600 dark:text-[#587c65]">SYNCED</span>
</div>
<div class="space-y-3 w-full">
<article class="bg-white dark:bg-[#162b1e] rounded-lg border border-gray-200 dark:border-[#23482f] shadow-sm relative group overflow-hidden w-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
<div class="p-4 pb-3 flex flex-col h-full">
<div class="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
<div class="flex flex-col gap-1 min-w-0">
<div class="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-[12px]">dns</span>
<span>SysLog</span>
<span class="w-1 h-1 rounded-full bg-gray-600"></span>
<span>14:02:22 UTC</span>
</div>
<h4 class="text-base font-bold text-gray-900 dark:text-white leading-tight break-words">Network Anomaly Detected</h4>
</div>
<div class="flex items-center gap-1 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-primary self-start sm:self-auto shrink-0">
<span class="material-symbols-outlined text-[14px] filled">verified</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Verified</span>
</div>
</div>
<div class="bg-gray-50 dark:bg-black/30 rounded border border-gray-100 dark:border-white/5 p-2 mb-4">
<p class="text-xs text-gray-600 dark:text-gray-300 font-mono leading-relaxed line-clamp-2 break-all sm:break-normal">
                                [WARN] Inbound traffic spike detected on port 443. Signature matches CVE-2023-XX pattern. Source IP: 192.168.1.45...
                            </p>
</div>
<div class="grid grid-cols-2 gap-3 mt-auto">
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-[#23482f] hover:bg-[#2d5c3c] text-white text-xs font-bold uppercase tracking-wide rounded border border-transparent hover:border-primary/50 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">input</span>
                                Ingest
                            </button>
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-primary text-black text-xs font-bold uppercase tracking-wide rounded hover:bg-[#34ff76] transition-colors shadow-[0_0_10px_rgba(19,236,91,0.2)] active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">play_arrow</span>
                                Use in Run
                            </button>
</div>
</div>
</article>
<article class="bg-white dark:bg-[#162b1e] rounded-lg border border-gray-200 dark:border-[#23482f] shadow-sm relative group w-full">
<div class="absolute top-0 left-0 w-1 h-full bg-gray-400 dark:bg-[#326744]"></div>
<div class="p-4 pb-3 flex flex-col h-full">
<div class="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
<div class="flex flex-col gap-1 min-w-0">
<div class="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-[12px]">person</span>
<span>User Upload</span>
<span class="w-1 h-1 rounded-full bg-gray-600"></span>
<span>12:45:00 UTC</span>
</div>
<h4 class="text-base font-bold text-gray-900 dark:text-white leading-tight break-words">Q3 Financial Projection</h4>
</div>
<div class="flex items-center gap-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 self-start sm:self-auto shrink-0">
<span class="material-symbols-outlined text-[14px]">hourglass_empty</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Pending</span>
</div>
</div>
<div class="bg-gray-50 dark:bg-black/30 rounded border border-gray-100 dark:border-white/5 p-2 mb-4 flex items-center gap-3 overflow-hidden">
<span class="material-symbols-outlined text-gray-400 text-xl shrink-0">description</span>
<div class="flex-1 min-w-0">
<p class="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">finance_q3_forecast_final.csv</p>
<p class="text-[10px] text-gray-500 font-mono mt-0.5">145KB • CSV</p>
</div>
</div>
<div class="grid grid-cols-2 gap-3 mt-auto">
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-gray-100 dark:bg-[#23482f] hover:bg-gray-200 dark:hover:bg-[#2d5c3c] text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wide rounded border border-gray-200 dark:border-transparent transition-all active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">input</span>
                                Ingest
                            </button>
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors border border-transparent dark:border-white/5 active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">play_arrow</span>
                                Use in Run
                            </button>
</div>
</div>
</article>
<article class="bg-white dark:bg-[#162b1e] rounded-lg border border-gray-200 dark:border-[#23482f] shadow-sm relative group overflow-hidden w-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
<div class="p-4 pb-3 flex flex-col h-full">
<div class="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
<div class="flex flex-col gap-1 min-w-0">
<div class="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-[12px]">satellite_alt</span>
<span>SatNav-04</span>
<span class="w-1 h-1 rounded-full bg-gray-600"></span>
<span>09:12:44 UTC</span>
</div>
<h4 class="text-base font-bold text-gray-900 dark:text-white leading-tight break-words">Terrain Analysis: Sector 7G</h4>
</div>
<div class="flex items-center gap-1 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-primary self-start sm:self-auto shrink-0">
<span class="material-symbols-outlined text-[14px] filled">verified</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Verified</span>
</div>
</div>
<div class="relative w-full h-24 mb-4 rounded overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-900">
<div class="absolute inset-0 bg-cover bg-center opacity-70" data-alt="Satellite terrain map with green data overlay" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBW8igJwgkYtQgI1WpexVc-QbwyibbsLuPbVuND5Q-c1AdK-0DetNvKiEJNGaF-x2EL_1fblIBgsGCNwYKFNemin8ZISaiVCj_ukg5nOIXfupJ_ph3v17f1rztFeN2pcO9g-V0Wly6mWlZR-JodEEwphDMTfb8goOvvn1dr-PmtGOA2xuqKAcY09p2gG9FXKScYnJGPCrdZTL9BgIFo77qZCC5-nFAE6Wzg_R1wvzulW648VQ1Svt-B74VVLSEjHg02LEefYwmv1lQ");'></div>
<div class="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-primary backdrop-blur-sm max-w-[90%] truncate">
                                LAT: 44.52 | LON: -12.33
                            </div>
</div>
<div class="grid grid-cols-2 gap-3 mt-auto">
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-[#23482f] hover:bg-[#2d5c3c] text-white text-xs font-bold uppercase tracking-wide rounded border border-transparent hover:border-primary/50 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">input</span>
                                Ingest
                            </button>
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-primary text-black text-xs font-bold uppercase tracking-wide rounded hover:bg-[#34ff76] transition-colors shadow-[0_0_10px_rgba(19,236,91,0.2)] active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">play_arrow</span>
                                Use in Run
                            </button>
</div>
</div>
</article>
<article class="bg-white dark:bg-[#162b1e] rounded-lg border border-gray-200 dark:border-[#23482f] shadow-sm relative group opacity-60 hover:opacity-100 transition-opacity w-full">
<div class="absolute top-0 left-0 w-1 h-full bg-gray-400 dark:bg-[#326744]"></div>
<div class="p-4 pb-3 flex flex-col h-full">
<div class="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
<div class="flex flex-col gap-1 min-w-0">
<div class="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-[12px]">code</span>
<span>Daemon</span>
<span class="w-1 h-1 rounded-full bg-gray-600"></span>
<span>08:00:01 UTC</span>
</div>
<h4 class="text-base font-bold text-gray-900 dark:text-white leading-tight break-words">Cron Execution: Daily Sync</h4>
</div>
</div>
<div class="grid grid-cols-2 gap-3 mt-3">
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-gray-100 dark:bg-[#23482f] hover:bg-gray-200 dark:hover:bg-[#2d5c3c] text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wide rounded border border-gray-200 dark:border-transparent transition-all active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">input</span>
                                Ingest
                            </button>
<button class="flex items-center justify-center gap-2 py-3 sm:py-2 px-3 bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors border border-transparent dark:border-white/5 active:scale-[0.98]">
<span class="material-symbols-outlined text-sm">play_arrow</span>
                                Use in Run
                            </button>
</div>
</div>
</article>
</div>
</section>
</div>
</main>
<nav class="shrink-0 bg-surface-light dark:bg-[#0b1810] border-t border-gray-200 dark:border-[#23482f] px-6 py-2 pb-6 safe-pb z-30 w-full">
<div class="w-full max-w-3xl mx-auto">
<ul class="flex justify-between items-center">
<li>
<a class="flex flex-col items-center gap-1 text-primary p-2" href="#">
<span class="material-symbols-outlined">inbox</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Inbox</span>
</a>
</li>
<li>
<a class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors p-2" href="#">
<span class="material-symbols-outlined">dataset</span>
<span class="text-[10px] font-medium uppercase tracking-wider">Data</span>
</a>
</li>
<li class="-mt-8">
<button class="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_15px_rgba(19,236,91,0.4)] hover:scale-105 transition-transform active:scale-95">
<span class="material-symbols-outlined text-3xl">add</span>
</button>
</li>
<li>
<a class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors p-2" href="#">
<span class="material-symbols-outlined">network_node</span>
<span class="text-[10px] font-medium uppercase tracking-wider">Graph</span>
</a>
</li>
<li>
<a class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors p-2" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="text-[10px] font-medium uppercase tracking-wider">Config</span>
</a>
</li>
</ul>
</div>
</nav>

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Evidence Inbox Panel 2"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Decision Intelligence"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Evidence Inbox Panel 2","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
