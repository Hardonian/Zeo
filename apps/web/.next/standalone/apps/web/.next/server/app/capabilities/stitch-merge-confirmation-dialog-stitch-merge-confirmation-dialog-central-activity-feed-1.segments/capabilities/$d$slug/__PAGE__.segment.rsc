1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T32e3,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ReadyLayer Activity Feed</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
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
                        "surface-dark": "#1c2333", // Slightly lighter than background-dark for cards
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
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center py-4">
<!-- Mobile Container (Simulating iOS Device) -->
<div class="relative flex h-full min-h-[800px] w-full max-w-[400px] flex-col overflow-hidden bg-background-light dark:bg-background-dark shadow-2xl sm:rounded-[32px] sm:border-[8px] sm:border-[#2d3139]">
<!-- Status Bar Placeholder (iOS Style) -->
<div class="h-11 w-full bg-background-light dark:bg-background-dark flex items-center justify-between px-6 z-20 shrink-0">
<div class="text-sm font-semibold dark:text-white">9:41</div>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px] dark:text-white">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[18px] dark:text-white">wifi</span>
<span class="material-symbols-outlined text-[18px] dark:text-white">battery_full</span>
</div>
</div>
<!-- Header -->
<header class="flex items-center justify-between px-5 py-4 bg-background-light dark:bg-background-dark z-10 sticky top-0">
<h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Activity Feed</h1>
<button class="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-gray-900 dark:text-white">notifications</span>
<span class="absolute top-2 right-2.5 flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
</button>
</header>
<!-- Filter Chips -->
<div class="flex gap-3 px-5 pb-4 overflow-x-auto no-scrollbar snap-x shrink-0">
<button class="snap-start flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary px-4 shadow-lg shadow-primary/20 transition-transform active:scale-95">
<span class="material-symbols-outlined text-white text-[18px]">check</span>
<span class="text-white text-sm font-medium">All</span>
</button>
<button class="snap-start flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700/50 px-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-transform active:scale-95">
<span class="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[18px]">search</span>
<span class="text-gray-700 dark:text-gray-300 text-sm font-medium">Review</span>
</button>
<button class="snap-start flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700/50 px-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-transform active:scale-95">
<span class="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[18px]">science</span>
<span class="text-gray-700 dark:text-gray-300 text-sm font-medium">Test</span>
</button>
<button class="snap-start flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700/50 px-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-transform active:scale-95">
<span class="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[18px]">description</span>
<span class="text-gray-700 dark:text-gray-300 text-sm font-medium">Doc</span>
</button>
</div>
<!-- Timeline Feed -->
<div class="flex-1 overflow-y-auto px-5 pb-24 space-y-0 relative">
<!-- Timeline Item 1 -->
<div class="group relative flex gap-4 pb-8 last:pb-0">
<!-- Timeline Line -->
<div class="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 group-last:hidden"></div>
<!-- Icon -->
<div class="relative z-10 shrink-0">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 ring-4 ring-background-light dark:ring-background-dark">
<span class="material-symbols-outlined">check_circle</span>
</div>
</div>
<!-- Content -->
<div class="flex flex-col pt-1 w-full cursor-pointer active:opacity-70 transition-opacity">
<div class="flex justify-between items-start">
<h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">Doc Drift fixed in PR #12</h3>
<span class="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">5m ago</span>
</div>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
<span class="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
                        Repo-Core
                    </p>
</div>
</div>
<!-- Timeline Item 2 -->
<div class="group relative flex gap-4 pb-8 last:pb-0">
<div class="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 group-last:hidden"></div>
<div class="relative z-10 shrink-0">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-4 ring-background-light dark:ring-background-dark">
<span class="material-symbols-outlined">verified_user</span>
</div>
</div>
<div class="flex flex-col pt-1 w-full cursor-pointer active:opacity-70 transition-opacity">
<div class="flex justify-between items-start">
<h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">Test Engine verified v2.1-beta</h3>
<span class="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">1h ago</span>
</div>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
<span class="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                        Repo-Utils
                        <span class="ml-1 rounded bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-600 dark:text-gray-300">v2.1</span>
