1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3b16,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Researcher Translation Dashboard</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
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
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#1e293b",
                        "surface-darker": "#0f172a",
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
        /* Custom scrollbar for high-density feel */
        ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #1e293b; 
        }
        ::-webkit-scrollbar-thumb {
            background: #334155; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569; 
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-red {
            animation: pulse-red 2s infinite;
        }
    </style></head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-slate-100 flex flex-col min-h-screen overflow-x-hidden pb-24">
<!-- Top App Bar -->
<header class="sticky top-0 z-30 flex items-center justify-between bg-surface-darker/95 backdrop-blur-sm border-b border-slate-700/50 p-4">
<div class="flex items-center gap-3">
<button class="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800">
<span class="material-symbols-outlined">menu</span>
</button>
<h1 class="text-lg font-bold tracking-tight text-white">Translation Queue</h1>
</div>
<div class="flex items-center gap-2">
<div class="flex items-center gap-3 mr-1">
<button class="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800 flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">volume_up</span>
</button>
<button class="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/50 rounded animate-pulse-red group" data-action="play-urgent-sound">
<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
<span class="text-[10px] font-bold text-red-400 uppercase tracking-wider">Urgent Review</span>
</button>
</div><button class="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface-darker"></span>
</button>
<div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary text-xs font-bold">
                JD
            </div>
</div>
</header><div class="mx-4 mt-4 animate-in slide-in-from-top-4 duration-300">
<div class="flex items-center gap-3 bg-slate-900 border border-emerald-500/30 rounded-lg p-3 shadow-lg shadow-emerald-900/10">
<div class="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400">
<span class="material-symbols-outlined text-[18px]">check_circle</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-xs font-medium text-slate-300">
        Review Completed: <span class="text-white font-mono font-bold">Idempotency</span>
</p>
</div>
<div class="flex items-center gap-2">
<button class="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-blue-400 transition-colors bg-primary/10 px-2 py-1 rounded">
        View Definition
      </button>
<button class="text-slate-500 hover:text-slate-300 transition-colors p-1">
<span class="material-symbols-outlined text-[16px]">close</span>
</button>
</div>
</div>
</div>
<!-- Analytics Section (Compact) -->
<section class="p-4 overflow-x-auto">
<div class="flex gap-3 min-w-max pb-2">
<!-- Stat 1 -->
<div class="flex flex-col gap-1 rounded-lg bg-surface-dark border border-slate-700 p-3 min-w-[140px] shadow-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-orange-400 text-[18px]">pending_actions</span>
<span class="text-xs font-medium text-slate-400">Pending</span>
</div>
<div class="flex items-end gap-2">
<span class="text-xl font-bold text-white">12</span>
<span class="text-xs font-medium text-emerald-400 mb-1">+2 new</span>
</div>
</div>
<!-- Stat 2 -->
<div class="flex flex-col gap-1 rounded-lg bg-surface-dark border border-slate-700 p-3 min-w-[140px] shadow-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-blue-400 text-[18px]">timelapse</span>
<span class="text-xs font-medium text-slate-400">Avg. Time</span>
</div>
<div class="flex items-end gap-2">
<span class="text-xl font-bold text-white">2.5h</span>
<span class="text-xs font-medium text-emerald-400 mb-1">-10%</span>
</div>
</div>
<!-- Stat 3 -->
<div class="flex flex-col gap-1 rounded-lg bg-surface-dark border border-slate-700 p-3 min-w-[160px] shadow-sm">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-red-400 text-[18px]">report_problem</span>
<span class="text-xs font-medium text-slate-400">Top Confusion</span>
</div>
<div class="flex items-end gap-2">
<span class="text-sm font-bold text-white font-mono truncate max-w-[120px]">Kubernetes</span>
<span class="text-xs font-medium text-slate-400 mb-0.5">45 reqs</span>
</div>
</div>
</div>
</section>
<!-- Main Grid: Inbox & Editor Area -->
<main class="flex flex-col gap-6 px-4">
<!-- Section Title -->
<div class="flex items-center justify-between">
<h2 class="text-sm font-bold uppercase tracking-wider text-slate-500">Inbox</h2>
<button class="text-xs text-primary font-medium hover:text-blue-400">View All</button>
</div>
<!-- Inbox List -->
<div class="flex flex-col gap-3">
<!-- Card 1 (Active/Selected visual indication) -->
<div class="relative group rounded-lg border border-primary bg-surface-dark p-4 shadow-lg ring-1 ring-primary/20 transition-all">
<div class="absolute -left-[1px] top-4 bottom-4 w-1 bg-primary rounded-r-sm"></div>
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-xs font-medium text-slate-400 mb-1">Engineering • High Priority</span>
<h3 class="text-lg font-bold text-white font-mono">Zero-Knowledge Proof</h3>
</div>
<span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300 ring-1 ring-slate-700">SJ</span>
</div>
<p class="text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed border-l-2 border-slate-700 pl-3 italic">
                    "...implementation requires a non-interactive ZKP for validation of the transaction without exposing the sender..."
                </p>
<div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
<div class="flex items-center gap-2 text-xs text-slate-500">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                        2 hrs ago
                    </div>
<span class="text-xs font-bold text-primary">Editing...</span>
</div>
</div>
<!-- Card 2 -->
<div class="group rounded-lg border border-slate-700 bg-surface-darker/50 p-4 hover:border-slate-500 transition-colors cursor-pointer">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-xs font-medium text-slate-500 mb-1">Product • Medium Priority</span>
<h3 class="text-lg font-bold text-slate-200 font-mono">Idempotency</h3>
</div>
<span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500 ring-1 ring-slate-700">MR</span>
</div>
<p class="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed border-l-2 border-slate-800 pl-3">
                    "...ensure API calls are idempotent to prevent duplicate charges when network timeout occurs..."
                </p>
<div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
<div class="flex items-center gap-2 text-xs text-slate-600">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                        4 hrs ago
                    </div>
<button class="text-xs font-bold text-slate-400 hover:text-white">Start Draft</button>
</div>
</div>
<!-- Card 3 -->
<div class="group rounded-lg border border-slate-700 bg-surface-darker/50 p-4 hover:border-slate-500 transition-colors cursor-pointer opacity-75">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
<span class="text-xs font-medium text-slate-500 mb-1">Marketing • Low Priority</span>
<h3 class="text-lg font-bold text-slate-200 font-mono">Service Mesh</h3>
</div>
<span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500 ring-1 ring-slate-700">AL</span>
</div>
<p class="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed border-l-2 border-slate-800 pl-3">
                    "...need a simple explanation for the new landing page regarding our service mesh capabilities..."
                </p>
<div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
<div class="flex items-center gap-2 text-xs text-slate-600">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                        1 day ago
                    </div>
<button class="text-xs font-bold text-slate-400 hover:text-white">Start Draft</button>
</div>
</div>
</div>
<!-- Editor Area (Simulated Slide-up Sheet) -->
<div class="mt-4 border-t border-primary/30 pt-4 pb-20">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">edit_note</span>
<h2 class="text-sm font-bold text-white">Draft Definition</h2>
</div>
<div class="flex gap-1 bg-slate-800 p-0.5 rounded-md">
<button class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Bold">
<span class="material-symbols-outlined text-[18px]">format_bold</span>
</button>
<button class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Italic">
<span class="material-symbols-outlined text-[18px]">format_italic</span>
</button>
<button class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Link">
<span class="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
</div>
<!-- Editor Input -->
<div class="bg-surface-dark border border-slate-600 rounded-lg p-3 shadow-inner focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all mb-4">
<textarea class="w-full bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:ring-0 resize-none min-h-[120px] leading-relaxed font-display" placeholder="Write a plain-language explanation...">A method where one party proves to another that a statement is true without revealing the actual information.</textarea>
</div>
<!-- AI Suggestion Box -->
<div class="relative bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
<div class="absolute -top-3 left-3 bg-indigo-500/10 border border-indigo-500/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1">
<span class="material-symbols-outlined text-[12px]">smart_toy</span> AI Assist
                </div>
<div class="flex gap-3">
<div class="flex-1">
<p class="text-xs text-indigo-200 leading-relaxed">
<span class="font-bold text-indigo-100">Analogy Suggestion:</span> Like showing a bartender your ID to prove you are 21 without revealing your name or address.
                        </p>
</div>
<button class="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition-colors" title="Copy to Editor">
<span class="material-symbols-outlined text-[18px]">content_copy</span>
</button>
</div>
</div>
</div>
</main>
<!-- Bottom Action Bar (Sticky) -->
<div class="fixed bottom-0 left-0 right-0 z-40 bg-surface-darker border-t border-slate-700/80 p-4 pb-6 backdrop-blur-md shadow-2xl">
<div class="max-w-md mx-auto w-full flex flex-col gap-4">
<!-- Global Dictionary Toggle -->
<label class="flex items-center gap-3 cursor-pointer group select-none">
<div class="relative">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</div>
<span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Global Dictionary Update</span>
</label>
<!-- Buttons -->
<div class="flex gap-3 h-12">
<button class="flex-1 rounded-lg border border-slate-600 bg-transparent text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[20px]">help_outline</span>
                    Clarify
                </button>
<button class="flex-[2] rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[20px]">publish</span>
                    Publish Translation
                </button>
</div>
</div>
</div>
<audio class="hidden" id="urgent-alert-sound" preload="auto" src=""></audio></body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Urgent Review Notification Dashboard"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Urgent Review Notification Dashboard","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
