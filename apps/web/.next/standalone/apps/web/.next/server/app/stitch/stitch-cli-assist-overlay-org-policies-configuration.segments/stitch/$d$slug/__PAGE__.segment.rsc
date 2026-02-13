1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2c16,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Org Policies Configuration</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101622",
                        "surface-dark": "#161e2c", 
                        "border-dark": "#324467",
                    },
                    fontFamily: {
                        "display": ["Public Sans", "sans-serif"],
                        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .material-symbols-filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-x-hidden">
<!-- Top Navigation -->
<div class="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-border-dark/40 shadow-sm">
<div class="flex items-center p-4 justify-between h-14">
<div class="flex items-center gap-1 cursor-pointer hover:opacity-70">
<span class="material-symbols-outlined text-slate-900 dark:text-white">arrow_back_ios_new</span>
<span class="text-slate-900 dark:text-white text-base font-medium ml-1">Settings</span>
</div>
<h1 class="text-lg font-bold leading-tight absolute left-1/2 -translate-x-1/2 text-slate-900 dark:text-white">Org Policies</h1>
<div class="w-8"></div> <!-- Spacer for visual balance -->
</div>
</div>
<!-- Main Scrollable Area -->
<div class="flex flex-col w-full max-w-lg mx-auto min-h-screen pb-12">
<!-- Header Section -->
<div class="px-5 pt-8 pb-4">
<h2 class="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Global Execution Policies</h2>
<p class="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed font-normal">
                Define safety guardrails for AI agents across your organization's notebooks and CLI sessions.
            </p>
</div>
<div class="p-4 flex flex-col gap-5">
<!-- Card 1: Dry Run Enforcement -->
<div class="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
<div class="p-5 flex items-center justify-between gap-4">
<div class="flex flex-col gap-1.5">
<div class="flex items-center gap-2 text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-primary">play_disabled</span>
<h3 class="font-bold text-base">Dry Run Enforcement</h3>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm pr-2">Require dry-runs before production execution.</p>
</div>
<!-- Toggle -->
<label class="relative inline-flex items-center cursor-pointer shrink-0">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
</div>
<!-- Card 2: Protected Environments -->
<div class="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
<div class="p-5 pb-2">
<div class="flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-primary">security</span>
<h3 class="font-bold text-base">Protected Environments</h3>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Define sensitive tags that require extra confirmation steps.</p>
<!-- Tag Input Area -->
<div class="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-200 dark:border-slate-700 min-h-[56px] items-center">
<!-- Chip 1 -->
<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-mono tracking-wide">
                            prod
                            <button class="ml-1.5 inline-flex items-center justify-center hover:opacity-75 focus:outline-none" type="button">
<span class="material-symbols-outlined text-[14px]">close</span>
</button>
</span>
<!-- Chip 2 -->
<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono tracking-wide">
                            main-cluster
                            <button class="ml-1.5 inline-flex items-center justify-center hover:opacity-75 focus:outline-none" type="button">
<span class="material-symbols-outlined text-[14px]">close</span>
</button>
</span>
<!-- Input -->
<input class="bg-transparent border-none focus:ring-0 text-sm p-0 ml-1 min-w-[80px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 font-mono" placeholder="Add tag..." type="text"/>
</div>
</div>
<div class="px-5 pb-5 pt-3 flex justify-end">
<button class="text-sm font-semibold text-white bg-primary hover:bg-blue-600 px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">save</span>
                        Save
                    </button>
</div>
</div>
<!-- Card 3: Required Metadata -->
<div class="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
<div class="p-5">
<div class="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-primary">fact_check</span>
<h3 class="font-bold text-base">Required Metadata</h3>
</div>
<div class="flex flex-col gap-3">
<label class="group flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
<div class="flex items-center h-5 mt-0.5">
<input checked="" class="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-surface-dark" type="checkbox"/>
</div>
<div class="flex flex-col">
<span class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Owner Identity</span>
<span class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attach user identity to every execution log.</span>
</div>
</label>
<label class="group flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
<div class="flex items-center h-5 mt-0.5">
<input class="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-surface-dark" type="checkbox"/>
</div>
<div class="flex flex-col">
<span class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Risk Level Assessment</span>
<span class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Force risk classification (Low, Med, High).</span>
</div>
</label>
</div>
</div>
<!-- Mini Action Bar for uniformity -->
<div class="w-full h-px bg-slate-100 dark:bg-border-dark/30"></div>
<div class="px-2 py-2 flex justify-end">
<button class="text-xs font-bold uppercase tracking-wider text-primary hover:text-blue-400 px-4 py-2 transition-colors">
                        Update Policy
                    </button>
</div>
</div>
<!-- Card 4: External Approvals -->
<div class="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
<div class="p-5">
<div class="flex items-center gap-2 mb-5 text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-primary">gavel</span>
<h3 class="font-bold text-base">External Approvals</h3>
</div>
<div class="space-y-4">
<!-- Slack Integration -->
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[#4A154B] text-white shadow-md">
<span class="material-symbols-outlined text-[20px]">chat_bubble</span> <!-- Fallback for Slack logo -->
</div>
<div>
<div class="text-sm font-bold text-slate-900 dark:text-white">Slack</div>
<div class="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Connected
                                    </div>
</div>
</div>
<button class="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded-md px-3 py-1.5 bg-slate-50 dark:bg-white/5 transition-all">
                                Disconnect
                            </button>
</div>
<!-- Divider -->
<div class="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
<!-- GitHub Integration -->
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[#24292e] text-white shadow-md">
<span class="material-symbols-outlined text-[20px]">code_blocks</span> <!-- Fallback for GitHub logo -->
</div>
<div>
<div class="text-sm font-bold text-slate-900 dark:text-white">GitHub</div>
<div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Not configured
                                    </div>
</div>
</div>
<button class="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md px-3 py-1.5 transition-all">
                                Connect
                            </button>
</div>
</div>
</div>
</div>
<!-- Footer / Extra Space -->
<div class="h-10"></div>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Org Policies Configuration","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","CLI Assist"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Org Policies Configuration","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
