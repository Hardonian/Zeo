1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T311a,<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Epistemic Translator Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "plain-lang": "#10b981", 
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
        }.toggle-checkbox:checked {
            right: 0;
            border-color: #10b981;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #10b981;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex justify-center">
<div class="relative w-full max-w-md h-full min-h-screen bg-white dark:bg-[#1a2632] shadow-2xl overflow-x-hidden flex flex-col">
<header class="flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-sm z-20 border-b border-slate-100 dark:border-slate-800">
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<h1 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Epistemic Translator</h1>
<button class="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">settings</span>
</button>
</header>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-[65px] z-10 backdrop-blur-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-plain-lang text-[20px] fill-1">translate</span>
<span class="text-slate-900 dark:text-white font-semibold text-sm">Plain Language Mode</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plain-lang"></div>
</label>
</div>
<div class="px-5 py-4">
<div class="relative flex items-center w-full h-12 rounded-xl focus-within:ring-2 focus-within:ring-primary/50 shadow-sm bg-slate-100 dark:bg-slate-800 overflow-hidden border border-transparent focus-within:border-primary/20">
<div class="grid place-items-center h-full w-12 text-slate-400 dark:text-slate-500">
<span class="material-symbols-outlined text-[24px]">search</span>
</div>
<input class="peer h-full w-full outline-none text-sm text-slate-700 dark:text-slate-200 pr-2 bg-transparent placeholder-slate-400 dark:placeholder-slate-500" id="search" placeholder="Search jargon (e.g. p-value)..." type="text"/>
</div>
</div>
<main class="flex-1 px-5 pb-8 space-y-6">
<button class="w-full group relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 rounded-xl p-4 shadow-lg shadow-blue-500/20 text-left transition-all hover:shadow-blue-500/30">
<div class="relative z-10 flex items-center justify-between">
<div>
<h3 class="text-white font-bold text-base mb-1">Translate to Executive Summary</h3>
<p class="text-blue-100 text-xs">Convert current report data into a 1-page plain language brief.</p>
</div>
<div class="bg-white/20 p-2 rounded-full backdrop-blur-sm">
<span class="material-symbols-outlined text-white text-[24px]">description</span>
</div>
</div>
<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
</button>
<section class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-plain-lang text-[20px]">equalizer</span>
<h3 class="text-slate-900 dark:text-white text-sm font-semibold">Certainty Scale</h3>
</div>
<span class="text-slate-500 dark:text-slate-400 text-xs">Plain View</span>
</div>
<div class="mb-2">
<p class="text-slate-600 dark:text-slate-300 text-xs mb-3">Instead of 'Confidence Intervals', we show how sure we are:</p>
</div>
<div class="relative w-full h-12 flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg px-3 border border-slate-100 dark:border-slate-700">
<div class="flex-1 flex flex-col items-center border-r border-slate-200 dark:border-slate-700 opacity-40">
<span class="text-[10px] uppercase font-bold text-slate-500">Unsure</span>
<div class="w-2 h-2 rounded-full bg-slate-300 mt-1"></div>
</div>
<div class="flex-1 flex flex-col items-center border-r border-slate-200 dark:border-slate-700 opacity-40">
<span class="text-[10px] uppercase font-bold text-slate-500">Likely</span>
<div class="w-2 h-2 rounded-full bg-slate-300 mt-1"></div>
</div>
<div class="flex-1 flex flex-col items-center">
<span class="text-[10px] uppercase font-bold text-plain-lang">Verified</span>
<div class="w-3 h-3 rounded-full bg-plain-lang shadow-md shadow-plain-lang/40 mt-1 ring-2 ring-plain-lang/20"></div>
</div>
</div>
</section>
<section class="space-y-4">
<div class="flex items-center justify-between">
<h3 class="text-slate-900 dark:text-white text-base font-bold flex items-center gap-2">
                        Common Analogies
                        <span class="bg-plain-lang/10 text-plain-lang text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
</h3>
</div>
<article class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
<div class="p-4 bg-plain-lang/5 border-b border-plain-lang/10">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-plain-lang text-[18px]">visibility</span>
<span class="text-xs font-bold text-plain-lang uppercase tracking-wide">Plain Language</span>
</div>
<h4 class="text-slate-900 dark:text-white text-lg font-bold">"Range of Possibilities"</h4>
<p class="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                            Think of it like an estimated arrival time for a delivery—it might arrive between 2pm and 4pm.
                        </p>
</div>
<div class="p-4 bg-slate-50 dark:bg-slate-900/50 relative group cursor-help">
<div class="flex items-center justify-between mb-1">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[16px]">code</span>
<span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Technical Term</span>
</div>
<span class="material-symbols-outlined text-slate-300 text-[16px] group-hover:text-primary transition-colors">info</span>
</div>
<h5 class="text-slate-700 dark:text-slate-200 text-sm font-semibold font-mono">Uncertainty Band</h5>
<p class="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                            The interval within which a measurement likely falls based on statistical variance.
                        </p>
</div>
</article>
<article class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
<div class="p-4 bg-plain-lang/5 border-b border-plain-lang/10">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-plain-lang text-[18px]">visibility</span>
<span class="text-xs font-bold text-plain-lang uppercase tracking-wide">Plain Language</span>
</div>
<h4 class="text-slate-900 dark:text-white text-lg font-bold">"The Surprise Factor"</h4>
<p class="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                             How surprised should you be by this result if nothing special was actually happening? Lower means more surprised.
                        </p>
</div>
<div class="p-4 bg-slate-50 dark:bg-slate-900/50 relative group cursor-help">
<div class="flex items-center justify-between mb-1">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[16px]">code</span>
<span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Technical Term</span>
</div>
<span class="material-symbols-outlined text-slate-300 text-[16px] group-hover:text-primary transition-colors">info</span>
</div>
<h5 class="text-slate-700 dark:text-slate-200 text-sm font-semibold font-mono">p-value</h5>
<p class="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                            Probability of obtaining test results at least as extreme as the results actually observed.
                        </p>
</div>
</article>
<article class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
<div class="p-4 bg-plain-lang/5 border-b border-plain-lang/10">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-plain-lang text-[18px]">visibility</span>
<span class="text-xs font-bold text-plain-lang uppercase tracking-wide">Plain Language</span>
</div>
<h4 class="text-slate-900 dark:text-white text-lg font-bold">"Crying Wolf"</h4>
<p class="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                            The system claims there is a problem when everything is actually fine.
                        </p>
</div>
<div class="p-4 bg-slate-50 dark:bg-slate-900/50 relative group cursor-help">
<div class="flex items-center justify-between mb-1">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 text-[16px]">code</span>
<span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Technical Term</span>
</div>
<span class="material-symbols-outlined text-slate-300 text-[16px] group-hover:text-primary transition-colors">info</span>
</div>
<h5 class="text-slate-700 dark:text-slate-200 text-sm font-semibold font-mono">Type I Error (False Positive)</h5>
<p class="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                            Incorrect rejection of a true null hypothesis.
                        </p>
</div>
</article>
</section>
<div class="mt-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
<div class="inline-flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-sm mb-3">
<span class="material-symbols-outlined text-slate-400 text-[20px]">help</span>
</div>
<h4 class="text-slate-900 dark:text-white font-bold text-sm mb-1">Still too complex?</h4>
<p class="text-slate-500 dark:text-slate-400 text-xs mb-4">Flag a term for our researchers to simplify further.</p>
<button class="w-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm transition-all">
                    Flag for Simplification
                </button>
</div>
</main>
<div class="h-4 w-full bg-transparent"></div>
</div>

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Epistemic Translator Panel 4"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Epistemic Translator Panel 4","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
