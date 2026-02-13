1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T30a7,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>JSON Override Diff View</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#136dec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101822",
                        "surface-dark": "#1C1C1E",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
                    },
                    borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
                },
            },
        }
    </script>
<style>.code-scroll::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .code-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .code-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.2);
            border-radius: 4px;
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display h-screen flex flex-col overflow-hidden selection:bg-primary/30">
<header class="shrink-0 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 z-30 shadow-sm relative">
<div class="flex items-center justify-between px-4 py-3 min-h-[60px]">
<div class="w-10"></div> 
<h1 class="text-lg font-bold leading-tight tracking-tight text-center">Comparing Overrides</h1>
<div class="w-10 flex justify-end">
<button aria-label="Close" class="flex items-center justify-center size-10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-800/50">
<span class="material-symbols-outlined text-[24px]">close</span>
</button>
</div>
</div>
<div class="px-4 pb-4">
<div class="bg-white dark:bg-[#161f2b] rounded-lg p-3 border border-slate-200 dark:border-slate-700/50 shadow-sm">
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-medium text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider">File</span>
<span class="text-sm font-medium font-mono text-slate-700 dark:text-slate-200">deployment-config.json</span>
</div>
<div class="flex justify-between items-center border-t border-slate-100 dark:border-slate-700/50 pt-2 mb-2">
<span class="text-xs font-medium text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider">Versions</span>
<div class="text-sm font-mono flex items-center">
<span class="opacity-60">v1.2</span>
<span class="mx-2 text-slate-400 material-symbols-outlined text-[14px]">arrow_forward</span>
<span class="text-primary font-bold bg-primary/10 px-1.5 rounded text-xs py-0.5">v1.3</span>
</div>
</div>
<div class="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
<button class="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors group">
<span class="material-symbols-outlined text-[16px]">content_copy</span>
<span>Original</span>
</button>
<div class="w-px bg-slate-200 dark:bg-slate-700/50 my-1"></div>
<button class="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors group">
<span class="material-symbols-outlined text-[16px]">content_copy</span>
<span>Proposed</span>
</button>
</div>
</div>
</div>
</header>
<main class="flex-1 overflow-y-auto overflow-x-hidden code-scroll bg-white dark:bg-[#0d1218] relative group/code">
<div class="flex min-h-full font-mono text-xs sm:text-sm leading-6">
<div class="shrink-0 w-10 sm:w-12 bg-slate-50 dark:bg-[#111822] border-r border-slate-200 dark:border-slate-800 flex flex-col items-end text-slate-400/60 dark:text-slate-600 select-none py-4 text-[10px] sm:text-xs">
<div class="px-2 sm:px-3">1</div>
<div class="px-2 sm:px-3">2</div>
<div class="px-2 sm:px-3">3</div>
<div class="px-2 sm:px-3">4</div>
<div class="px-2 sm:px-3">5</div>
<div class="px-2 sm:px-3">6</div>
<div class="px-2 sm:px-3">7</div>
<div class="px-2 sm:px-3">8</div>
<div class="px-2 sm:px-3">9</div>
<div class="px-2 sm:px-3">10</div>
<div class="px-2 sm:px-3">11</div>
<div class="px-2 sm:px-3">12</div>
<div class="px-2 sm:px-3">13</div>
<div class="px-2 sm:px-3">14</div>
<div class="px-2 sm:px-3">15</div>
<div class="px-2 sm:px-3">16</div>
<div class="px-2 sm:px-3">17</div>
<div class="px-2 sm:px-3">18</div>
</div>
<div class="flex-1 py-4 w-full overflow-x-auto code-scroll">
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6">
<span class="text-slate-500 dark:text-slate-400">{</span>
</div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-4 inline-block"></span><span class="text-sky-600 dark:text-sky-400">"job_id"</span>: <span class="text-amber-600 dark:text-amber-300">"893-alpha"</span>,
                </div>
<div class="flex relative bg-red-50 dark:bg-red-900/10 group items-center h-6 whitespace-nowrap">
<div class="absolute left-0 top-0 bottom-0 flex items-center justify-center w-6 sm:w-8 text-red-500/70 border-r border-transparent">
<span class="material-symbols-outlined text-[14px] font-bold">remove</span>
</div>
<div class="px-2 sm:px-4 pl-8 sm:pl-10 w-full opacity-60 grayscale-[0.3]">
<span class="w-4 inline-block"></span><span class="text-red-700 dark:text-red-400 line-through decoration-red-400/40">"instances": 2,</span>
</div>
</div>
<div class="flex relative bg-green-50 dark:bg-green-900/10 group items-center h-6 whitespace-nowrap border-l-2 border-green-500/50">
<div class="absolute left-0 top-0 bottom-0 flex items-center justify-center w-6 sm:w-8 text-green-500/70">
<span class="material-symbols-outlined text-[14px] font-bold">add</span>
</div>
<div class="px-2 sm:px-4 pl-8 sm:pl-10 w-full">
<span class="w-4 inline-block"></span><span class="text-green-700 dark:text-green-400 font-medium">"instances": 5,</span>
</div>
</div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-4 inline-block"></span><span class="text-sky-600 dark:text-sky-400">"region"</span>: <span class="text-amber-600 dark:text-amber-300">"us-east-1"</span>,
                </div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-4 inline-block"></span><span class="text-sky-600 dark:text-sky-400">"resources"</span>: {
                </div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-8 inline-block"></span><span class="text-sky-600 dark:text-sky-400">"cpu"</span>: <span class="text-amber-600 dark:text-amber-300">"2048m"</span>,
                </div>
<div class="flex relative bg-red-50 dark:bg-red-900/10 group items-center h-6 whitespace-nowrap">
<div class="absolute left-0 top-0 bottom-0 flex items-center justify-center w-6 sm:w-8 text-red-500/70">
<span class="material-symbols-outlined text-[14px] font-bold">remove</span>
</div>
<div class="px-2 sm:px-4 pl-8 sm:pl-10 w-full opacity-60 grayscale-[0.3]">
<span class="w-8 inline-block"></span><span class="text-red-700 dark:text-red-400 line-through decoration-red-400/40">"memory": "4Gi"</span>
</div>
</div>
<div class="flex relative bg-green-50 dark:bg-green-900/10 group items-center h-6 whitespace-nowrap border-l-2 border-green-500/50">
<div class="absolute left-0 top-0 bottom-0 flex items-center justify-center w-6 sm:w-8 text-green-500/70">
<span class="material-symbols-outlined text-[14px] font-bold">add</span>
</div>
<div class="px-2 sm:px-4 pl-8 sm:pl-10 w-full">
<span class="w-8 inline-block"></span><span class="text-green-700 dark:text-green-400 font-medium">"memory": "8Gi"</span>
</div>
</div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-4 inline-block"></span>},
                </div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-4 inline-block"></span><span class="text-sky-600 dark:text-sky-400">"environment"</span>: {
                </div>
<div class="flex relative bg-red-50 dark:bg-red-900/10 group items-center h-6 whitespace-nowrap">
<div class="absolute left-0 top-0 bottom-0 flex items-center justify-center w-6 sm:w-8 text-red-500/70">
<span class="material-symbols-outlined text-[14px] font-bold">remove</span>
</div>
<div class="px-2 sm:px-4 pl-8 sm:pl-10 w-full opacity-60 grayscale-[0.3]">
<span class="w-8 inline-block"></span><span class="text-red-700 dark:text-red-400 line-through decoration-red-400/40">"LOG_LEVEL": "debug"</span>
</div>
</div>
<div class="flex relative bg-green-50 dark:bg-green-900/10 group items-center h-6 whitespace-nowrap border-l-2 border-green-500/50">
<div class="absolute left-0 top-0 bottom-0 flex items-center justify-center w-6 sm:w-8 text-green-500/70">
<span class="material-symbols-outlined text-[14px] font-bold">add</span>
</div>
<div class="px-2 sm:px-4 pl-8 sm:pl-10 w-full">
<span class="w-8 inline-block"></span><span class="text-green-700 dark:text-green-400 font-medium">"LOG_LEVEL": "info"</span>
</div>
</div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-8 inline-block"></span><span class="text-sky-600 dark:text-sky-400">"SERVICE_NAME"</span>: <span class="text-amber-600 dark:text-amber-300">"control-plane-api"</span>
</div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="w-4 inline-block"></span>}
                </div>
<div class="flex px-2 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-75 items-center h-6 whitespace-nowrap">
<span class="text-slate-500 dark:text-slate-400">}</span>
</div>
</div>
</div>
<div class="h-20 w-full"></div>
</main>
<footer class="shrink-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 p-4 pb-8 z-30 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.2)]">
<div class="flex gap-4 max-w-lg mx-auto">
<button class="flex-1 px-4 py-3.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-background-dark">
                Back to Editor
            </button>
<button class="flex-1 px-4 py-3.5 rounded-lg bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark">
                Accept Changes
            </button>
</div>
</footer>

</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Json Override Diff View 1","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Runtime Status"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Json Override Diff View 1","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
