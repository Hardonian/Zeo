1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2dd0,<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Epistemic Translator Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex justify-center">
<div class="relative w-full max-w-md h-full min-h-screen bg-white dark:bg-[#1a2632] shadow-2xl overflow-x-hidden flex flex-col">
<!-- Header -->
<header class="flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-sm z-10">
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<h1 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Epistemic Translator</h1>
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">info</span>
</button>
</header>
<!-- Hero / Title -->
<div class="px-5 pt-4 pb-2">
<h2 class="text-slate-900 dark:text-white text-[28px] font-bold leading-tight">Making data speak human</h2>
<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Translate complex compliance jargon into plain English.</p>
</div>
<!-- Search Bar -->
<div class="px-5 py-4 sticky top-[60px] z-10 bg-white/95 dark:bg-[#1a2632]/95 backdrop-blur-md transition-all">
<div class="relative flex items-center w-full h-12 rounded-xl focus-within:ring-2 focus-within:ring-primary/50 shadow-sm bg-slate-100 dark:bg-slate-800 overflow-hidden">
<div class="grid place-items-center h-full w-12 text-slate-400 dark:text-slate-500">
<span class="material-symbols-outlined text-[24px]">search</span>
</div>
<input class="peer h-full w-full outline-none text-sm text-slate-700 dark:text-slate-200 pr-2 bg-transparent placeholder-slate-400 dark:placeholder-slate-500" id="search" placeholder="Search definitions (e.g. p-value)..." type="text"/>
</div>
</div>
<!-- Content Area -->
<main class="flex-1 px-5 pb-8 space-y-6">
<!-- Confidence Slider Tool -->
<section class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">tune</span>
<h3 class="text-slate-900 dark:text-white text-sm font-semibold">Confidence Visualizer</h3>
</div>
<span class="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full">Interactive</span>
</div>
<div class="mb-6 relative h-16 flex flex-col justify-end">
<!-- Dynamic Label based on slider position -->
<div class="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300">
<span class="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Current Level</span>
<span class="text-slate-900 dark:text-white text-lg font-bold">Strong Evidence</span>
</div>
</div>
<!-- Slider Component -->
<div class="relative w-full h-8 flex items-center">
<!-- Track -->
<div class="absolute w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
<div class="h-full bg-gradient-to-r from-blue-300 to-primary w-[75%] rounded-full"></div>
</div>
<!-- Handle -->
<div class="absolute left-[75%] -translate-x-1/2 w-6 h-6 bg-white dark:bg-slate-200 rounded-full shadow-md border-2 border-primary cursor-grab flex items-center justify-center z-10 active:scale-110 transition-transform">
<div class="w-2 h-2 bg-primary rounded-full"></div>
</div>
<!-- Steps/Ticks -->
<div class="absolute w-full flex justify-between px-1 pointer-events-none">
<div class="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
<div class="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
<div class="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
<div class="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
<div class="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
</div>
</div>
<div class="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
<span>Hunch</span>
<span>Fact</span>
</div>
</section>
<!-- Glossary Section -->
<section class="space-y-4">
<div class="flex items-center justify-between">
<h3 class="text-slate-900 dark:text-white text-base font-bold">Common Terms</h3>
<button class="text-primary text-sm font-medium hover:underline">View all</button>
</div>
<!-- Card 1: Uncertainty Band -->
<article class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
<div class="p-4">
<div class="flex justify-between items-start mb-2">
<h4 class="text-slate-900 dark:text-white text-lg font-bold">Uncertainty Band</h4>
<span class="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer hover:text-primary transition-colors">bookmark</span>
</div>
<p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                            The interval within which a measurement likely falls based on statistical variance.
                        </p>
<!-- Analogy Block -->
<div class="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/10 flex gap-3 items-start">
<div class="bg-white dark:bg-slate-700 text-primary rounded-full p-1.5 shrink-0 shadow-sm mt-0.5">
<span class="material-symbols-outlined text-[18px]">lightbulb</span>
</div>
<div>
<span class="text-primary text-xs font-bold uppercase tracking-wide block mb-1">In other words</span>
<p class="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
                                    The range of possibilities. Think of it like an estimated arrival time for a delivery—it might arrive between 2pm and 4pm.
                                </p>
</div>
</div>
</div>
<!-- Footer / Expand action -->
<div class="bg-slate-50 dark:bg-slate-700/30 px-4 py-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 cursor-pointer group-hover:bg-slate-100 dark:group-hover:bg-slate-700/50 transition-colors">
<span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Read technical definition</span>
<span class="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
</div>
</article>
<!-- Card 2: p-value -->
<article class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
<div class="p-4">
<div class="flex justify-between items-start mb-2">
<h4 class="text-slate-900 dark:text-white text-lg font-bold">p-value</h4>
<span class="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer hover:text-primary transition-colors">bookmark</span>
</div>
<p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                            Probability of obtaining test results at least as extreme as the results actually observed.
                        </p>
<!-- Analogy Block -->
<div class="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/10 flex gap-3 items-start">
<div class="bg-white dark:bg-slate-700 text-primary rounded-full p-1.5 shrink-0 shadow-sm mt-0.5">
<span class="material-symbols-outlined text-[18px]">lightbulb</span>
</div>
<div>
<span class="text-primary text-xs font-bold uppercase tracking-wide block mb-1">The Surprise Factor</span>
<p class="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
                                    How surprised should you be by this result if nothing special was actually happening? Lower means more surprised.
                                </p>
</div>
</div>
</div>
<!-- Footer / Expand action -->
<div class="bg-slate-50 dark:bg-slate-700/30 px-4 py-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 cursor-pointer group-hover:bg-slate-100 dark:group-hover:bg-slate-700/50 transition-colors">
<span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Read technical definition</span>
<span class="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
</div>
</article>
<!-- Card 3: False Positive (Example of simple card) -->
<article class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
<div class="p-4">
<div class="flex justify-between items-start mb-2">
<h4 class="text-slate-900 dark:text-white text-lg font-bold">False Positive</h4>
<span class="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer hover:text-primary transition-colors">bookmark</span>
</div>
<div class="flex gap-3 items-start mt-3">
<div class="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full p-1.5 shrink-0 mt-0.5">
<span class="material-symbols-outlined text-[18px]">school</span>
</div>
<div>
<p class="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
                                    The "Cry Wolf" Error. The system claims there is a problem when everything is actually fine.
                                </p>
</div>
</div>
</div>
</article>
</section>
<!-- Request Definition Call to Action -->
<div class="mt-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
<div class="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-700 rounded-full shadow-sm mb-3">
<span class="material-symbols-outlined text-primary text-[24px]">contact_support</span>
</div>
<h4 class="text-slate-900 dark:text-white font-bold text-sm mb-1">Still confused?</h4>
<p class="text-slate-500 dark:text-slate-400 text-xs mb-4">Request a definition from our research team.</p>
<button class="w-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-semibold py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm transition-all">
                    Request Definition
                </button>
</div>
</main>
<!-- Bottom padding for scroll -->
<div class="h-4 w-full bg-transparent"></div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Epistemic Translator Panel 2","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Governance & Compliance"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Epistemic Translator Panel 2","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
