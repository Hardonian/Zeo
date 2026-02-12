1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-e24765025faea277.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/51624f46484614f8.css","style"]
0:{"P":null,"b":"ncTonRn3hvG10lbw3EzX3","c":["","stitch","quick-capture-panel-2"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","quick-capture-panel-2","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/51624f46484614f8.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first public site and dashboard shell for Zeo."}]]
f:T1e0c,<!DOCTYPE html>
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

</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L5",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L5","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L5","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L5","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L5","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L5","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L5","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L5",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Quick Capture Panel 2"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Quick Capture Panel 2","srcDoc":"$f","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L10"]}]
10:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L5",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L5",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
