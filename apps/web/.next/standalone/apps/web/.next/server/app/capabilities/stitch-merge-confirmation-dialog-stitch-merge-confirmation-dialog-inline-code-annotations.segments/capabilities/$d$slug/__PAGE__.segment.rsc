1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T30a2,<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ReadyLayer Inline Code Annotations</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#3B82F6", // Blue from screenshot/description
              "background-light": "#F9FAFB", // Light gray background
              "background-dark": "#0D1117", // GitHub dark mode background
              "card-light": "#FFFFFF",
              "card-dark": "#161B22", // GitHub dark mode card
              "border-light": "#E5E7EB",
              "border-dark": "#30363D",
              "diff-add-light": "#E6FFEC",
              "diff-add-dark": "#132318", // Darker green bg
              "diff-add-text-light": "#22863A",
              "diff-add-text-dark": "#3FB950",
              "diff-del-light": "#FFEBE9",
              "diff-del-dark": "#291515", // Darker red bg
              "diff-del-text-light": "#CF222E",
              "diff-del-text-dark": "#F85149",
            },
            fontFamily: {
              sans: ["Inter", "sans-serif"],
              mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
              DEFAULT: "0.375rem",
              'lg': '0.5rem',
              'xl': '0.75rem',
              '2xl': '1rem',
            },
          },
        },
      };
    </script>
