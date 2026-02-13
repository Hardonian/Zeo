1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2318,<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Workflow Timeline Widget</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#2563EB", // Blue for Zeo identity (often associated with tech/dev tools)
              danger: "#DC2626", // Red for errors
              success: "#10B981", // Green for success
              neutral: "#6B7280", // Gray for waiting/neutral states
              "background-light": "#F3F4F6", // Light gray background
              "background-dark": "#111827", // Dark background
              "surface-light": "#FFFFFF",
              "surface-dark": "#1F2937",
              "border-light": "#E5E7EB",
              "border-dark": "#374151",
            },
            fontFamily: {
              sans: ["Inter", "sans-serif"],
              mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
              DEFAULT: "0.75rem", // 12px
              xl: "1rem", // 16px
            },
            boxShadow: {
              'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            }
          },
        },
      };
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark min-h-screen font-sans text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 selection:bg-primary selection:text-white antialiased">
<div class="w-full max-w-sm mx-auto bg-surface-light dark:bg-surface-dark rounded-3xl shadow-xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col h-[800px]">
<div class="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center sticky top-0 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md z-10">
<div>
<h1 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
<span class="material-icons-round text-primary text-xl">hub</span>
                    Workflow #8392
                </h1>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">Zeo • Runner 01</p>
</div>
<button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
<span class="material-icons-round">more_vert</span>
</button>
</div>
<div class="flex-1 overflow-y-auto p-6 scrollbar-hide">
<div class="relative pl-4">
<div class="absolute left-[19px] top-4 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>
<div class="relative flex gap-4 mb-8 group">
<div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-soft ring-4 ring-surface-light dark:ring-surface-dark">
<span class="material-icons-round text-white text-sm">check</span>
</div>
<div class="flex-1 pt-1.5">
<div class="flex justify-between items-start">
<h3 class="font-semibold text-gray-900 dark:text-white">Queued</h3>
<span class="text-xs font-mono text-gray-400 dark:text-gray-500">10:42:01</span>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Job accepted by scheduler</p>
</div>
</div>
<div class="relative flex gap-4 mb-8 group">
<div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-soft ring-4 ring-surface-light dark:ring-surface-dark">
<span class="material-icons-round text-white text-sm">check</span>
</div>
<div class="flex-1 pt-1.5">
<div class="flex justify-between items-start">
<h3 class="font-semibold text-gray-900 dark:text-white">Started</h3>
<span class="text-xs font-mono text-gray-400 dark:text-gray-500">10:42:05</span>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Runner environment initialized</p>
</div>
</div>
<div class="relative flex gap-4 mb-8 group">
<div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-soft ring-4 ring-surface-light dark:ring-surface-dark">
<span class="material-icons-round text-white text-sm">check</span>
</div>
<div class="flex-1 pt-1.5">
<div class="flex justify-between items-start">
<h3 class="font-semibold text-gray-900 dark:text-white">Step A: Schema Val</h3>
<span class="text-xs font-mono text-gray-400 dark:text-gray-500">10:42:12</span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Pass
                            </span>
<span class="text-xs text-gray-500 dark:text-gray-400">12 checks</span>
</div>
</div>
</div>
<div class="relative flex gap-4 mb-8">
<div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-danger flex items-center justify-center shadow-lg ring-4 ring-surface-light dark:ring-surface-dark animate-pulse">
<span class="material-icons-round text-white text-sm">priority_high</span>
</div>
<div class="flex-1 pt-1.5 min-w-0">
<div class="flex justify-between items-start">
<h3 class="font-bold text-danger dark:text-red-400">Step B: Execution</h3>
<span class="text-xs font-mono text-gray-400 dark:text-gray-500">10:42:15</span>
</div>
<p class="text-xs text-danger/80 dark:text-red-400/80 mt-1 mb-3 font-medium">Process exited with code 1</p>
<div class="bg-gray-50 dark:bg-black/30 border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden">
<div class="px-3 py-2 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
<span class="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wide">Error Log</span>
<span class="material-icons-round text-xs text-red-400 cursor-pointer hover:text-red-600">content_copy</span>
</div>
<div class="p-3 overflow-x-auto">
<pre class="text-[11px] leading-relaxed font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">{
  "error": "DbConnectionTimeout",
  "source": "payment_gateway_v2",
  "trace_id": "req_88f9a0c",
  "details": {
    "retry_count": 3,
    "latency_ms": 5002
  }
}</pre>
</div>
<div class="px-3 py-2 bg-white dark:bg-transparent border-t border-red-100 dark:border-red-900/30">
<button class="w-full py-1.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors flex items-center justify-center gap-1">
<span class="material-icons-round text-sm">restart_alt</span>
                                    Retry Step
                                </button>
</div>
</div>
</div>
</div>
<div class="relative flex gap-4">
<div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm ring-4 ring-surface-light dark:ring-surface-dark">
<span class="material-icons-round text-gray-300 dark:text-gray-600 text-sm">radio_button_unchecked</span>
</div>
<div class="flex-1 pt-1.5 opacity-50">
<div class="flex justify-between items-start">
<h3 class="font-semibold text-gray-500 dark:text-gray-400">Finalize</h3>
<span class="text-xs font-mono text-gray-300 dark:text-gray-600">--:--:--</span>
</div>
<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Cleanup and reporting</p>
</div>
</div>
</div>
</div>
<div class="p-4 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark rounded-b-3xl">
<div class="grid grid-cols-2 gap-3">
<button class="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
<span class="material-icons-round text-base">terminal</span>
                    View Full Logs
                </button>
<button class="px-4 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
<span class="material-icons-round text-base">stop_circle</span>
                    Abort Run
                </button>
</div>
<div class="mt-4 flex items-center justify-center gap-1.5">
<div class="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
<div class="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
</div>
</div>
</div>

</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Workflow Timeline Widget","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Runtime Status"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Workflow Timeline Widget","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
