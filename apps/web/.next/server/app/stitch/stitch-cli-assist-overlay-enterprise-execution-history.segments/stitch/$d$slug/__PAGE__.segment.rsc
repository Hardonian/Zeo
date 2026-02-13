1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T41da,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Enterprise Execution History</title>
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
                        "primary": "#13ec13",
                        "primary-dim": "#0fa80f",
                        "background-light": "#f6f8f6",
                        "background-dark": "#102210", // Deep forest green/black
                        "card-dark": "#162b16", 
                        "surface-dark": "#1c331c",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding */
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
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased h-screen overflow-hidden flex justify-center">
<!-- Mobile Container -->
<div class="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-white/50 dark:bg-background-dark shadow-2xl sm:rounded-xl sm:h-[90vh] sm:my-auto sm:border sm:border-white/10">
<!-- Header -->
<header class="flex items-center justify-between px-5 pt-6 pb-2 bg-white/80 dark:bg-background-dark/90 backdrop-blur-md z-10 sticky top-0">
<h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Execution History</h1>
<button class="group flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined">search</span>
</button>
</header>
<!-- Main Scrollable Area -->
<div class="flex-1 overflow-y-auto no-scrollbar pb-24">
<!-- Segmented Control -->
<div class="px-5 py-2">
<div class="flex h-10 w-full rounded-lg bg-slate-200 dark:bg-[#1c331c] p-1">
<button class="flex-1 rounded-md bg-white dark:bg-primary shadow-sm text-sm font-bold text-slate-900 dark:text-black transition-all">
                        My Runs
                    </button>
<button class="flex-1 rounded-md text-sm font-medium text-slate-500 dark:text-[#92c992] hover:text-slate-900 dark:hover:text-white transition-all">
                        Org Runs
                    </button>
</div>
</div>
<!-- Filter Chips -->
<div class="px-5 py-2 mb-2">
<div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
<button class="shrink-0 rounded-lg bg-slate-900 dark:bg-[#234823] px-4 py-1.5 text-xs font-bold text-white dark:text-white ring-1 ring-inset ring-transparent">
                        All
                    </button>
<button class="shrink-0 rounded-lg bg-transparent px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-[#92c992] ring-1 ring-inset ring-slate-200 dark:ring-[#234823] hover:bg-slate-50 dark:hover:bg-[#1c331c]">
                        Running
                    </button>
<button class="shrink-0 rounded-lg bg-transparent px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-[#92c992] ring-1 ring-inset ring-slate-200 dark:ring-[#234823] hover:bg-slate-50 dark:hover:bg-[#1c331c]">
                        Failed
                    </button>
<button class="shrink-0 rounded-lg bg-transparent px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-[#92c992] ring-1 ring-inset ring-slate-200 dark:ring-[#234823] hover:bg-slate-50 dark:hover:bg-[#1c331c]">
                        Success
                    </button>
</div>
</div>
<!-- List Content -->
<div class="px-5 space-y-3">
<!-- Card 1: Running -->
<div class="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-[#162b16] p-4 shadow-sm border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden">
<!-- Decorator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
<div class="flex items-start justify-between gap-3 pl-2">
<div class="flex flex-col">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-blue-500 text-[18px] animate-spin">sync</span>
<h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">Deploy Edge Cluster</h3>
</div>
<p class="text-xs text-slate-500 dark:text-[#92c992] font-mono pl-0.5">ID: #RUN-8392-A</p>
</div>
<span class="text-xs font-mono font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded animate-pulse">Running</span>
</div>
<div class="flex items-center gap-2 pl-2 mt-1">
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#234823] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/5">
<span class="material-symbols-outlined text-[14px]">dns</span> Prod
                        </span>
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary-700 dark:text-primary border border-primary/20">
<span class="material-symbols-outlined text-[14px]">verified_user</span> Compliant
                        </span>
