1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T29c0,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Quick Capture</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Theme Configuration -->
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
                        "display": ["Inter", "sans-serif"],
                        "mono": ["Roboto Mono", "monospace"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.375rem", // rounded-md (~6px)
                        "lg": "0.5rem",       // rounded-lg (~8px)
                        "xl": "0.75rem",      // rounded-xl (~12px)
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Roboto+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .font-mono {
            font-family: 'Roboto Mono', monospace;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white flex flex-col antialiased">
<!-- Header -->
<header class="flex items-center justify-between px-4 pt-6 pb-4 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800/50">
<div class="w-10 h-10 flex items-center justify-center">
<button class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<h1 class="text-lg font-bold tracking-tight">Quick Capture</h1>
<div class="w-10 h-10 flex items-center justify-center">
<!-- Placeholder for balance, or could be a settings icon -->
<span class="material-symbols-outlined text-slate-400 dark:text-slate-600">settings</span>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 px-4 py-6 flex flex-col gap-8 overflow-y-auto">
<!-- Action Grid -->
<section aria-label="Input Sources">
<h2 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Input Sources</h2>
<div class="grid grid-cols-1 gap-3">
<button class="group flex items-center justify-between w-full h-16 px-5 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-[0.98]">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">photo_camera</span>
</div>
<span class="text-base font-semibold text-slate-900 dark:text-white">Capture Photo</span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500">chevron_right</span>
</button>
<button class="group flex items-center justify-between w-full h-16 px-5 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-[0.98]">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">mic</span>
</div>
<span class="text-base font-semibold text-slate-900 dark:text-white">Record Audio</span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500">chevron_right</span>
</button>
<button class="group flex items-center justify-between w-full h-16 px-5 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-[0.98]">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">content_paste</span>
</div>
<span class="text-base font-semibold text-slate-900 dark:text-white">Paste Text</span>
</div>
<span class="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500">chevron_right</span>
</button>
</div>
</section>
<!-- System Status -->
<section aria-label="System Status">
<h2 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Permissions &amp; Status</h2>
<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
<div class="flex items-center justify-between text-sm">
<span class="text-slate-600 dark:text-slate-400 font-medium">Camera Access</span>
<div class="flex items-center gap-2">
<span class="text-emerald-600 dark:text-emerald-400 font-semibold">Authorized</span>
<span class="block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
</div>
</div>
<div class="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
<div class="flex items-center justify-between text-sm">
<span class="text-slate-600 dark:text-slate-400 font-medium">Microphone Access</span>
<div class="flex items-center gap-2">
<span class="text-amber-600 dark:text-amber-400 font-semibold">Pending</span>
<span class="block w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse"></span>
</div>
</div>
<div class="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
<div class="flex items-center justify-between text-sm">
<span class="text-slate-600 dark:text-slate-400 font-medium">Clipboard Access</span>
<div class="flex items-center gap-2">
<span class="text-emerald-600 dark:text-emerald-400 font-semibold">Authorized</span>
<span class="block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
</div>
</div>
</div>
</section>
<!-- Pending Uploads -->
<section aria-label="Upload Queue" class="pb-24">
<div class="flex items-center justify-between mb-3">
<h2 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Uploads (2)</h2>
<button class="text-xs text-primary font-medium hover:text-primary/80">Clear All</button>
</div>
<div class="space-y-3">
<!-- Item 1: Image -->
<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
<div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
<div class="flex items-start justify-between gap-3">
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-slate-400 text-[18px]">image</span>
<h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">img_2023_scan_raw.jpg</h3>
</div>
<div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-2">
<span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">JPG</span>
<span>2.4 MB</span>
</div>
<div class="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-100 dark:border-slate-800 truncate">
                                SHA: a1b2c3d4e5f6...9f8e7d6c5b4a
                            </div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Ready to Send</span>
<button class="text-slate-400 hover:text-red-500 mt-2 p-1">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
<!-- Item 2: Audio -->
<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
<div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
<div class="flex items-start justify-between gap-3">
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-slate-400 text-[18px]">mic_none</span>
<h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">voice_memo_004.wav</h3>
</div>
<div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-2">
<span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">WAV</span>
<span>14.2 MB</span>
</div>
<div class="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-100 dark:border-slate-800 truncate">
                                SHA: 8e7d6c5b4a3b...2c3d4e5f6a1b
                            </div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Ready to Send</span>
<button class="text-slate-400 hover:text-red-500 mt-2 p-1">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- Sticky Footer -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20">
<button class="w-full bg-primary hover:bg-blue-600 text-white font-bold h-14 rounded-lg shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]">
<span>Send to Zeo (2)</span>
<span class="material-symbols-outlined">send</span>
</button>
<div class="flex justify-center mt-3 mb-1">
<div class="h-1 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
</div>
</div>
</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Quick Capture Panel 1","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Quick Capture Panel 1","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
