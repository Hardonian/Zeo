1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T28d2,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Dry Run Summary Modal</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#13ec13",
                        "background-light": "#f6f8f6",
                        "background-dark": "#102210",
                        "surface-dark": "#1a2e1a",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for code block */
        .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex items-center justify-center overflow-hidden relative">
<!-- Simulated Jupyter Notebook Background Context -->
<div aria-hidden="true" class="absolute inset-0 z-0 flex flex-col opacity-30 dark:opacity-20 pointer-events-none blur-[2px] overflow-hidden">
<div class="flex items-center gap-2 p-4 border-b border-gray-700/50 bg-[#1e1e1e]">
<span class="material-symbols-outlined text-gray-400">menu</span>
<div class="h-4 w-32 bg-gray-600 rounded"></div>
</div>
<div class="flex-1 p-4 space-y-6">
<div class="flex gap-2">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1">[1]:</div>
<div class="flex-1 bg-[#1e1e1e] border border-gray-700 p-3 rounded font-mono text-sm text-gray-300">
<span class="text-blue-400">import</span> keys <span class="text-blue-400">as</span> k<br/>
                    k.deploy(<span class="text-green-400">"edge-cluster-01"</span>)
                </div>
</div>
<div class="flex gap-2">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1">[2]:</div>
<div class="flex-1 bg-[#1e1e1e] border border-gray-700 p-3 rounded font-mono text-sm text-gray-300">
<span class="text-gray-500"># Initializing dry run...</span>
</div>
</div>
<div class="h-64 bg-black/20 rounded"></div>
</div>
</div>
<!-- Overlay Backdrop -->
<div class="absolute inset-0 bg-black/60 z-10 backdrop-blur-sm"></div>
<!-- Main Modal -->
<div class="relative z-20 w-full max-w-[90%] sm:max-w-md bg-white dark:bg-[#152615] rounded-2xl shadow-2xl border border-white/10 dark:border-white/5 flex flex-col max-h-[85vh] overflow-hidden animate-fade-in-up">
<!-- Header -->
<div class="p-6 pb-2 border-b border-gray-200 dark:border-white/5 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
<div class="flex items-start justify-between">
<div>
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-primary text-[20px]">security</span>
<p class="text-xs uppercase tracking-wider font-bold text-primary">Safety Check</p>
</div>
<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dry Run Summary</h1>
<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Operation: Deploy Edge Cluster</p>
</div>
<!-- Close Button (Ghost) -->
<button class="text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined">close</span>
</button>
</div>
</div>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
<!-- Side Effects Section -->
<section>
<h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Expected Side Effects
                    <span class="bg-gray-200 dark:bg-white/10 text-xs px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">3</span>
</h2>
<div class="space-y-3">
<!-- Item 1: Warning -->
<div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1c301c] border border-orange-500/30">
<div class="mt-0.5 p-1.5 rounded bg-orange-500/10 text-orange-500">
<span class="material-symbols-outlined text-[20px]">warning</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<p class="text-sm font-semibold text-gray-900 dark:text-white truncate">Write to AWS</p>
<span class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">Warning</span>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400">EKS Cluster Creation (t3.medium)</p>
</div>
</div>
<!-- Item 2: Safe -->
<div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1c301c] border border-gray-200 dark:border-white/5">
<div class="mt-0.5 p-1.5 rounded bg-primary/10 text-primary">
<span class="material-symbols-outlined text-[20px]">terminal</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<p class="text-sm font-semibold text-gray-900 dark:text-white truncate">Modify Local Config</p>
<span class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Safe</span>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400">Updates ~/.kube/config context</p>
</div>
</div>
<!-- Item 3: Safe -->
<div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1c301c] border border-gray-200 dark:border-white/5">
<div class="mt-0.5 p-1.5 rounded bg-primary/10 text-primary">
<span class="material-symbols-outlined text-[20px]">webhook</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<p class="text-sm font-semibold text-gray-900 dark:text-white truncate">Notify Slack</p>
<span class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Safe</span>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400">POST request to #devops-alerts</p>
</div>
</div>
</div>
</section>
<!-- Plan / Diff View -->
<section>
<div class="flex items-center justify-between mb-3">
<h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Plan Preview</h2>
<span class="text-xs font-mono text-gray-500 dark:text-gray-500">terraform plan</span>
</div>
<div class="bg-[#0d1117] dark:bg-black rounded-lg border border-gray-800 p-4 font-mono text-xs overflow-x-auto custom-scrollbar shadow-inner">
<div class="flex flex-col gap-1 min-w-[300px]">
<!-- Line 1 -->
<div class="flex text-gray-500">
<span class="mr-3 select-none opacity-50">1</span>
<span># aws_eks_cluster.main will be created</span>
</div>
<!-- Line 2 -->
<div class="flex text-green-400 bg-green-900/10 -mx-4 px-4 border-l-2 border-green-500/50">
<span class="mr-3 select-none opacity-50 text-gray-500">2</span>
<span>+ resource "aws_eks_cluster" "main" {</span>
</div>
<!-- Line 3 -->
<div class="flex text-green-400 bg-green-900/10 -mx-4 px-4 border-l-2 border-green-500/50">
<span class="mr-3 select-none opacity-50 text-gray-500">3</span>
<span class="pl-4">+ name     = "edge-cluster-01"</span>
</div>
<!-- Line 4 -->
<div class="flex text-green-400 bg-green-900/10 -mx-4 px-4 border-l-2 border-green-500/50">
<span class="mr-3 select-none opacity-50 text-gray-500">4</span>
<span class="pl-4">+ role_arn = "arn:aws:iam::..."</span>
</div>
<!-- Line 5 -->
<div class="flex text-green-400 bg-green-900/10 -mx-4 px-4 border-l-2 border-green-500/50">
<span class="mr-3 select-none opacity-50 text-gray-500">5</span>
<span class="pl-4">+ version  = "1.27"</span>
</div>
<!-- Line 6 -->
<div class="flex text-green-400 bg-green-900/10 -mx-4 px-4 border-l-2 border-green-500/50">
<span class="mr-3 select-none opacity-50 text-gray-500">6</span>
<span>+ }</span>
</div>
<!-- Line 7 -->
<div class="flex text-gray-500">
<span class="mr-3 select-none opacity-50">7</span>
<span></span>
</div>
<!-- Line 8 -->
<div class="flex text-gray-500">
<span class="mr-3 select-none opacity-50">8</span>
<span>Plan: 1 to add, 0 to change, 0 to destroy.</span>
</div>
</div>
</div>
</section>
</div>
<!-- Sticky Footer Actions -->
<div class="p-6 pt-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#152615]">
<div class="flex flex-col gap-3">
<button class="w-full bg-primary hover:bg-green-400 text-black font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(19,236,19,0.2)] hover:shadow-[0_0_20px_rgba(19,236,19,0.4)] group">
<span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">play_arrow</span>
                    Proceed with Run
                </button>
<button class="w-full bg-transparent hover:bg-gray-200 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-3 px-4 rounded-xl transition-colors">
                    Cancel Operation
                </button>
</div>
<p class="text-center text-[10px] text-gray-400 mt-4 opacity-60">
                Authorized by user: devops_lead • ID: #Run-8921
            </p>
</div>
</div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Dry Run Summary Modal"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"CLI & Automation"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Dry Run Summary Modal","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