</p>
</div>
</div>
<!-- Timeline Item 3 (Warning) -->
<div class="group relative flex gap-4 pb-8 last:pb-0">
<div class="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 group-last:hidden"></div>
<div class="relative z-10 shrink-0">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-4 ring-background-light dark:ring-background-dark">
<span class="material-symbols-outlined">warning</span>
</div>
</div>
<div class="flex flex-col pt-1 w-full cursor-pointer active:opacity-70 transition-opacity">
<div class="flex justify-between items-start">
<h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">Review Guard flagged 3 areas</h3>
<span class="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">2h ago</span>
</div>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
<span class="inline-block h-2 w-2 rounded-full bg-cyan-500"></span>
                        Repo-X
                    </p>
<!-- Embedded Chip -->
<div class="mt-2 flex">
<span class="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                             3 Security Flags
                        </span>
</div>
</div>
</div>
<!-- Timeline Item 4 (AI) -->
<div class="group relative flex gap-4 pb-8 last:pb-0">
<div class="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 group-last:hidden"></div>
<div class="relative z-10 shrink-0">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary ring-4 ring-background-light dark:ring-background-dark">
<span class="material-symbols-outlined">auto_awesome</span>
</div>
</div>
<div class="flex flex-col pt-1 w-full cursor-pointer active:opacity-70 transition-opacity">
<div class="flex justify-between items-start">
<h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">AI Suggested optimization</h3>
<span class="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">4h ago</span>
</div>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
<span class="inline-block h-2 w-2 rounded-full bg-pink-500"></span>
                        Repo-Auth
                    </p>
<div class="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-3 shadow-sm">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-[16px] text-primary">code</span>
<span class="text-xs font-mono text-gray-600 dark:text-gray-300">auth_controller.ts</span>
</div>
<div class="h-1.5 w-full rounded bg-gray-100 dark:bg-gray-700 mb-1.5">
<div class="h-1.5 w-3/4 rounded bg-primary/40"></div>
</div>
<div class="h-1.5 w-2/3 rounded bg-gray-100 dark:bg-gray-700">
<div class="h-1.5 w-1/2 rounded bg-primary/40"></div>
</div>
<div class="mt-2 text-xs text-primary font-medium">View Suggestion →</div>
</div>
</div>
</div>
<!-- Timeline Item 5 -->
<div class="group relative flex gap-4 pb-8 last:pb-0">
<div class="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 group-last:hidden"></div>
<div class="relative z-10 shrink-0">
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-4 ring-background-light dark:ring-background-dark">
<span class="material-symbols-outlined">commit</span>
</div>
</div>
<div class="flex flex-col pt-1 w-full cursor-pointer active:opacity-70 transition-opacity">
<div class="flex justify-between items-start">
<h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">Merge branch 'feat/user-api'</h3>
<span class="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">6h ago</span>
</div>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
<span class="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
                        Repo-Core
                    </p>
</div>
</div>
</div>
<!-- Floating Gradient for Bottom Navigation -->
<div class="pointer-events-none absolute bottom-[60px] left-0 right-0 h-12 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-20"></div>
<!-- Bottom Navigation -->
<nav class="absolute bottom-0 w-full bg-white dark:bg-[#1c1f27] border-t border-gray-200 dark:border-gray-800/60 pb-5 pt-2 px-2 z-30">
<div class="flex justify-around items-end">
<a class="flex flex-1 flex-col items-center justify-center gap-1 text-primary" href="#">
<div class="flex h-8 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
<span class="material-symbols-outlined text-[24px]">view_list</span>
</div>
<span class="text-[10px] font-medium tracking-wide">Feed</span>
</a>
<a class="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" href="#">
<div class="flex h-8 w-12 items-center justify-center">
<span class="material-symbols-outlined text-[24px]">dataset</span>
</div>
<span class="text-[10px] font-medium tracking-wide">Repos</span>
</a>
<a class="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" href="#">
<div class="flex h-8 w-12 items-center justify-center">
<span class="material-symbols-outlined text-[24px]">settings</span>
</div>
<span class="text-[10px] font-medium tracking-wide">Settings</span>
</a>
</div>
</nav>
</div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Central Activity Feed 1"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Collaboration"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Central Activity Feed 1","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
