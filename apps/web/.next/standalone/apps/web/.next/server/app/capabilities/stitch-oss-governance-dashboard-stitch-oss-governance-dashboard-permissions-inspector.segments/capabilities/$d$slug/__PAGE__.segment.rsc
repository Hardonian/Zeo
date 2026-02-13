1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3261,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Permissions Inspector</title>
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
                        "primary": "#13a4ec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                        "surface-dark": "#18262e",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for technical feel */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #283339;
            border-radius: 4px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col overflow-x-hidden text-slate-900 dark:text-white">
<!-- Top App Bar -->
<header class="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
<div class="flex items-center gap-3">
<div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
<span class="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
<div class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-background-light dark:ring-background-dark animate-pulse"></div>
</div>
<h1 class="text-lg font-bold tracking-tight">Permissions Inspector</h1>
</div>
<button class="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
<span class="material-symbols-outlined text-gray-600 dark:text-gray-400">search</span>
</button>
</header>
<main class="flex-1 flex flex-col p-4 gap-6 max-w-md mx-auto w-full">
<!-- Alert Banner -->
<div class="relative overflow-hidden rounded-xl bg-gray-900 dark:bg-surface-dark shadow-lg ring-1 ring-red-500/30">
<!-- Background Image with Overlay -->
<div class="absolute inset-0 z-0 opacity-20 bg-cover bg-center" data-alt="Abstract cyber security network grid" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuATo0HCfBWAyorPiCaXeqfHfsujrLaY5uce-ydnkaBPjam4RipXMi3KSda1nM_gj8H95Y6-6M_c0NddaxO-hCYMEx9ds6amjH-oiCJ6QRaKZfWWsWbeJj0urrhcsrYmh0nSKVLiVSlRnCLI7tdKQ8wH_DWIPsuFzd8Cp_DOnkRUrGuwuDaZYbVKrGl1HZgLuPTZeSerfK7Fx4HnuLVwn_M1nTyqwum1tp9KCXpf4y57q28sO-cFkPMgu-UkJSy7LrXmNYFW6AT2oMbI');"></div>
<div class="absolute inset-0 z-0 bg-gradient-to-r from-red-900/40 to-transparent mix-blend-overlay"></div>
<div class="relative z-10 p-5 flex flex-col gap-4">
<div class="flex items-start gap-3">
<span class="material-symbols-outlined text-red-400 text-3xl mt-0.5">warning</span>
<div class="flex-1">
<h2 class="text-white text-lg font-bold leading-tight">Security Alert</h2>
<p class="text-gray-300 text-sm mt-1 font-medium">Root access detected in Storage Adapter. Immediate governance review recommended.</p>
</div>
</div>
<div class="flex justify-end pt-2">
<button class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
<span>Review Scope</span>
<span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
<!-- Segmented Control -->
<div class="bg-gray-200 dark:bg-surface-dark p-1 rounded-xl flex items-center justify-between relative">
<label class="flex-1 cursor-pointer">
<input checked="" class="peer sr-only" name="view_mode" type="radio" value="active"/>
<div class="flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all peer-checked:bg-white dark:peer-checked:bg-[#283339] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm">
                    Active
                </div>
</label>
<label class="flex-1 cursor-pointer">
<input class="peer sr-only" name="view_mode" type="radio" value="history"/>
<div class="flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all peer-checked:bg-white dark:peer-checked:bg-[#283339] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm">
                    History
                </div>
</label>
<label class="flex-1 cursor-pointer">
<input class="peer sr-only" name="view_mode" type="radio" value="settings"/>
<div class="flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all peer-checked:bg-white dark:peer-checked:bg-[#283339] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm">
                    Settings
                </div>
</label>
</div>
<!-- Active Capabilities Header -->
<div class="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-gray-800">
<h3 class="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Active Capabilities (3)</h3>
<button class="text-primary text-sm font-medium hover:underline">Filter</button>
</div>
<!-- Capabilities List -->
<div class="flex flex-col gap-3">
<!-- Item 1: AI Assist Module -->
<div class="group bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all shadow-sm">
<div class="flex justify-between items-start mb-3">
<div class="flex gap-3">
<div class="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined">psychology</span>
</div>
<div>
<h4 class="text-base font-bold text-slate-900 dark:text-white leading-tight">AI Assist Module</h4>
<p class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">ID: 0x4A1...9F</p>
</div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
</span>
                            Active
                        </span>
</div>
</div>
<div class="grid grid-cols-2 gap-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
<div>
<span class="block text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Scope</span>
<span class="font-mono text-slate-700 dark:text-gray-300">global.read_write</span>
</div>
<div class="text-right">
<span class="block text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Last Change</span>
<span class="font-mono text-primary text-xs">2023-10-27 14:02:55</span>
</div>
</div>
</div>
<!-- Item 2: Network Adapters -->
<div class="group bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all shadow-sm">
<div class="flex justify-between items-start mb-3">
<div class="flex gap-3">
<div class="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
<span class="material-symbols-outlined">router</span>
</div>
<div>
<h4 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Network Adapters</h4>
<p class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">ID: 0x8B2...1C</p>
</div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
<span class="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                            Standby
                        </span>
</div>
</div>
<div class="grid grid-cols-2 gap-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
<div>
<span class="block text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Scope</span>
<span class="font-mono text-slate-700 dark:text-gray-300">local.net_bind</span>
</div>
<div class="text-right">
<span class="block text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Last Change</span>
<span class="font-mono text-primary text-xs">2023-10-26 09:15:00</span>
</div>
</div>
</div>
<!-- Item 3: Storage Controller -->
<div class="group bg-white dark:bg-surface-dark rounded-xl p-4 border border-red-500/50 dark:border-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)] transition-all">
<div class="flex justify-between items-start mb-3">
<div class="flex gap-3">
<div class="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
<span class="material-symbols-outlined">database</span>
</div>
<div>
<h4 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Storage Controller</h4>
<p class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">ID: 0xFF0...AA</p>
</div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
<span class="material-symbols-outlined text-[14px]">lock_open</span>
                            Elevated
                        </span>
</div>
</div>
<div class="grid grid-cols-2 gap-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
<div>
<span class="block text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Scope</span>
<span class="font-mono text-red-400 font-bold">root.fs_write</span>
</div>
<div class="text-right">
<span class="block text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Last Change</span>
<span class="font-mono text-primary text-xs">2023-10-28 11:45:22</span>
</div>
</div>
<!-- Action Row for Critical Item -->
<div class="flex gap-2 mt-3">
<button class="flex-1 py-1.5 px-3 rounded text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        View Logs
                    </button>
<button class="flex-1 py-1.5 px-3 rounded text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50">
                        Revoke
                    </button>
</div>
</div>
</div>
</main>
<!-- Bottom Navigation (Optional Context) -->
<nav class="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 pb-6 z-40">
<div class="flex justify-between items-center max-w-md mx-auto">
<button class="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined">dashboard</span>
<span class="text-[10px] font-medium uppercase tracking-wide">Console</span>
</button>
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-outlined fill-current">policy</span>
<span class="text-[10px] font-medium uppercase tracking-wide">Perms</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined">history</span>
<span class="text-[10px] font-medium uppercase tracking-wide">Audit</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined">settings</span>
<span class="text-[10px] font-medium uppercase tracking-wide">Config</span>
</button>
</div>
</nav>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Permissions Inspector"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Permissions Inspector","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
