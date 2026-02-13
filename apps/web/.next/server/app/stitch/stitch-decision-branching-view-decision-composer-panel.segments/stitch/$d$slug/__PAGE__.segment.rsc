1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T30c8,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Decision Composer</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1258e2",
                        "primary-hover": "#0e46b5",
                        "background-light": "#f6f6f8",
                        "background-dark": "#0f172a", // Deep slate/charcoal
                        "surface-dark": "#1e293b", // Lighter slate for cards
                        "surface-border": "#334155",
                        "text-muted": "#94a3b8",
                        "code-keyword": "#c678dd", // Purple for logic
                        "code-string": "#98c379", // Green for values
                        "code-variable": "#e06c75", // Red for variables
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {
                        "DEFAULT": "0.375rem", // rounded-md (6px)
                        "lg": "0.5rem", // rounded-lg (8px)
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        "glow": "0 0 15px rgba(18, 88, 226, 0.3)",
                    }
                },
            },
        }
    </script>
<style>
        /* Custom range slider styling for dual thumbs appearance simulation */
        input[type=range] {
            -webkit-appearance: none; 
            background: transparent; 
        }
        
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #1258e2;
            cursor: pointer;
            margin-top: -6px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #334155;
            border-radius: 2px;
        }

        /* Scrollbar hiding for clean UI */
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-hidden">
<!-- Header -->
<header class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-surface-border bg-white dark:bg-background-dark shrink-0 z-10">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
<span class="material-symbols-outlined text-xl">hub</span>
</div>
<h1 class="text-base font-bold tracking-tight">Decision Composer</h1>
</div>
<button class="text-slate-400 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-lg">refresh</span>
<span class="hidden sm:inline">Reset</span>
</button>
</header>
<!-- Main Content Area - Scrollable -->
<main class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-24">
<!-- Section 1: Definition -->
<section class="space-y-4">
<!-- Decision Title -->
<div class="group">
<label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 ml-1">Decision Title</label>
<div class="relative">
<input class="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-500" placeholder="e.g. Q3 Budget Allocation" type="text" value="Q3 Marketing Push"/>
<span class="material-symbols-outlined absolute right-3 top-3 text-slate-500 text-lg pointer-events-none">edit</span>
</div>
</div>
<!-- Context -->
<div class="group">
<label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 ml-1">Context</label>
<textarea class="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg px-4 py-3 text-sm font-normal focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all min-h-[80px] resize-none placeholder:text-slate-500 leading-relaxed">Evaluating ROI on new social channels against traditional search ads.</textarea>
</div>
<!-- Time Horizon -->
<div class="group">
<label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 ml-1">Time Horizon</label>
<div class="relative">
<select class="w-full appearance-none bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-white">
<option value="1">1 Month</option>
<option selected="" value="3">3 Months</option>
<option value="6">6 Months</option>
<option value="12">1 Year</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-3 text-slate-500 pointer-events-none">expand_more</span>
</div>
</div>
</section>
<hr class="border-slate-200 dark:border-surface-border"/>
<!-- Section 2: Dynamic Actions -->
<section>
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">bolt</span>
                    Dynamic Actions
                </h3>
<button class="size-6 flex items-center justify-center rounded bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
<span class="material-symbols-outlined text-sm">add</span>
</button>
</div>
<div class="space-y-3">
<!-- Action Card 1 -->
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg p-3 relative group hover:border-primary/50 transition-colors">
<div class="flex items-center gap-2 font-mono text-xs mb-2">
<span class="text-code-keyword font-bold">IF</span>
<div class="bg-black/10 dark:bg-black/30 px-2 py-1 rounded text-code-variable border border-slate-200 dark:border-white/10">CPC &gt; $2.00</div>
</div>
<div class="flex items-center gap-2 font-mono text-xs">
<span class="text-code-keyword font-bold">THEN</span>
<div class="bg-black/10 dark:bg-black/30 px-2 py-1 rounded text-code-string border border-slate-200 dark:border-white/10">Pause Campaign</div>
</div>
<button class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
<span class="material-symbols-outlined text-base">close</span>
</button>
</div>
<!-- Action Card 2 -->
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg p-3 relative group hover:border-primary/50 transition-colors">
<div class="flex items-center gap-2 font-mono text-xs mb-2">
<span class="text-code-keyword font-bold">IF</span>
<div class="bg-black/10 dark:bg-black/30 px-2 py-1 rounded text-code-variable border border-slate-200 dark:border-white/10">CTR &lt; 1%</div>
</div>
<div class="flex items-center gap-2 font-mono text-xs">
<span class="text-code-keyword font-bold">THEN</span>
<div class="bg-black/10 dark:bg-black/30 px-2 py-1 rounded text-code-string border border-slate-200 dark:border-white/10">Rotate Creative</div>
</div>
<button class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
<span class="material-symbols-outlined text-base">close</span>
</button>
</div>
</div>
</section>
<hr class="border-slate-200 dark:border-surface-border"/>
<!-- Section 3: Assumptions -->
<section>
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">tune</span>
                    Assumptions
                </h3>
<button class="size-6 flex items-center justify-center rounded bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
<span class="material-symbols-outlined text-sm">add</span>
</button>
</div>
<div class="space-y-4">
<!-- Assumption Item 1 -->
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg p-4">
<div class="flex justify-between items-center mb-3">
<span class="text-sm font-medium">Conversion Rate</span>
<span class="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">2.5% - 4.0%</span>
</div>
<div class="relative h-6 flex items-center px-1">
<!-- Track Background -->
<div class="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
<!-- Active Range Track -->
<div class="absolute h-1 bg-primary rounded-full" style="left: 25%; width: 40%;"></div>
<!-- Thumbs (Visual representation) -->
<div class="absolute size-4 bg-white border-2 border-primary rounded-full shadow cursor-pointer transform hover:scale-110 transition-transform" style="left: 25%; margin-left: -8px;"></div>
<div class="absolute size-4 bg-white border-2 border-primary rounded-full shadow cursor-pointer transform hover:scale-110 transition-transform" style="left: 65%; margin-left: -8px;"></div>
</div>
<div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
<span>0%</span>
<span>10%</span>
</div>
</div>
<!-- Assumption Item 2 -->
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-lg p-4">
<div class="flex justify-between items-center mb-3">
<span class="text-sm font-medium">Churn Rate</span>
<span class="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">10% - 15%</span>
</div>
<div class="relative h-6 flex items-center px-1">
<!-- Track Background -->
<div class="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
<!-- Active Range Track -->
<div class="absolute h-1 bg-primary rounded-full" style="left: 40%; width: 20%;"></div>
<!-- Thumbs (Visual representation) -->
<div class="absolute size-4 bg-white border-2 border-primary rounded-full shadow cursor-pointer transform hover:scale-110 transition-transform" style="left: 40%; margin-left: -8px;"></div>
<div class="absolute size-4 bg-white border-2 border-primary rounded-full shadow cursor-pointer transform hover:scale-110 transition-transform" style="left: 60%; margin-left: -8px;"></div>
</div>
<div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
<span>0%</span>
<span>25%</span>
</div>
</div>
</div>
</section>
</main>
<!-- Sticky Footer -->
<footer class="fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-surface-border z-20">
<div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 px-1 font-mono">
<span>Model Ready</span>
<span>Est. Runtime: 0.4s</span>
</div>
<button class="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-lg font-bold text-base shadow-glow flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined">play_arrow</span>
            Run Zeo
        </button>
</footer>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Decision Composer Panel","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Decision Composer Panel","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
