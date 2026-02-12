1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T2ac6,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Signed Packet Receipt</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#13c8ec",
                        "primary-dark": "#0ea5c3",
                        "background-light": "#f6f8f8",
                        "background-dark": "#0f172a",
                        "surface-dark": "#1e293b",
                        "emerald-accent": "#10b981",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    boxShadow: {
                        'glow': '0 0 15px rgba(19, 200, 236, 0.3)',
                    }
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for data lists */
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(19, 200, 236, 0.3);
            border-radius: 2px;
        }
        
        /* Monospace font utility for specific data */
        .font-mono-data {
            font-family: 'JetBrains Mono', monospace;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased">
<!-- Top Status Header -->
<header class="pt-12 pb-6 px-6 flex flex-col items-center justify-center bg-white dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/60">
<div class="flex items-center gap-3 mb-2">
<span class="material-symbols-outlined text-emerald-accent text-3xl filled" style="font-variation-settings: 'FILL' 1;">
                check_circle
            </span>
<h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Export Verified</h1>
</div>
<p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Packet signed and sealed successfully.</p>
</header>
<!-- Scrollable Content Area -->
<main class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-32">
<!-- Master Manifest Card -->
<div class="mt-6 mb-8 relative group">
<div class="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-emerald-accent/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
<div class="relative bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg">
<div class="flex items-center justify-between mb-3">
<h2 class="text-xs font-bold text-primary tracking-wider uppercase">Master Manifest</h2>
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-accent/10 text-emerald-accent border border-emerald-accent/20">VALID</span>
</div>
<div class="mb-4">
<p class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Root Hash (SHA-256)</p>
<div class="bg-slate-100 dark:bg-[#0b1120] p-3 rounded-lg border border-slate-200 dark:border-slate-800">
<p class="font-mono-data text-xs leading-relaxed text-slate-600 dark:text-slate-300 break-all">
                            e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                        </p>
</div>
</div>
<div class="flex gap-2">
<button class="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
<span class="material-symbols-outlined text-[16px]">content_copy</span>
                        Copy Hash
                    </button>
<button class="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
<span class="material-symbols-outlined text-[16px]">verified_user</span>
                        Verify On-Chain
                    </button>
</div>
</div>
</div>
<!-- File Payload Section -->
<div class="mb-8">
<h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 px-1 flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">folder_zip</span>
                Packet Payload
                <span class="ml-auto text-xs font-normal text-slate-500">3 Files • 1.4 MB</span>
</h3>
<div class="flex flex-col gap-3">
<!-- File Item 1 -->
<div class="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-start gap-3">
<div class="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-indigo-400">data_object</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">logic_graph.json</p>
<span class="text-xs text-slate-500">24 KB</span>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-400 font-mono-data bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                                0xa1b2...c3d4
                            </span>
<span class="material-symbols-outlined text-[14px] text-emerald-accent">check_circle</span>
</div>
</div>
</div>
<!-- File Item 2 -->
<div class="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-start gap-3">
<div class="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-emerald-400">table_chart</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">evidence_trail.csv</p>
<span class="text-xs text-slate-500">1.2 MB</span>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-400 font-mono-data bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                                0xf5e6...7g8h
                            </span>
<span class="material-symbols-outlined text-[14px] text-emerald-accent">check_circle</span>
</div>
</div>
</div>
<!-- File Item 3 -->
<div class="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-start gap-3">
<div class="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-amber-400">lock</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">node_signatures.pem</p>
<span class="text-xs text-slate-500">4 KB</span>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-400 font-mono-data bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                                0x9i0j...k1l2
                            </span>
<span class="material-symbols-outlined text-[14px] text-emerald-accent">check_circle</span>
</div>
</div>
</div>
</div>
</div>
<!-- Provenance Chain -->
<div class="border-t border-slate-200 dark:border-slate-800 pt-6">
<h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Provenance Chain</h3>
<div class="grid grid-cols-2 gap-4">
<div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
<div class="flex items-center gap-1.5 text-slate-400 mb-1">
<span class="material-symbols-outlined text-[16px]">dns</span>
<span class="text-[10px] uppercase font-bold">Origin Node</span>
</div>
<p class="font-mono-data text-xs text-primary font-medium truncate">ZEO-NODE-NY-04</p>
</div>
<div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
<div class="flex items-center gap-1.5 text-slate-400 mb-1">
<span class="material-symbols-outlined text-[16px]">schedule</span>
<span class="text-[10px] uppercase font-bold">Timestamp (UTC)</span>
</div>
<p class="font-mono-data text-xs text-slate-200 font-medium truncate">2023-10-27T14:30:00Z</p>
</div>
<div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 col-span-2 flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[18px]">key</span>
<span class="text-xs text-slate-400 font-medium">ECDSA Signature Verified</span>
</div>
<span class="flex h-2 w-2 relative">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
</span>
</div>
</div>
</div>
</main>
<!-- Sticky Bottom Action Bar -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 z-30 safe-area-bottom">
<div class="flex flex-col gap-3 max-w-md mx-auto w-full">
<button class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow active:scale-[0.98]">
<span class="material-symbols-outlined text-lg">download</span>
                Download Packet (.zip)
            </button>
<button class="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold py-3 px-6 rounded-xl transition-colors text-sm">
                Close
            </button>
</div>
<!-- Safe area spacer for iOS home indicator -->
<div class="h-1"></div>
</div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Signed Packet Receipt & Manifest"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Signed Packet Receipt & Manifest","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
