1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T253c,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo - Edge Status &amp; Connectivity</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0df26c",
                        "background-light": "#f5f8f7",
                        "background-dark": "#102217",
                        "surface-dark": "#162e21",
                        "surface-darker": "#0a160f"
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Custom scrollbar for the log */
        .log-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .log-scroll::-webkit-scrollbar-track {
            background: #102217; 
        }
        .log-scroll::-webkit-scrollbar-thumb {
            background: #234f36; 
            border-radius: 2px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display h-screen w-full flex flex-col items-center justify-end overflow-hidden relative">
<!-- Abstract Background representing data flow/intelligence -->
<div class="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay pointer-events-none" data-alt="Abstract cybernetic green data stream pattern" style="background-image: linear-gradient(to bottom, transparent, #102217), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBPsIshffoHEBNo0ggK1EyGpQKtyAhOwI428wo2DopXUT5BixGJJKAZlPEAnCv8xiuZybShGHE63LHQwsYpW5rv5uyiTGkYCSbQHvs6f1EQDoB1yDRgaOIfxQccSEaan332W0pyopKVNGVxSr04K5mpziSvVAvyJyBfPYWP7ZUoWAj8wtAiHSQtQZXd3RWvXFtPyzH24hFN73zJPVm62v1TfDFGGPeGiS_E9fc-fTEai8knUwFYcLVE3LEC8Pn00OUXsuzEwshn7g');">
</div>
<!-- Main Content Area (Placeholder for the app behind the sheet) -->
<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 opacity-20 pointer-events-none">
<h1 class="text-4xl font-bold text-white mb-4">ZEO INTELLIGENCE</h1>
<div class="w-full max-w-md h-64 bg-surface-dark rounded-xl border border-primary/20"></div>
</div>
<!-- Bottom Sheet Container -->
<div class="w-full max-w-md z-10 relative">
<!-- Sheet Handle & Body -->
<div class="flex flex-col w-full bg-surface-dark/95 backdrop-blur-md dark:bg-[#121e17]/95 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(13,242,108,0.2)] border-t border-primary/20 overflow-hidden transition-all duration-300 ease-out max-h-[85vh]">
<!-- Handle Area -->
<div class="w-full flex justify-center pt-3 pb-2 cursor-pointer group">
<div class="w-12 h-1.5 bg-white/20 rounded-full group-hover:bg-primary/50 transition-colors"></div>
</div>
<!-- Header Section -->
<div class="px-6 pb-4 pt-2 border-b border-white/5">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<div class="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(13,242,108,0.8)]"></div>
<h2 class="text-white text-lg font-bold tracking-tight">SYSTEM: EDGE-NATIVE</h2>
</div>
<span class="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">ONLINE</span>
</div>
<p class="text-xs text-gray-400 font-mono">ID: ZEO-NODE-88X • UPTIME: 14H 32M</p>
</div>
<!-- Scrollable Content -->
<div class="overflow-y-auto pb-8">
<!-- Buffer Usage -->
<div class="px-6 py-5">
<div class="flex justify-between items-end mb-2">
<span class="text-xs font-semibold tracking-wider text-gray-400 uppercase">Local Evidence Buffer</span>
<span class="text-xs font-mono text-primary">128 MB <span class="text-gray-500">/ 1024 MB</span></span>
</div>
<div class="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
<div class="h-full bg-primary shadow-[0_0_10px_rgba(13,242,108,0.5)] rounded-full" style="width: 12.5%"></div>
</div>
</div>
<!-- Metrics Grid -->
<div class="grid grid-cols-2 gap-3 px-6 pb-6">
<!-- Metric Card: Latency -->
<div class="bg-black/20 border border-white/10 rounded-lg p-3 hover:border-primary/30 transition-colors group">
<div class="flex items-center gap-2 mb-1 text-gray-400">
<span class="material-symbols-outlined text-[18px]">network_check</span>
<span class="text-[10px] font-bold tracking-widest uppercase">Latency</span>
</div>
<div class="flex items-baseline gap-1">
<span class="text-2xl font-bold text-white group-hover:text-primary transition-colors font-mono">14</span>
<span class="text-xs text-gray-500">ms</span>
</div>
<div class="w-full h-4 mt-2 flex items-end gap-0.5 opacity-50">
<div class="w-1 h-[40%] bg-primary"></div>
<div class="w-1 h-[60%] bg-primary"></div>
<div class="w-1 h-[30%] bg-primary"></div>
<div class="w-1 h-[50%] bg-primary"></div>
<div class="w-1 h-[45%] bg-primary"></div>
<div class="w-1 h-[70%] bg-primary"></div>
<div class="w-1 h-[30%] bg-primary"></div>
<div class="w-1 h-[40%] bg-primary"></div>
</div>
</div>
<!-- Metric Card: Crypto-Integrity -->
<div class="bg-black/20 border border-white/10 rounded-lg p-3 hover:border-primary/30 transition-colors group">
<div class="flex items-center gap-2 mb-1 text-gray-400">
<span class="material-symbols-outlined text-[18px]">verified_user</span>
<span class="text-[10px] font-bold tracking-widest uppercase">Integrity</span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="text-lg font-bold text-primary tracking-tight">VERIFIED</span>
<span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
</div>
<div class="mt-2 text-[10px] text-gray-500 leading-tight">SHA-256 Hash Match</div>
</div>
</div>
<!-- Sync Status List Item -->
<div class="px-6 pb-6">
<div class="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-[18px] animate-[spin_3s_linear_infinite]">sync</span>
</div>
<div class="flex flex-col">
<span class="text-sm font-medium text-white">Offline Sync Status</span>
<span class="text-[10px] text-gray-400">Last sync: 2s ago</span>
</div>
</div>
<div class="flex items-center gap-2">
<div class="h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(13,242,108,0.8)]"></div>
<span class="text-xs font-mono text-primary">IDLE</span>
</div>
</div>
</div>
<!-- Terminal Log (Micro) -->
<div class="px-6 pb-6">
<div class="bg-black rounded-md border border-white/10 p-3 font-mono text-[10px] h-20 overflow-y-auto log-scroll">
<div class="text-gray-500 border-b border-white/5 pb-1 mb-1 flex justify-between">
<span>SYSTEM_LOG</span>
<span>v2.4.1</span>
</div>
<div class="flex gap-2 text-gray-400">
<span class="text-primary/50">[14:32:01]</span>
<span>Handshake initiated...</span>
</div>
<div class="flex gap-2 text-gray-400">
<span class="text-primary/50">[14:32:02]</span>
<span>Buffer cleared (128MB freed)</span>
</div>
<div class="flex gap-2 text-white">
<span class="text-primary">[14:32:05]</span>
<span>Bridge connection stable.</span>
</div>
<div class="flex gap-2 text-gray-400 opacity-50">
<span class="text-primary/50">[14:31:55]</span>
<span>Pre-fetch started</span>
</div>
</div>
</div>
<!-- Force Local Processing Toggle -->
<div class="px-6">
<div class="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
<div class="flex flex-col gap-0.5">
<span class="text-sm font-bold text-white">Force Local Processing</span>
<span class="text-[11px] text-gray-400">Disconnect from Bridge API cloud relay</span>
</div>
<!-- Custom Toggle Switch -->
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
<!-- Bottom safe area spacer for mobile -->
<div class="h-6 w-full"></div>
</div>
</div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Edge Status & Connectivity 1"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Decision Intelligence"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Edge Status & Connectivity 1","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