<style>.no-scrollbar::-webkit-scrollbar {
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
<body class="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans min-h-screen transition-colors duration-200">
<header class="sticky top-0 z-50 bg-card-light/95 dark:bg-card-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between">
<div class="flex items-center gap-2">
<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
<span class="material-icons text-xl">layers</span>
</div>
<span class="font-semibold text-sm tracking-tight">ReadyLayer</span>
</div>
<div class="flex items-center gap-3">
<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">PR #42</span>
<button class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
<span class="material-icons text-xl">more_horiz</span>
</button>
</div>
</header>
<main class="max-w-md mx-auto px-0 pb-20 pt-4">
<div class="px-4 mb-6">
<h1 class="text-xl font-bold mb-1">Update User Authentication Flow</h1>
<div class="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mb-4">
<span class="flex items-center gap-1 text-green-600 dark:text-green-400">
<span class="material-icons text-sm">call_split</span> Open
                </span>
<span>•</span>
<span>opened 2 hours ago</span>
</div>
<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
<div class="bg-primary/10 p-1.5 rounded-full mt-0.5">
<span class="material-icons text-primary text-sm">auto_awesome</span>
</div>
<div>
<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">ReadyLayer Checks</h3>
<p class="text-xs text-gray-600 dark:text-gray-400 mt-1">2 potential issues detected in public contracts.</p>
</div>
<span class="material-icons text-gray-400 text-sm ml-auto">chevron_right</span>
</div>
</div>
<div class="bg-card-light dark:bg-card-dark border-y border-border-light dark:border-border-dark mt-4">
<div class="px-4 py-2 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-[#1C2128]">
<div class="flex items-center gap-2 overflow-hidden">
<span class="material-icons text-gray-400 text-sm">description</span>
<span class="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">src/auth/UserSession.ts</span>
</div>
<div class="text-xs text-gray-500">
<span class="text-diff-add-text-light dark:text-diff-add-text-dark">+12</span>
<span class="text-diff-del-text-light dark:text-diff-del-text-dark ml-1">-4</span>
</div>
</div>
<div class="font-mono text-[11px] leading-5 overflow-x-auto no-scrollbar relative">
<div class="flex">
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">23</div>
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">23</div>
<div class="px-2 py-0.5 text-gray-600 dark:text-gray-400 whitespace-pre">  public async validateSession(token: string): Promise&lt;boolean&gt; {</div>
</div>
<div class="flex">
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">24</div>
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">24</div>
<div class="px-2 py-0.5 text-gray-600 dark:text-gray-400 whitespace-pre">    const session = await this.store.get(token);</div>
</div>
<div class="flex bg-diff-del-light dark:bg-diff-del-dark">
<div class="w-8 shrink-0 text-center text-diff-del-text-light dark:text-diff-del-text-dark select-none bg-diff-del-light dark:bg-diff-del-dark border-r border-border-light dark:border-border-dark py-0.5">25</div>
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-diff-del-light dark:bg-diff-del-dark border-r border-border-light dark:border-border-dark py-0.5"></div>
<div class="px-2 py-0.5 text-diff-del-text-light dark:text-diff-del-text-dark whitespace-pre">-   if (!session || session.isExpired) return false;</div>
</div>
<div class="flex bg-diff-add-light dark:bg-diff-add-dark group relative">
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-diff-add-light dark:bg-diff-add-dark border-r border-border-light dark:border-border-dark py-0.5"></div>
<div class="w-8 shrink-0 text-center text-diff-add-text-light dark:text-diff-add-text-dark select-none bg-diff-add-light dark:bg-diff-add-dark border-r border-border-light dark:border-border-dark py-0.5">25</div>
<div class="px-2 py-0.5 text-diff-add-text-light dark:text-diff-add-text-dark whitespace-pre flex-1">+   if (!session || !session.isValid()) return false;</div>
</div>
<div class="flex bg-diff-add-light dark:bg-diff-add-dark relative">
<div class="absolute left-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center">
<button class="w-5 h-5 bg-primary text-white rounded shadow-md flex items-center justify-center hover:scale-110 transition-transform cursor-pointer animate-pulse">
<span class="material-icons" style="font-size: 14px;">priority_high</span>
</button>
</div>
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-diff-add-light dark:bg-diff-add-dark border-r border-border-light dark:border-border-dark py-0.5 opacity-0"></div> 
<div class="w-8 shrink-0 text-center text-diff-add-text-light dark:text-diff-add-text-dark select-none bg-diff-add-light dark:bg-diff-add-dark border-r border-border-light dark:border-border-dark py-0.5">26</div>
<div class="px-2 py-0.5 text-diff-add-text-light dark:text-diff-add-text-dark whitespace-pre flex-1">+   return this.updateLastAccess(session.id);</div>
</div>
<div class="absolute left-10 top-[120px] w-64 z-20">
<div class="bg-card-light dark:bg-[#22272E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transform transition-all duration-200">
<div class="absolute -left-2 top-4 w-4 h-4 bg-card-light dark:bg-[#22272E] border-l border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
<div class="relative z-10">
<div class="flex items-start gap-3 mb-2">
<div class="shrink-0 mt-0.5">
<span class="material-icons text-primary" style="font-size: 18px;">info</span>
</div>
<div class="space-y-2">
<p class="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                        This change affects a public contract.
                                    </p>
<p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Docs reference outdated behavior for <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">updateLastAccess</code>.
                                    </p>
</div>
</div>
<div class="flex items-center justify-end gap-3 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
<button class="text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                    Dismiss
                                </button>
<button class="text-[11px] font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                                    See Why
                                    <span class="material-icons" style="font-size: 12px;">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
<div class="flex">
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">27</div>
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">27</div>
<div class="px-2 py-0.5 text-gray-600 dark:text-gray-400 whitespace-pre">  }</div>
</div>
<div class="flex">
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">28</div>
<div class="w-8 shrink-0 text-center text-gray-400 select-none bg-white dark:bg-[#0D1117] border-r border-border-light dark:border-border-dark py-0.5">28</div>
<div class="px-2 py-0.5 text-gray-600 dark:text-gray-400 whitespace-pre">}</div>
</div>
<div class="h-20 bg-background-light dark:bg-background-dark"></div> 
</div>
</div>
<div class="px-4 mt-6">
<div class="flex items-center gap-2 mb-2">
<span class="material-icons text-gray-400 text-sm">folder_open</span>
<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Related Artifacts</h3>
</div>
<div class="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-3 shadow-sm flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
<span class="material-icons text-purple-600 dark:text-purple-400 text-sm">article</span>
</div>
<div>
<p class="text-xs font-semibold text-gray-900 dark:text-gray-100">API Documentation</p>
<p class="text-[10px] text-gray-500">Last updated 2 days ago</p>
</div>
</div>
<button class="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded hover:bg-primary/20 transition-colors">
                    View
                </button>
</div>
</div>
</main>
<div class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card-light dark:bg-[#22272E] p-1.5 rounded-full shadow-lg border border-border-light dark:border-gray-700 z-50">
<button class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
<span class="material-icons text-xl">chevron_left</span>
</button>
<span class="text-xs font-mono px-2 text-gray-500 dark:text-gray-400">1 / 4 files</span>
<button class="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
<span class="material-icons text-xl">chevron_right</span>
</button>
</div>

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Inline Code Annotations"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Collaboration"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Inline Code Annotations","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
