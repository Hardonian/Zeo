1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T2b78,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AI-Proposed KPI Review</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
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
        /* Custom scrollbar for clean look */
        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }
        .ai-glow {
            box-shadow: 0 0 20px -5px rgba(19, 91, 236, 0.3);
        }
        .ai-border-glow {
            border: 1px solid rgba(19, 91, 236, 0.2);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased overflow-hidden h-screen flex flex-col relative text-slate-900 dark:text-white">
<!-- Top App Bar -->
<div class="flex items-center px-4 pt-12 pb-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-2">Review Suggestions</h2>
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[24px]">filter_list</span>
</button>
</div>
<!-- Main Content: Scrollable Feed -->
<main class="flex-1 overflow-y-auto px-4 pb-24 space-y-6">
<!-- Intro Text -->
<div class="pt-2">
<h1 class="text-2xl font-bold tracking-tight mb-2">New AI Proposals</h1>
<p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Review the following KPI candidates based on your recent data patterns. Validation is required before activation.
            </p>
</div>
<!-- Card 1: High Priority (Glow Effect) -->
<div class="relative group">
<!-- AI Glow Background -->
<div class="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-30 blur group-hover:opacity-50 transition duration-500"></div>
<div class="relative bg-white dark:bg-[#151a25] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
<!-- Header -->
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">trending_down</span>
</div>
<div>
<h3 class="font-bold text-lg leading-tight">Customer Churn Velocity</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="material-symbols-outlined text-green-500 text-[16px]">verified</span>
<span class="text-xs font-medium text-green-600 dark:text-green-400">High Confidence (85%)</span>
</div>
</div>
</div>
<button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span class="material-symbols-outlined">more_horiz</span>
</button>
</div>
<!-- Rationale -->
<div class="mb-4">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
<span class="font-semibold text-slate-900 dark:text-white">Rationale:</span> Detected a strong correlation between support ticket volume and cancellations within a 48-hour window. This metric could predict revenue loss faster than current lag indicators.
                    </p>
</div>
<!-- Assumptions Accordion (Visual) -->
<div class="mb-6 bg-slate-50 dark:bg-[#0f1219] rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
<div class="flex items-center justify-between cursor-pointer">
<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Underlying Assumptions</span>
<span class="material-symbols-outlined text-slate-500 text-[18px]">expand_more</span>
</div>
<ul class="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400 list-disc pl-4">
<li>Assumes 'Ticket Closed' status implies resolution.</li>
<li>Excludes cancellations within trial period.</li>
</ul>
</div>
<!-- Action Bar -->
<div class="flex gap-3">
<button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[20px]">close</span>
                        Reject
                    </button>
<button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors">
<span class="material-symbols-outlined text-[20px]">check</span>
                        Accept
                    </button>
</div>
</div>
</div>
<!-- Card 2 -->
<div class="relative">
<div class="relative bg-white dark:bg-[#151a25] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
<!-- Header -->
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
<span class="material-symbols-outlined">shopping_cart_checkout</span>
</div>
<div>
<h3 class="font-bold text-lg leading-tight">Abandoned Cart Recovery</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="material-symbols-outlined text-yellow-500 text-[16px]">warning</span>
<span class="text-xs font-medium text-yellow-600 dark:text-yellow-400">Medium Confidence (62%)</span>
</div>
</div>
</div>
</div>
<!-- Rationale -->
<div class="mb-4">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
<span class="font-semibold text-slate-900 dark:text-white">Rationale:</span> Unusual spike in cart abandonment on mobile devices during checkout step 2. Suggested monitoring to isolate potential UI friction points.
                    </p>
</div>
<!-- Assumptions Collapsed -->
<div class="mb-6 bg-slate-50 dark:bg-[#0f1219] rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
<div class="flex items-center justify-between cursor-pointer">
<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Underlying Assumptions</span>
<span class="material-symbols-outlined text-slate-500 text-[18px] transform rotate-[-90deg]">chevron_left</span>
</div>
</div>
<!-- Action Bar -->
<div class="flex gap-3">
<button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[20px]">close</span>
                        Reject
                    </button>
<button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors">
<span class="material-symbols-outlined text-[20px]">check</span>
                        Accept
                    </button>
</div>
</div>
</div>
<!-- Card 3 -->
<div class="relative">
<div class="relative bg-white dark:bg-[#151a25] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
<!-- Header -->
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
<span class="material-symbols-outlined">groups</span>
</div>
<div>
<h3 class="font-bold text-lg leading-tight">Weekly Active Teams</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="material-symbols-outlined text-green-500 text-[16px]">verified</span>
<span class="text-xs font-medium text-green-600 dark:text-green-400">High Confidence (91%)</span>
</div>
</div>
</div>
</div>
<!-- Rationale -->
<div class="mb-4">
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
<span class="font-semibold text-slate-900 dark:text-white">Rationale:</span> Team-based activity correlates 3x stronger with retention than individual DAU (Daily Active Users). Shifting focus to 'Teams' is recommended.
                    </p>
</div>
<!-- Action Bar -->
<div class="flex gap-3">
<button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[20px]">close</span>
                        Reject
                    </button>
<button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors">
<span class="material-symbols-outlined text-[20px]">check</span>
                        Accept
                    </button>
</div>
</div>
</div>
<!-- End of Feed State -->
<div class="flex flex-col items-center justify-center pt-8 pb-4 opacity-50">
<div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3">
<span class="material-symbols-outlined text-slate-400 text-3xl">check_circle</span>
</div>
<p class="text-sm font-medium text-slate-500 dark:text-slate-400">You're all caught up!</p>
</div>
</main>
<!-- Floating Action Button (Optional) -->
<div class="absolute bottom-6 right-6 z-40">
<button class="flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-xl shadow-primary/40 hover:scale-105 transition-transform text-white">
<span class="material-symbols-outlined text-[28px]">autorenew</span>
</button>
</div>
<!-- Bottom Gradient Fade for scrolling -->
<div class="pointer-events-none fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-30"></div>
</body></html>0:{"buildId":"V_sCMn05SiQGXpllElBBM","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Ai Proposed Kpi Review"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Ai Proposed Kpi Review","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