</div>
<div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-1 pl-2">
<div class="flex items-center gap-2">
<img alt="Alice Engineer Portrait" class="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-[#162b16]" data-alt="Portrait of a female engineer with red hair" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzLYPqrWNLDx7adDpwWRPnLh2GaXs1SLbSdYTNtL_lX8Slkz-PX22PeDRtTM6nsKeItAnymGAJxewWUGk_oVtkNz0AnOwGLGBL-0BH4j86zpaPx3sO0b5jk9PUDF1NapVQ6-SAwYsLkyZCZz2xThmZHHh1qBAESNI8Juva9yjx9f7lRwnGTw7FbgHXfIwp2Fgm3fCqKXpFh6f7-uKOILcuDu7zujkzGGTHiw_p-wXExUeyZbqK5YTR0ZY7Po4m4Wnc6NEHFLE5NyA"/>
<span class="text-xs text-slate-500 dark:text-[#92c992]">Alice • <span class="text-slate-900 dark:text-white font-medium">2m ago</span></span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-white/20 text-[20px]">chevron_right</span>
</div>
</div>
<!-- Card 2: Failed -->
<div class="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-[#162b16] p-4 shadow-sm border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden">
<!-- Decorator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
<div class="flex items-start justify-between gap-3 pl-2">
<div class="flex flex-col">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-red-500 text-[18px]">error</span>
<h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">DB Migration - US West</h3>
</div>
<p class="text-xs text-slate-500 dark:text-[#92c992] font-mono pl-0.5">ID: #RUN-8391-B</p>
</div>
<span class="text-xs font-mono font-medium text-red-500">Failed</span>
</div>
<div class="flex items-center gap-2 pl-2 mt-1">
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#234823] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/5">
<span class="material-symbols-outlined text-[14px]">layers</span> Staging
                        </span>
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
<span class="material-symbols-outlined text-[14px]">gpp_maybe</span> Non-Compliant
                        </span>
</div>
<div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-1 pl-2">
<div class="flex items-center gap-2">
<img alt="Bob Engineer Portrait" class="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-[#162b16]" data-alt="Portrait of a male engineer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU2qXlKo4iO4Q4b_26ksnSNQMhpSOljCQGazpIe9e3bPYjecUbZuEMo9EAt8t7I3WSwEc5dSSVvGAKcJvmMm1RjLz8L6MX0JmrqFU5OhTDDn-xgq18COS47cgTTOF6vLYsemm2y-0NdMg7i2T55V9Jw71Adp2eDARrumn8KpkUeG6o0P7rcVIs9KLjDnynkYdTNR2oN2wZAYQ2KB1Dzzr9ynGnHQ3PXw1gSiXcUlTgEirbGJZdRfKZKu3WQmL7eJo-uYj0DbueKX8"/>
<span class="text-xs text-slate-500 dark:text-[#92c992]">Bob • <span class="text-slate-900 dark:text-white font-medium">15m ago</span></span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-white/20 text-[20px]">chevron_right</span>
</div>
</div>
<!-- Card 3: Success -->
<div class="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-[#162b16] p-4 shadow-sm border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden">
<!-- Decorator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
<div class="flex items-start justify-between gap-3 pl-2">
<div class="flex flex-col">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-primary-dim dark:text-primary text-[18px]">check_circle</span>
<h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">Rotate API Keys</h3>
</div>
<p class="text-xs text-slate-500 dark:text-[#92c992] font-mono pl-0.5">ID: #RUN-8390-C</p>
</div>
<span class="text-xs font-mono font-medium text-primary-dim dark:text-primary">Success</span>
</div>
<div class="flex items-center gap-2 pl-2 mt-1">
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#234823] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/5">
<span class="material-symbols-outlined text-[14px]">dns</span> Prod
                        </span>
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary-700 dark:text-primary border border-primary/20">
<span class="material-symbols-outlined text-[14px]">verified_user</span> Compliant
                        </span>
