1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3388,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Inline Cell Annotations</title>
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
              "surface-dark": "#1A2230",
              "gutter-dark": "#0D121C",
            },
            fontFamily: {
              "display": ["Space Grotesk", "sans-serif"],
              "mono": ["Space Mono", "monospace"],
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Space+Mono:wght@400;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        /* Custom scrollbar for code blocks to keep it clean on mobile */
        .code-scroll::-webkit-scrollbar {
            height: 4px;
        }
        .code-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .code-scroll::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden relative">
<!-- Top App Bar (iOS Style) -->
<header class="sticky top-0 z-50 bg-background-light/90 dark:bg-[#111722]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
<!-- Status Bar Area Spacer (Safe Area) -->
<div class="h-2 w-full"></div>
<div class="flex items-center justify-between px-4 py-3">
<button class="text-slate-600 dark:text-white flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined" style="font-size: 24px;">arrow_back_ios_new</span>
</button>
<div class="flex flex-col items-center">
<h1 class="text-sm font-bold tracking-tight">Production_Runbook.ipynb</h1>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
</span>
<span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Kernel</span>
</div>
</div>
<button class="text-primary font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                Edit
            </button>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto pb-24 px-2 sm:px-4 pt-6">
<!-- Notebook Meta Info -->
<div class="mx-2 mb-6 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm">
<div class="flex items-start gap-4">
<div class="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shrink-0 shadow-lg" data-alt="Gradient avatar representing the AI agent">
<span class="material-symbols-outlined text-white" style="font-size: 20px;">smart_toy</span>
</div>
<div class="flex-1 min-w-0">
<h2 class="text-sm font-bold text-slate-800 dark:text-white">Autonomic Agent 01</h2>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        Currently monitoring latency thresholds across US-East-1 nodes. Scaling protocols are active.
                    </p>
</div>
</div>
</div>
<!-- Inline Cell Container -->
<div class="relative w-full max-w-lg mx-auto">
<!-- Cell Wrapper -->
<div class="flex gap-2 relative">
<!-- Gutter: Annotations -->
<div class="w-10 pt-[52px] flex flex-col items-center gap-6 shrink-0 z-10">
<!-- Network Badge (Subtle) -->
<div class="group relative flex items-center justify-center">
<div class="text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors cursor-help">
<span class="material-symbols-outlined" style="font-size: 20px;">public</span>
</div>
<!-- Tooltip indicator dot -->
<div class="absolute -right-1 top-0 w-1 h-1 bg-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<!-- Disk Badge (Subtle) -->
<div class="group relative flex items-center justify-center">
<div class="text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors cursor-help">
<span class="material-symbols-outlined" style="font-size: 20px;">save</span>
</div>
</div>
<!-- Brain Badge (Active/Highlighted) -->
<button class="relative group outline-none" id="brain-trigger">
<div class="absolute inset-0 bg-primary/20 rounded-lg blur-sm animate-pulse"></div>
<div class="relative bg-background-light dark:bg-surface-dark border border-primary/50 text-primary p-1.5 rounded-lg shadow-lg flex items-center justify-center transition-transform active:scale-95">
<span class="material-symbols-outlined filled" style="font-size: 20px; font-variation-settings: 'FILL' 1;">psychology</span>
</div>
<!-- Connector Line to Code -->
<div class="absolute left-full top-1/2 -translate-y-1/2 w-3 h-[1px] bg-primary/50"></div>
</button>
</div>
<!-- Code Block Content -->
<div class="flex-1 min-w-0 flex flex-col gap-2">
<!-- Cell Header -->
<div class="flex justify-between items-end px-1 pb-1">
<span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cell [5]</span>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Python 3.9</span>
</div>
</div>
<!-- Editor -->
<div class="group/code relative rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0D121C] shadow-sm overflow-hidden transition-colors hover:border-primary/40 dark:hover:border-primary/40">
<!-- Run Button (Floating) -->
<button class="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary px-2 py-1 rounded-md transition-all active:scale-95 border border-primary/20">
<span class="material-symbols-outlined" style="font-size: 16px; font-variation-settings: 'FILL' 1;">play_arrow</span>
<span class="text-[10px] font-bold uppercase tracking-wide">Run</span>
</button>
<div class="p-4 pt-10 overflow-x-auto code-scroll">
<pre class="font-mono text-[13px] leading-6 text-slate-800 dark:text-slate-200 whitespace-pre"><span class="text-purple-600 dark:text-purple-400">if</span> latency &gt; <span class="text-orange-600 dark:text-orange-400">200</span>:
    logger.<span class="text-blue-600 dark:text-blue-400">warn</span>(<span class="text-green-600 dark:text-green-400">"High latency detected"</span>)
    <span class="text-amber-600 dark:text-yellow-200">scale_resources</span>(up=<span class="text-purple-600 dark:text-purple-400">True</span>)
<span class="text-purple-600 dark:text-purple-400">else</span>:
    logger.<span class="text-blue-600 dark:text-blue-400">info</span>(<span class="text-green-600 dark:text-green-400">"Latency nominal"</span>)</pre>
</div>
</div>
<!-- Output Block -->
<div class="mt-1 pl-3 border-l-2 border-slate-300 dark:border-slate-700">
<div class="text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">Console Output</div>
<div class="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 p-2 rounded-md">
<span class="text-slate-400">2023-10-27 10:00:01</span> <span class="text-primary font-bold">[INFO]</span> Latency nominal
                        </div>
</div>
</div>
</div>
<!-- Popover: Agent Logic (Positioned absolutely over content) -->
<!-- Using manual positioning to simulate "open" state next to Brain icon -->
<div class="absolute left-[3.25rem] top-[140px] z-40 w-[260px] animate-[fadeIn_0.3s_ease-out_forwards]">
<div class="relative bg-white dark:bg-[#1A2230] rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-primary/40 p-3.5">
<!-- Beak/Arrow -->
<div class="absolute -left-[6px] top-6 h-3 w-3 rotate-45 border-l border-b border-primary/40 bg-white dark:bg-[#1A2230]"></div>
<!-- Content -->
<div class="flex flex-col gap-2">
<div class="flex items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2 mb-1">
<span class="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
<span class="material-symbols-outlined" style="font-size: 14px;">psychology</span>
                                Logic Trace
                            </span>
<span class="text-[9px] text-slate-400 font-mono">ID: #992A</span>
</div>
<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Agent decides branch based on latency check <span class="text-orange-500 font-mono">&gt; 200ms</span>.
                        </p>
<div class="flex items-center gap-2 mt-1">
<button class="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold py-1.5 px-2 rounded transition-colors flex items-center justify-center gap-1">
                                View Agent Logic
                                <span class="material-symbols-outlined" style="font-size: 12px;">arrow_forward</span>
</button>
<button class="bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 p-1.5 rounded transition-colors" title="Dismiss">
<span class="material-symbols-outlined" style="font-size: 14px;">close</span>
</button>
</div>
</div>
</div>
</div>
</div>
<!-- Another Cell (Next Steps) -->
<div class="w-full max-w-lg mx-auto mt-8 opacity-40 hover:opacity-100 transition-opacity duration-300">
<div class="flex gap-2 relative">
<div class="w-10 flex flex-col items-center pt-3">
<span class="text-[10px] text-slate-500 font-mono">06</span>
</div>
<div class="flex-1 min-w-0">
<div class="rounded-lg border border-gray-700 bg-[#0D121C] p-3 font-mono text-xs text-slate-500">
                        # Proceed to next batch processing<br/>
                        process_batch(current_batch)
                    </div>
</div>
</div>
</div>
</main>
<!-- Bottom Navigation Bar (Glassmorphism) -->
<nav class="fixed bottom-0 w-full bg-white/80 dark:bg-[#111722]/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 z-50">
<div class="flex justify-around items-center px-2 h-[60px] pb-4">
<a class="flex flex-col items-center gap-1 group w-16" href="#">
<div class="p-1 rounded-full group-hover:bg-primary/10 transition-colors text-primary">
<span class="material-symbols-outlined filled" style="font-size: 24px; font-variation-settings: 'FILL' 1;">terminal</span>
</div>
<span class="text-[10px] font-bold text-primary">Runbook</span>
</a>
<a class="flex flex-col items-center gap-1 group w-16" href="#">
<div class="p-1 rounded-full group-hover:bg-white/5 transition-colors text-slate-400 dark:text-slate-500 group-hover:text-slate-300">
<span class="material-symbols-outlined" style="font-size: 24px;">folder_open</span>
</div>
<span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-300">Files</span>
</a>
<div class="relative -top-5">
<button class="h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform">
<span class="material-symbols-outlined" style="font-size: 28px;">add</span>
</button>
</div>
<a class="flex flex-col items-center gap-1 group w-16" href="#">
<div class="p-1 rounded-full group-hover:bg-white/5 transition-colors text-slate-400 dark:text-slate-500 group-hover:text-slate-300">
<span class="material-symbols-outlined" style="font-size: 24px;">chat</span>
</div>
<span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-300">Ask AI</span>
</a>
<a class="flex flex-col items-center gap-1 group w-16" href="#">
<div class="p-1 rounded-full group-hover:bg-white/5 transition-colors text-slate-400 dark:text-slate-500 group-hover:text-slate-300">
<span class="material-symbols-outlined" style="font-size: 24px;">settings</span>
</div>
<span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-300">Config</span>
</a>
</div>
</nav>
<!-- Global Keyframes for Animations -->
<style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Inline Cell Annotations"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"CLI & Automation"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Inline Cell Annotations","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
