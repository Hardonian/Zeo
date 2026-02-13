1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T27cc,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>JSON Editor Validation Error</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#136dec",
              "background-light": "#f6f7f8",
              "background-dark": "#101822",
              "surface-dark": "#16202c", // Slightly lighter than background-dark for cards/editor
              "editor-bg": "#1e293b", // Specific for code editor area
            },
            fontFamily: {
              "display": ["Space Grotesk", "sans-serif"],
              "mono": ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
            },
          },
        },
      }
    </script>
<style>.custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #475569; 
        }.json-key { color: #9cdcfe; }
        .json-string { color: #ce9178; }
        .json-number { color: #b5cea8; }
        .json-boolean { color: #136dec; font-weight: bold; }.json-punctuation { color: #d4d4d4; }.json-error { text-decoration: underline; text-decoration-style: wavy; text-decoration-color: #ef4444; color: #ef4444; }
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
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden h-screen flex flex-col">
<header class="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 shrink-0 z-10">
<button class="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-white transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
</button>
<h2 class="text-lg font-bold leading-tight tracking-tight text-center truncate px-2 flex-1">
            TruthCore-Sync
        </h2>
<button class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold tracking-wide uppercase px-2 py-1 rounded transition-colors">
            Discard
        </button>
</header>
<main class="flex-1 flex flex-col overflow-y-auto w-full max-w-2xl mx-auto custom-scrollbar relative">
<div class="px-4 pt-4 pb-2 shrink-0">
<div class="bg-amber-500/10 border border-amber-500/30 rounded p-3 flex items-start gap-3">
<span class="material-symbols-outlined text-amber-500 shrink-0 mt-0.5">warning</span>
<div class="flex flex-col gap-1">
<p class="text-amber-500 text-sm font-bold uppercase tracking-wide">Production Override Active</p>
<p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        You are modifying live production parameters. Changes will apply immediately on the next retry cycle.
                    </p>
</div>
</div>
</div>
<div class="flex-1 px-4 py-2 flex flex-col min-h-0">
<div class="flex items-center justify-between mb-2 px-1">
<label class="text-sm font-medium text-slate-500 dark:text-slate-400">JSON Configuration</label>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
<span class="text-xs text-red-500 font-bold font-mono">Invalid JSON</span>
</div>
</div>
<div class="flex-1 bg-white dark:bg-[#1e293b] rounded border border-red-500/30 dark:border-red-500/30 shadow-sm overflow-hidden flex flex-col relative group cursor-text">
<div class="absolute top-2 right-2 z-50">
<button class="group flex items-center justify-center size-8 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary transition-all shadow-sm active:scale-95" title="Copy to Clipboard">
<span class="material-symbols-outlined text-[18px]">content_copy</span>
<div class="absolute top-full right-0 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wide rounded opacity-0 group-active:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg transform origin-top-right">
              Copied!
            </div>
</button>
</div>
<div class="absolute left-0 right-0 h-6 bg-red-500/10 dark:bg-red-500/20 top-[17.5rem] z-0 pointer-events-none border-l-[3px] border-red-500 ml-[40px]"></div>
<div class="absolute left-0 top-0 bottom-0 w-10 bg-slate-50 dark:bg-[#16202c] border-r border-slate-200 dark:border-slate-700 flex flex-col items-end pt-4 pr-2 select-none text-xs font-mono text-slate-400 opacity-60 z-20">
<span>1</span>
<span>2</span>
<span>3</span>
<span>4</span>
<span>5</span>
<span>6</span>
<span>7</span>
<span>8</span>
<span>9</span>
<span>10</span>
<span>11</span>
<div class="relative w-full flex justify-end">
<span class="material-symbols-outlined text-[10px] text-red-500 absolute left-0.5 top-[3px]">error</span>
<span class="text-red-500 font-bold opacity-100">12</span>
</div>
<span>13</span>
<span>14</span>
<span>15</span>
</div>
<textarea autocapitalize="off" autocorrect="off" class="absolute inset-0 w-full h-full pl-12 pt-4 pr-4 bg-transparent text-transparent caret-primary font-mono text-sm resize-none focus:outline-none z-10 font-normal leading-6" spellcheck="false">{
  "job_id": "TC-8892-ALPHA",
  "retry_strategy": "linear_backoff",
  "max_attempts": 5,
  "timeout_ms": 5000,
  "features": {
    "dry_run": false,
    "force_sync": true,
    "logging_level": "verbose"
  },
  "targets": [
    us-east-1",
    "eu-west-3"
  ]
}</textarea>
<div class="absolute inset-0 w-full h-full pl-12 pt-4 pr-4 font-mono text-sm whitespace-pre overflow-auto pointer-events-none z-0 leading-6">
<span class="json-punctuation">{</span>
<span class="json-key">"job_id"</span><span class="json-punctuation">:</span> <span class="json-string">"TC-8892-ALPHA"</span><span class="json-punctuation">,</span>
<span class="json-key">"retry_strategy"</span><span class="json-punctuation">:</span> <span class="json-string">"linear_backoff"</span><span class="json-punctuation">,</span>
<span class="json-key">"max_attempts"</span><span class="json-punctuation">:</span> <span class="json-number">5</span><span class="json-punctuation">,</span>
<span class="json-key">"timeout_ms"</span><span class="json-punctuation">:</span> <span class="json-number">5000</span><span class="json-punctuation">,</span>
<span class="json-key">"features"</span><span class="json-punctuation">:</span> <span class="json-punctuation">{</span>
<span class="json-key">"dry_run"</span><span class="json-punctuation">:</span> <span class="json-boolean">false</span><span class="json-punctuation">,</span>
<span class="json-key">"force_sync"</span><span class="json-punctuation">:</span> <span class="json-boolean">true</span><span class="json-punctuation">,</span>
<span class="json-key">"logging_level"</span><span class="json-punctuation">:</span> <span class="json-string">"verbose"</span>
<span class="json-punctuation">}</span><span class="json-punctuation">,</span>
<span class="json-key">"targets"</span><span class="json-punctuation">:</span> <span class="json-punctuation">[</span>
<span class="json-error">us-east-1"</span><span class="json-punctuation">,</span>
<span class="json-string">"eu-west-3"</span>
<span class="json-punctuation">]</span>
<span class="json-punctuation">}</span></div>
<div class="absolute bottom-0 left-0 right-0 bg-red-50 dark:bg-red-950/80 border-t border-red-200 dark:border-red-800/50 backdrop-blur-md p-3 flex items-start gap-3 z-30">
<span class="material-symbols-outlined text-red-600 dark:text-red-400 text-xl mt-0.5">cancel</span>
<div class="flex flex-col">
<span class="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5">Syntax Error</span>
<span class="text-sm font-medium text-red-900 dark:text-red-100">Unexpected token at line 12</span>
</div>
</div>
</div>
<p class="text-xs text-red-500 mt-2 px-1 pb-20">
                Fix syntax errors to proceed with application.
            </p>
</div>
</main>
<div class="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-40">
<div class="max-w-2xl mx-auto flex gap-3">
<button class="flex-1 h-12 flex items-center justify-center gap-2 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium transition-colors border border-slate-300 dark:border-slate-600">
<span class="material-symbols-outlined text-[20px]">refresh</span>
                Re-validate
            </button>
<button class="flex-[2] h-12 flex items-center justify-center gap-2 rounded bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 font-bold cursor-not-allowed opacity-80" disabled="">
<span class="material-symbols-outlined text-[20px]">play_arrow</span>
                Apply &amp; Retry
            </button>
</div>
<div class="h-1 w-full"></div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Full Screen Json Override Editor 4","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Runtime Status"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Full Screen Json Override Editor 4","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