</div>
<div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-1 pl-2">
<div class="flex items-center gap-2">
<div class="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#162b16]">JS</div>
<span class="text-xs text-slate-500 dark:text-[#92c992]">You • <span class="text-slate-900 dark:text-white font-medium">1h ago</span></span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-white/20 text-[20px]">chevron_right</span>
</div>
</div>
<!-- Card 4: Success -->
<div class="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-[#162b16] p-4 shadow-sm border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden opacity-80">
<!-- Decorator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
<div class="flex items-start justify-between gap-3 pl-2">
<div class="flex flex-col">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-primary-dim dark:text-primary text-[18px]">check_circle</span>
<h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">Scale Worker Nodes</h3>
</div>
<p class="text-xs text-slate-500 dark:text-[#92c992] font-mono pl-0.5">ID: #RUN-8389-D</p>
</div>
<span class="text-xs font-mono font-medium text-primary-dim dark:text-primary">Success</span>
</div>
<div class="flex items-center gap-2 pl-2 mt-1">
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#234823] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/5">
<span class="material-symbols-outlined text-[14px]">layers</span> Staging
                        </span>
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary-700 dark:text-primary border border-primary/20">
<span class="material-symbols-outlined text-[14px]">verified_user</span> Compliant
                        </span>
</div>
<div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-1 pl-2">
<div class="flex items-center gap-2">
<img alt="David Engineer Portrait" class="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-[#162b16]" data-alt="Portrait of a smiling male engineer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH-5PiSTRSLY-DdDNIZFNUyZ5rYGzEzS4zz10JEZgvfwWQD4VXpdKNjlX_g0DG5OTpT-Gohm_A-FMxwLNBzli-x5M7x514UVyRQQt0mIA5elenhR_4loG1kYHleTyuhpfP-bt8hDxZkV0Gfc1zRA6eZ1JLTWEPHtXPHLFTODtyz2JIGsDIcF2E0cKeUIafHRPTqECy08S77z7EoNg9_qNWj6QRTeEnWmv168obhc5YfsNU7rIEzLoXBYq-c2elzPUl69JQzmmBYIw"/>
<span class="text-xs text-slate-500 dark:text-[#92c992]">David • <span class="text-slate-900 dark:text-white font-medium">3h ago</span></span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-white/20 text-[20px]">chevron_right</span>
</div>
</div>
<!-- Card 5: Success -->
<div class="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-[#162b16] p-4 shadow-sm border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden opacity-60">
<!-- Decorator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
<div class="flex items-start justify-between gap-3 pl-2">
<div class="flex flex-col">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-primary-dim dark:text-primary text-[18px]">check_circle</span>
<h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">Backup Primary DB</h3>
</div>
<p class="text-xs text-slate-500 dark:text-[#92c992] font-mono pl-0.5">ID: #RUN-8388-E</p>
</div>
<span class="text-xs font-mono font-medium text-primary-dim dark:text-primary">Success</span>
</div>
<div class="flex items-center gap-2 pl-2 mt-1">
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#234823] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/5">
<span class="material-symbols-outlined text-[14px]">dns</span> Prod
                        </span>
<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary-700 dark:text-primary border border-primary/20">
<span class="material-symbols-outlined text-[14px]">verified_user</span> Compliant
                        </span>
</div>
<div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-1 pl-2">
<div class="flex items-center gap-2">
<div class="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#162b16]">SYS</div>
<span class="text-xs text-slate-500 dark:text-[#92c992]">System • <span class="text-slate-900 dark:text-white font-medium">5h ago</span></span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-white/20 text-[20px]">chevron_right</span>
</div>
</div>
</div>
</div>
<!-- Floating Action Button -->
<div class="absolute bottom-6 right-6 z-20">
<button class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/30 hover:scale-105 hover:bg-white active:scale-95 transition-all duration-300">
<span class="material-symbols-outlined text-3xl">play_arrow</span>
</button>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Enterprise Execution History","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","CLI Assist"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Enterprise Execution History","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
