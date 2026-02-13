1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2893,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Settings &amp; Config</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding for cleaner mobile look */
        .no-scrollbar::-webkit-scrollbar {
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
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased h-screen flex flex-col overflow-hidden">
<!-- Top Navigation Bar -->
<header class="shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111318] border-b border-slate-200 dark:border-slate-800 z-10">
<button class="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
<span class="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
</button>
<h1 class="text-base font-bold text-center flex-1 pr-8 text-slate-900 dark:text-white">Zeo Config</h1>
<!-- Placeholder for right action if needed, keeping it balanced with flex-1 on title -->
</header>
<!-- Scrollable Content Area -->
<main class="flex-1 overflow-y-auto no-scrollbar pb-32 bg-background-light dark:bg-background-dark">
<!-- Global Settings Card -->
<div class="px-4 pt-6 pb-2">
<div class="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
<div class="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-start gap-3 bg-blue-50/50 dark:bg-primary/5">
<div class="text-primary mt-0.5">
<span class="material-symbols-outlined">visibility</span>
</div>
<div class="flex-1">
<h2 class="text-base font-bold text-slate-900 dark:text-white mb-1">Global Settings</h2>
<p class="text-xs text-slate-500 dark:text-slate-400">Master controls for the entire Zeo suite.</p>
</div>
</div>
<div class="flex items-center justify-between p-4">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">Overlay Visibility</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Master switch to enable or disable all AI overlays across your projects.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input checked="" class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
</div>
</div>
<!-- Section 1: Review Guard -->
<div class="px-4 pt-6">
<div class="flex items-center gap-2 mb-3 px-1">
<span class="material-symbols-outlined text-slate-400 text-lg">shield</span>
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Review Guard</h3>
</div>
<div class="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
<!-- Toggle Item -->
<div class="flex items-center justify-between p-4 min-h-[72px]">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-medium text-slate-800 dark:text-slate-200">Public Contract Monitoring</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alerts on changes to exported APIs.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input checked="" class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
<!-- Toggle Item -->
<div class="flex items-center justify-between p-4 min-h-[72px]">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-medium text-slate-800 dark:text-slate-200">Complexity Alerts</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Flag functions with high cyclomatic complexity.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
</div>
</div>
<!-- Section 2: Test Engine -->
<div class="px-4 pt-6">
<div class="flex items-center gap-2 mb-3 px-1">
<span class="material-symbols-outlined text-slate-400 text-lg">science</span>
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Test Engine</h3>
</div>
<div class="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
<!-- Toggle Item -->
<div class="flex items-center justify-between p-4 min-h-[72px]">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-medium text-slate-800 dark:text-slate-200">Workflow Verification</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ensure CI/CD pipelines are triggered.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input checked="" class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
<!-- Toggle Item -->
<div class="flex items-center justify-between p-4 min-h-[72px]">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-medium text-slate-800 dark:text-slate-200">Coverage Check</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Warn if new code lacks unit tests.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input checked="" class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
</div>
</div>
<!-- Section 3: Doc Sync -->
<div class="px-4 pt-6">
<div class="flex items-center gap-2 mb-3 px-1">
<span class="material-symbols-outlined text-slate-400 text-lg">description</span>
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Doc Sync</h3>
</div>
<div class="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
<!-- Toggle Item -->
<div class="flex items-center justify-between p-4 min-h-[72px]">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-medium text-slate-800 dark:text-slate-200">Markdown Sync</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Auto-update READMEs based on code changes.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
<!-- Toggle Item -->
<div class="flex items-center justify-between p-4 min-h-[72px]">
<div class="flex flex-col justify-center pr-4">
<p class="text-sm font-medium text-slate-800 dark:text-slate-200">Comment Formatting</p>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Standardize inline documentation.</p>
</div>
<div class="shrink-0">
<label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200">
<div class="h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-all duration-200"></div>
<input checked="" class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
</div>
</div>
</main>
<!-- Sticky Footer -->
<footer class="shrink-0 w-full px-4 pt-4 pb-8 bg-white dark:bg-[#111318] border-t border-slate-200 dark:border-slate-800 z-20">
<button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
<span class="material-symbols-outlined text-[20px]">save</span>
            Save Changes
        </button>
</footer>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Readylayer Settings & Config 2","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Action Guard"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Readylayer Settings & Config 2","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
