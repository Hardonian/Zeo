1:"$Sreact.fragment"
2:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T1e0c,<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Active Audio Capture</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#135bec",
                        "accent-cyan": "#06b6d4",
                        "accent-emerald": "#10b981",
                        "background-light": "#f6f6f8",
                        "background-dark": "#0f172a","surface-dark": "#1e293b",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["Roboto Mono", "monospace"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.375rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'wave': 'wave 1.5s ease-in-out infinite',
                    },
                    keyframes: {
                        wave: {
                            '0%, 100%': { height: '10%' },
                            '50%': { height: '100%' },
                        }
                    }
                },
            },
        }
    </script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Roboto+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100dvh;
        }
        .font-mono {
            font-family: 'Roboto Mono', monospace;
        }.wave-bar {
            animation: wave 1.2s ease-in-out infinite;
            transform-origin: center;
        }
        .wave-bar:nth-child(odd) { animation-duration: 0.8s; }
        .wave-bar:nth-child(2n) { animation-duration: 1.1s; }
        .wave-bar:nth-child(3n) { animation-duration: 1.3s; }
        .wave-bar:nth-child(4n) { animation-duration: 0.9s; }
        .wave-bar:nth-child(5n) { animation-duration: 1.5s; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-dark text-white flex flex-col antialiased h-screen overflow-hidden relative">
<div class="absolute top-6 right-6 z-20 flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50 shadow-lg">
<span class="material-symbols-outlined text-emerald-400 text-[18px]">security</span>
<span class="text-[10px] font-semibold tracking-wide text-emerald-100 uppercase">Local Capture</span>
</div>
<main class="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6 relative z-10">
<div class="mb-12 flex flex-col items-center gap-3">
<div class="flex items-center gap-2">
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
</span>
<h2 class="text-sm font-semibold tracking-widest text-red-400 uppercase">Recording Audio</h2>
</div>
<p class="text-slate-400 text-xs">Evidence Mode Active</p>
</div>
<div aria-hidden="true" class="h-32 w-full flex items-center justify-center gap-1 mb-8">
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-4 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-8 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-12 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-6 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-16 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-24 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-10 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-20 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-32 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-14 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-28 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-18 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-8 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-20 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-12 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-6 wave-bar"></div>
<div class="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full h-4 wave-bar"></div>
</div>
<div class="text-6xl font-mono font-medium tracking-tight text-white tabular-nums mb-12 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            00:42
        </div>
<div class="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
<div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center justify-center">
<span class="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Bitrate</span>
<span class="font-mono text-emerald-400 font-semibold text-sm">256 kbps</span>
</div>
<div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center justify-center">
<span class="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Est. Size</span>
<span class="font-mono text-cyan-400 font-semibold text-sm">1.8 MB</span>
</div>
</div>
</main>
<footer class="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 safe-area-bottom">
<div class="flex flex-col gap-4 max-w-md mx-auto">
<button class="w-full group bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white h-16 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
<div class="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm group-hover:scale-90 transition-transform">
<div class="w-3 h-3 bg-emerald-600 rounded-[1px]"></div>
</div>
<span class="text-lg font-bold tracking-wide">Stop &amp; Save</span>
</button>
<button class="w-full h-12 flex items-center justify-center text-slate-400 hover:text-white font-medium transition-colors">
                Cancel Recording
            </button>
</div>
<div class="flex justify-center mt-4 mb-1">
<div class="h-1 w-1/3 bg-slate-700 rounded-full"></div>
</div>
</footer>
<div class="fixed top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div class="fixed bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

</body></html>0:{"buildId":"8ZfsPSrfgPx8SRye8yuF4","rsc":["$","$1","c",{"children":[["$","$L2",null,{"title":"Quick Capture Panel 2","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Decision Intelligence"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Quick Capture Panel 2","srcDoc":"$3","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
