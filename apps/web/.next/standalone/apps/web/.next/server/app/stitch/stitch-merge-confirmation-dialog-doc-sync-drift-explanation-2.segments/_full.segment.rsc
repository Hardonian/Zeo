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
0:{"P":null,"b":"8ZfsPSrfgPx8SRye8yuF4","c":["","stitch","stitch-merge-confirmation-dialog-doc-sync-drift-explanation-2"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","stitch-merge-confirmation-dialog-doc-sync-drift-explanation-2","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/bc06321d88be975e.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
10:T28b0,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Doc Sync Drift Explanation</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#1e2430",
                        "code-bg": "#111318",
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
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .code-line {
            counter-increment: line;
        }
        .code-line::before {
            content: counter(line);
            display: inline-block;
            width: 1.5rem;
            margin-right: 1rem;
            text-align: right;
            color: #4b5563; 
            font-size: 0.75rem;
        }
        /* Custom scrollbar for code blocks */
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24">
<!-- Header / Navigation -->
<div class="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800">
<div class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
<span class="material-symbols-outlined">arrow_back</span>
</div>
<h2 class="text-slate-900 dark:text-white text-base font-semibold leading-tight tracking-tight flex-1 text-center pr-10">Doc Sync</h2>
<div class="absolute right-4 flex w-10 items-center justify-end">
<button class="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined">more_horiz</span>
</button>
</div>
</div>
<!-- Main Alert Banner -->
<div class="px-4 pt-6">
<div class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5 shadow-sm">
<div class="flex items-start gap-4">
<div class="bg-amber-500/20 text-amber-500 rounded-lg p-2 shrink-0">
<span class="material-symbols-outlined text-2xl">warning</span>
</div>
<div class="flex flex-col gap-1">
<h1 class="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">Documentation Drift</h1>
<div class="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
<span class="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            High Priority • Detected 2m ago
                        </div>
</div>
</div>
</div>
</div>
<!-- Reality Gap Analysis (AI Insight) -->
<div class="px-4 mt-6">
<h3 class="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-3 px-1 text-opacity-80">Reality Gap Analysis</h3>
<div class="relative overflow-hidden rounded-xl border border-primary/20 bg-surface-dark shadow-lg">
<!-- Decorative gradient for AI feel -->
<div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
<div class="relative p-5 flex flex-col gap-3">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">auto_awesome</span>
<p class="text-white text-sm font-bold">AI Insight</p>
</div>
<p class="text-slate-300 text-sm leading-relaxed">
                        The API implementation has been updated to use <span class="text-white font-mono bg-white/10 px-1 py-0.5 rounded text-xs">UUIDs</span>, but the public documentation still references <span class="text-white font-mono bg-white/10 px-1 py-0.5 rounded text-xs">integer IDs</span>. This will cause integration errors for new users.
                    </p>
</div>
</div>
</div>
<!-- Comparison View -->
<div class="px-4 mt-8 flex flex-col gap-4">
<div class="flex items-center justify-between px-1">
<h3 class="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider text-opacity-80">Evidence</h3>
<!-- View Toggle (Visual representation) -->
<div class="flex h-8 items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
<button class="flex h-full items-center justify-center rounded px-3 bg-white dark:bg-surface-dark shadow-sm text-xs font-medium text-slate-900 dark:text-white transition-all">
                        Split View
                    </button>
<button class="flex h-full items-center justify-center rounded px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
                        Unified
                    </button>
</div>
</div>
<div class="flex flex-col gap-6 relative">
<!-- Left/Top: Current Code -->
<div class="flex flex-col gap-2">
<div class="flex items-center justify-between px-1">
<span class="text-xs font-semibold text-emerald-500 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">code</span>
                            Current Code
                        </span>
<span class="text-[10px] text-slate-500 font-mono">api/users.py</span>
</div>
<div class="w-full rounded-lg border border-slate-700 bg-[#0d1117] p-4 overflow-x-auto no-scrollbar font-mono text-xs leading-6 shadow-inner relative group">
<div class="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
<div class="text-slate-300">
<div class="code-line"><span class="text-purple-400">def</span> <span class="text-blue-400">get_user</span>(</div>
<div class="code-line relative">
<span class="absolute inset-0 bg-emerald-500/10 -mx-4 border-l-2 border-emerald-500"></span>
                                    <span class="text-emerald-400 font-bold">uuid: UUID</span>,
                            </div>
<div class="code-line">    db: Session = Depends(get_db)</div>
<div class="code-line">):</div>
<div class="code-line">    <span class="text-slate-500"># Fetch user by unique identifier</span></div>
<div class="code-line">    <span class="text-purple-400">return</span> repo.get(uuid)</div>
</div>
</div>
</div>
<!-- Visual Connector -->
<div class="absolute left-6 top-[50%] -translate-y-[50%] h-8 w-[2px] bg-gradient-to-b from-emerald-500/50 to-rose-500/50 z-10 hidden sm:block"></div>
<div class="flex justify-center -my-2 opacity-50">
<span class="material-symbols-outlined text-slate-500 rotate-90">link_off</span>
</div>
<!-- Right/Bottom: Live Docs -->
<div class="flex flex-col gap-2">
<div class="flex items-center justify-between px-1">
<span class="text-xs font-semibold text-rose-500 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">description</span>
                            Live Documentation
                        </span>
<span class="text-[10px] text-slate-500 font-mono">docs/api.md</span>
</div>
<div class="w-full rounded-lg border border-slate-700 bg-[#0d1117] p-4 overflow-x-auto no-scrollbar font-mono text-xs leading-6 shadow-inner">
<div class="text-slate-300">
<div class="code-line"><span class="text-blue-400">## Get User</span></div>
<div class="code-line"></div>
<div class="code-line"><span class="text-slate-400">```http</span></div>
<div class="code-line relative">
<span class="absolute inset-0 bg-rose-500/10 -mx-4 border-l-2 border-rose-500"></span>
<span class="text-orange-400">GET</span> /users/{<span class="text-rose-400 font-bold border-b border-rose-400 border-dashed">user_id</span>}
                            </div>
<div class="code-line"><span class="text-slate-400">```</span></div>
<div class="code-line"></div>
<div class="code-line">Retrieves a single user by their <span class="text-rose-400 font-bold">integer ID</span>.</div>
</div>
</div>
</div>
</div>
</div>
<div class="h-8"></div> <!-- Spacer -->
<!-- Sticky Footer Actions -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 z-40">
<button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined text-[20px]">commit</span>
                Update Docs via PR
            </button>
<button class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all">
                Acknowledge
            </button>
</div>
</div>
</body></html>6:["$","$Lf",null,{"title":"Doc Sync Drift Explanation 2","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Action Guard"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Doc Sync Drift Explanation 2","srcDoc":"$10","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}]
