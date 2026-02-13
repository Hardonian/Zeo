1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T3c3b,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Causal Study Builder - Plain Language Mode</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#1c2633",
                        "border-dark": "#2d3b4e",
                        "plain-lang": "#10b981", 
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
<style>::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #101922; 
        }
        ::-webkit-scrollbar-thumb {
            background: #2d3b4e; 
            border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #137fec; 
        }input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            background-color: transparent;
            margin: 0;
        }.toggle-checkbox:checked {
            right: 0;
            border-color: #10b981;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #10b981;
        }
        .plain-lang-highlight {
            border-left: 2px solid #10b981;
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
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col overflow-x-hidden">
<header class="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
<div class="flex items-center justify-between px-4 py-3">
<button class="flex items-center justify-center w-10 h-10 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h1 class="text-base font-bold tracking-tight">Causal Study Builder</h1>
<span class="text-[10px] font-mono text-primary uppercase tracking-widest">Draft Mode • v1.0.4</span>
</div>
<div class="w-10 h-10 flex items-center justify-center">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">more_vert</span>
</div>
</div>
<div class="bg-slate-100 dark:bg-black/30 px-4 py-2 flex items-center justify-between border-t border-gray-200 dark:border-white/5">
<div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
<span class="material-symbols-outlined text-sm text-plain-lang">translate</span>
                Plain Language Mode
            </div>
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:border-plain-lang transition-all duration-300" id="plain-lang-toggle" name="toggle" style="right: 0;" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-5 rounded-full bg-plain-lang cursor-pointer" for="plain-lang-toggle"></label>
</div>
</div>
<div class="h-[2px] w-full bg-gray-200 dark:bg-border-dark">
<div class="h-full w-2/3 bg-primary"></div>
</div>
</header>
<main class="flex-1 flex flex-col p-4 gap-6 max-w-md mx-auto w-full">
<section class="flex flex-col gap-2">
<div class="flex items-center justify-between">
<h2 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
<span class="material-symbols-outlined text-sm">edit_note</span>
                    Proposed Change
                </h2>
<span class="font-mono text-[10px] text-slate-400 dark:text-slate-600">data-bind:input_01</span>
</div>
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden group focus-within:border-primary transition-colors plain-lang-highlight">
<div class="bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 border-b border-gray-200 dark:border-border-dark flex justify-between items-center">
<label class="text-xs font-bold text-emerald-700 dark:text-emerald-400">What are we changing?</label>
<div class="flex gap-1">
<span class="w-2 h-2 rounded-full bg-red-500/50"></span>
<span class="w-2 h-2 rounded-full bg-yellow-500/50"></span>
<span class="w-2 h-2 rounded-full bg-green-500/50"></span>
</div>
</div>
<div class="relative">
<div class="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-black/10 border-r border-gray-200 dark:border-border-dark flex flex-col items-center pt-3 gap-[2px] text-[10px] font-mono text-slate-400 select-none">
<span>1</span>
<span>2</span>
<span>3</span>
<span>4</span>
<span>5</span>
</div>
<textarea class="w-full h-32 pl-10 pr-3 py-2 bg-transparent border-none text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-0 placeholder:text-slate-400/50 resize-none leading-relaxed" placeholder="// Define treatment assignment mechanism here...
if (X &gt; threshold) {
  treatment = 1;
} else {
  treatment = 0;
}" spellcheck="false"></textarea>
</div>
<div class="px-3 py-1 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-border-dark flex justify-between items-center">
<span class="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium italic">Describe the new policy in code</span>
<span class="text-[10px] font-mono text-slate-400">Ln 1, Col 1</span>
</div>
</div>
</section>
<section class="flex flex-col gap-2">
<div class="flex items-center justify-between">
<h2 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
<span class="material-symbols-outlined text-sm">fact_check</span>
                    Rules for the Study
                </h2>
<span class="font-mono text-[10px] text-slate-400 dark:text-slate-600">data-panel:checklist</span>
</div>
<div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg flex flex-col divide-y divide-gray-200 dark:divide-border-dark plain-lang-highlight">
<label class="group relative flex items-start gap-3 p-4 cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
<div class="relative flex items-center mt-0.5">
<input class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-500 checked:border-emerald-500 checked:bg-emerald-500 transition-all" type="checkbox"/>
<span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none">check</span>
</div>
<div class="flex-1">
<div class="flex justify-between items-center mb-1">
<span class="text-sm font-bold text-slate-700 dark:text-slate-200">No Spillover Effects</span>
<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Fairness</span>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-2">Changing the policy for one person doesn't affect others nearby.</p>
<div class="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/30">
<p class="text-[10px] text-emerald-800 dark:text-emerald-200"><span class="font-bold">Why this matters:</span> Ensures we can measure individual impact cleanly without neighbors influencing the result.</p>
</div>
</div>
</label>
<label class="group relative flex items-start gap-3 p-4 cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
<div class="relative flex items-center mt-0.5">
<input class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-500 checked:border-emerald-500 checked:bg-emerald-500 transition-all" type="checkbox"/>
<span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none">check</span>
</div>
<div class="flex-1">
<div class="flex justify-between items-center mb-1">
<span class="text-sm font-bold text-slate-700 dark:text-slate-200">No Hidden Factors</span>
<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Transparency</span>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-2">We have data on everything that influenced who got the change.</p>
<div class="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/30">
<p class="text-[10px] text-emerald-800 dark:text-emerald-200"><span class="font-bold">Why this matters:</span> Prevents confusing the effect of our change with pre-existing differences between groups.</p>
</div>
</div>
</label>
<label class="group relative flex items-start gap-3 p-4 cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
<div class="relative flex items-center mt-0.5">
<input class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-500 checked:border-emerald-500 checked:bg-emerald-500 transition-all" type="checkbox"/>
<span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none">check</span>
</div>
<div class="flex-1">
<div class="flex justify-between items-center mb-1">
<span class="text-sm font-bold text-slate-700 dark:text-slate-200">Everyone Could Be Chosen</span>
<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Access</span>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-2">No specific group was automatically excluded from the start.</p>
<div class="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/30">
<p class="text-[10px] text-emerald-800 dark:text-emerald-200"><span class="font-bold">Why this matters:</span> Guarantees we can fairly compare similar people who did and didn't get the change.</p>
</div>
</div>
</label>
<label class="group relative flex items-start gap-3 p-4 cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
<div class="relative flex items-center mt-0.5">
<input class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-500 checked:border-emerald-500 checked:bg-emerald-500 transition-all" type="checkbox"/>
<span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none">check</span>
</div>
<div class="flex-1">
<div class="flex justify-between items-center mb-1">
<span class="text-sm font-bold text-slate-700 dark:text-slate-200">Requirement for Fair Testing</span>
<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Rules</span>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-2">The "nudge" only affects the outcome by changing the policy.</p>
<div class="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/30">
<p class="text-[10px] text-emerald-800 dark:text-emerald-200"><span class="font-bold">Why this matters:</span> Ensures the results are due to the policy change itself, not some side effect of how we assigned it.</p>
</div>
</div>
</label>
</div>
</section>
<div class="flex-1 min-h-[20px]"></div>
<section class="sticky bottom-4 z-10">
<div class="bg-white/80 dark:bg-surface-dark/90 backdrop-blur-md border border-gray-200 dark:border-border-dark rounded-xl p-4 shadow-lg shadow-black/20">
<div class="mb-4">
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center">
<input class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-400 dark:border-slate-500 checked:border-emerald-500 checked:bg-emerald-500 transition-all" id="gatekeeper" type="checkbox"/>
<span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none">check</span>
</div>
<span class="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none group-hover:text-emerald-500 transition-colors">I confirm this study is safe to run</span>
</label>
</div>
<button class="group w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold tracking-wide cursor-not-allowed transition-all has-[:checked]:bg-emerald-600 has-[:checked]:text-white has-[:checked]:shadow-lg has-[:checked]:shadow-emerald-500/30 has-[:checked]:cursor-pointer relative overflow-hidden">
<input class="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" onclick="document.getElementById('gatekeeper').checked = true;" type="checkbox"/>
<span class="material-symbols-outlined text-[20px] transition-transform group-active:scale-95">play_circle</span>
<span class="transition-transform group-active:scale-95">START STUDY</span>
<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
</button>
</div>
</section>
</main>
<footer class="bg-background-light dark:bg-background-dark py-4 px-6 text-center border-t border-gray-200 dark:border-border-dark">
<div class="flex justify-center items-center gap-4 text-[10px] text-slate-400 font-mono">
<span>STUDY-ID-492</span>
<span>|</span>
<span class="flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                SYSTEM READY
            </span>
</div>
</footer>

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Causal Study Builder 2"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Governance & Compliance"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Causal Study Builder 2","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
