1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2d43,<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ReadyLayer IDE Nudge Widget</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#3b82f6", // Blue similar to the screenshot's 'Get Github' button
              "background-light": "#f3f4f6", // Light gray for light mode (though IDE is mostly dark)
              "background-dark": "#0d1117", // GitHub Dark / VS Code dark
              "surface-dark": "#161b22", // Slightly lighter dark for panels
              "editor-dark": "#0d1117",
              "widget-bg": "#21262d",
              "border-dark": "#30363d",
              "accent-green": "#2ea043",
              "accent-red": "#da3633",
              "accent-yellow": "#d29922",
            },
            fontFamily: {
              display: ["Inter", "sans-serif"],
              mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
              DEFAULT: "0.375rem",
              lg: "0.5rem",
              xl: "0.75rem",
            },
          },
        },
      };
    </script>
<style>.token-keyword { color: #ff7b72; }
        .token-function { color: #d2a8ff; }
        .token-string { color: #a5d6ff; }
        .token-comment { color: #8b949e; }
        .token-variable { color: #79c0ff; }
        .line-number { color: #484f58; }@keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            70% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-pulse-border {
            animation: pulse-border 2s infinite;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased h-screen flex flex-col overflow-hidden text-slate-900 dark:text-slate-200">
<header class="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark shrink-0">
<div class="flex items-center space-x-3">
<button class="text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined">menu</span>
</button>
<div class="flex flex-col">
<span class="text-xs text-gray-400 font-mono">ReadyLayer / governance</span>
<div class="flex items-center space-x-2">
<span class="material-symbols-outlined text-sm text-gray-400">description</span>
<span class="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">policy_check.ts</span>
<span class="w-2 h-2 rounded-full bg-accent-yellow ml-1"></span>
</div>
</div>
</div>
<div class="flex items-center space-x-3">
<button class="text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-[20px]">search</span>
</button>
<button class="bg-primary text-white p-1.5 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/20">
<span class="material-symbols-outlined text-[18px]">play_arrow</span>
</button>
</div>
</header>
<div class="flex overflow-x-auto bg-gray-50 dark:bg-[#010409] border-b border-gray-200 dark:border-border-dark shrink-0 scrollbar-hide">
<div class="flex items-center px-4 py-2 border-r border-gray-200 dark:border-border-dark bg-white dark:bg-editor-dark min-w-fit border-t-2 border-t-primary">
<span class="text-xs font-mono text-gray-800 dark:text-gray-200">policy_check.ts</span>
<button class="ml-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5">
<span class="material-symbols-outlined text-[10px] text-gray-500">close</span>
</button>
</div>
<div class="flex items-center px-4 py-2 border-r border-gray-200 dark:border-border-dark min-w-fit opacity-60 hover:opacity-100">
<span class="text-xs font-mono text-gray-500 dark:text-gray-400">config.yaml</span>
</div>
<div class="flex items-center px-4 py-2 border-r border-gray-200 dark:border-border-dark min-w-fit opacity-60 hover:opacity-100">
<span class="text-xs font-mono text-gray-500 dark:text-gray-400">README.md</span>
</div>
</div>
<main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-editor-dark relative">
<div class="flex min-h-full font-mono text-xs sm:text-sm leading-6 pt-2 pb-32">
<div class="flex flex-col items-end px-3 select-none text-right min-w-[3rem] border-r border-gray-200 dark:border-border-dark/30 bg-gray-50 dark:bg-editor-dark">
<span class="line-number">1</span>
<span class="line-number">2</span>
<span class="line-number">3</span>
<span class="line-number">4</span>
<span class="line-number">5</span>
<span class="line-number">6</span>
<span class="line-number">7</span>
<span class="line-number">8</span>
<span class="line-number">9</span>
<span class="line-number">10</span>
<span class="line-number">11</span>
<span class="line-number">12</span>
<span class="line-number">13</span>
<span class="line-number">14</span>
<span class="line-number">15</span>
<span class="line-number">16</span>
<span class="line-number">17</span>
<span class="line-number">18</span>
<span class="line-number">19</span>
<span class="line-number">20</span>
<span class="line-number">21</span>
<span class="line-number">22</span>
</div>
<div class="flex-1 px-4 text-gray-800 dark:text-gray-300 whitespace-pre overflow-x-auto">
<span class="token-keyword">import</span> { <span class="token-variable">ReviewGuard</span>, <span class="token-variable">Policy</span> } <span class="token-keyword">from</span> <span class="token-string">'@readylayer/governance'</span>;
<span class="token-comment">// Define strict policies for financial modules</span>
<span class="token-keyword">export const</span> <span class="token-function">FinancialPolicy</span> = <span class="token-keyword">new</span> <span class="token-variable">Policy</span>({
  <span class="token-variable">name:</span> <span class="token-string">"High-Risk Transaction Check"</span>,
  <span class="token-variable">severity:</span> <span class="token-string">"critical"</span>,
  <span class="token-variable">rules:</span> [
    {
      <span class="token-variable">id:</span> <span class="token-string">"no-plain-text-keys"</span>,
      <span class="token-variable">validate:</span> (<span class="token-variable">ctx</span>) =&gt; {
        <span class="token-keyword">if</span> (ctx.hasSecrets) {
           <span class="token-keyword">return</span> <span class="token-variable">false</span>;
        }
        <span class="token-keyword">return</span> <span class="token-variable">true</span>;
      }
    }
  ]
});
<span class="token-comment">// Main execution block</span>
<span class="token-keyword">async function</span> <span class="token-function">validateChanges</span>() {
  <span class="token-keyword">const</span> <span class="token-variable">guard</span> = <span class="token-keyword">new</span> <span class="token-variable">ReviewGuard</span>();
  <span class="token-keyword">await</span> guard.<span class="token-function">attach</span>(<span class="token-variable">FinancialPolicy</span>);
  <span class="token-comment"></span>
<span class="token-variable">console</span>.<span class="token-function">log</span>(<span class="token-string">"Validating..."</span>);
}
            </div>
</div>
<div class="fixed bottom-20 left-4 right-4 z-50 pointer-events-none flex justify-center sm:justify-end sm:right-6">
<div class="pointer-events-auto max-w-sm w-full bg-white dark:bg-widget-bg border border-blue-100 dark:border-blue-900/50 shadow-2xl shadow-blue-900/20 dark:shadow-black/50 rounded-xl p-3 flex items-start gap-3 transform transition-all hover:scale-[1.02] animate-pulse-border relative overflow-hidden backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
<div class="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/20 blur-2xl rounded-full pointer-events-none"></div>
<div class="flex-shrink-0 mt-0.5">
<div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
<span class="material-symbols-outlined text-primary text-lg">shield_lock</span>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">High-risk path detected</h4>
<button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
<span class="material-symbols-outlined text-base">close</span>
</button>
</div>
<p class="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        You’re modifying <span class="font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1 rounded">policy_check.ts</span> which governs critical workflows.
                    </p>
<div class="mt-3 flex items-center gap-4">
<button class="text-xs font-medium text-primary hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors">
                            View details
                            <span class="material-symbols-outlined text-[10px]">open_in_new</span>
</button>
<button class="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            Dismiss
                        </button>
</div>
</div>
</div>
</div>
</main>
<footer class="bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-border-dark pb-safe-area">
<div class="flex items-center justify-between px-6 py-3">
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-outlined text-xl">code</span>
<span class="text-[10px] font-medium">Editor</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
<span class="material-symbols-outlined text-xl">search</span>
<span class="text-[10px] font-medium">Search</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 relative">
<span class="absolute top-0 right-3 w-2 h-2 bg-accent-red rounded-full border border-white dark:border-surface-dark"></span>
<span class="material-symbols-outlined text-xl">git_branch</span>
<span class="text-[10px] font-medium">Source</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
<span class="material-symbols-outlined text-xl">terminal</span>
<span class="text-[10px] font-medium">Terminal</span>
</button>
</div>
<div class="h-4 w-full"></div>
</footer>
<script>
        // Simple script to toggle dark mode for demonstration if needed, 
        // though the prompt implies a specific look. 
        // Defaulting to dark mode as it's an IDE.
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
             // Forcing dark mode initially because IDEs are usually dark, remove if you want system pref
            document.documentElement.classList.add('dark');
        }
    </script>

</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Ide Nudge Widget"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Collaboration"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Ide Nudge Widget","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
