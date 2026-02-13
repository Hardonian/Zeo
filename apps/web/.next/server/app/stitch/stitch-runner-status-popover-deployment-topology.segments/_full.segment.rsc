1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-17b4afe27e88d3cd.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/bc06321d88be975e.css","style"]
0:{"P":null,"b":"8ZfsPSrfgPx8SRye8yuF4","c":["","stitch","stitch-runner-status-popover-deployment-topology"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","stitch-runner-status-popover-deployment-topology","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/bc06321d88be975e.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
10:T3cce,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Zeo Topology</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#136dec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101822",
                        "border-dark": "#1f2937",
                        "node-bg": "#161f2c",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"]
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
<style>
        body {
            font-family: 'Space Grotesk', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .topology-grid {
            background-image: radial-gradient(circle, #1f2937 1px, transparent 1px);
            background-size: 24px 24px;
        }
        .active-edge {
            stroke: #136dec;
            stroke-width: 2;
        }
        .inactive-edge {
            stroke: #374151;
            stroke-width: 1;
            stroke-dasharray: 4;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-hidden h-screen flex flex-col">
<!-- Top Navigation Bar -->
<header class="flex items-center justify-between px-4 py-3 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-border-dark z-20">
<div class="flex items-center gap-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">hub</span>
<h1 class="text-sm font-bold tracking-tight uppercase">Zeo <span class="text-slate-500 font-medium">Topology</span></h1>
</div>
<div class="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-2"></div>
<div class="flex gap-2">
<button class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-primary text-white">All Providers</button>
<button class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">AWS</button>
<button class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">GCP</button>
<button class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">On-Prem</button>
</div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 text-[10px] font-medium text-slate-500">
<span class="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
<span>SYSTEM STABLE</span>
</div>
<button class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
<span class="material-symbols-outlined text-sm">settings</span>
</button>
</div>
</header>
<!-- Main Topology View -->
<main class="flex-1 relative overflow-hidden flex">
<!-- Sidebar Controls -->
<aside class="w-14 border-r border-slate-200 dark:border-border-dark flex flex-col items-center py-4 gap-4 bg-white dark:bg-background-dark z-10">
<button class="p-2 rounded bg-primary/10 text-primary">
<span class="material-symbols-outlined">zoom_in</span>
</button>
<button class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
<span class="material-symbols-outlined">zoom_out</span>
</button>
<button class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
<span class="material-symbols-outlined">center_focus_strong</span>
</button>
<div class="h-[1px] w-8 bg-slate-200 dark:bg-slate-800"></div>
<button class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
<span class="material-symbols-outlined">layers</span>
</button>
</aside>
<!-- Topology Canvas -->
<div class="flex-1 relative topology-grid overflow-auto bg-slate-50 dark:bg-background-dark/50">
<!-- Connection Lines (SVG Layer) -->
<svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
<!-- Row 1 Connections -->
<path class="active-edge" d="M 280 150 L 520 150"></path>
<path class="inactive-edge" d="M 280 150 L 520 280"></path>
<!-- Row 2 Connections -->
<path class="active-edge" d="M 280 280 L 520 150"></path>
<path class="active-edge" d="M 280 280 L 520 280"></path>
<path class="inactive-edge" d="M 280 280 L 520 410"></path>
<!-- Row 3 Connections -->
<path class="active-edge" d="M 280 410 L 520 410"></path>
<path class="inactive-edge" d="M 280 410 L 520 540"></path>
<!-- Row 4 Connections -->
<path class="active-edge" d="M 280 540 L 520 540"></path>
<path class="inactive-edge" d="M 280 540 L 520 670"></path>
</svg>
<!-- Node Layers -->
<div class="p-12 min-w-[1200px] grid grid-cols-2 gap-x-64 relative">
<!-- Runner Column -->
<div class="space-y-8">
<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Runners <span class="ml-2 px-1 border border-slate-700 text-slate-500">4 ACTIVE</span></h3>
<!-- Runner Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-colors">
<div class="flex items-center gap-3">
<div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,109,236,0.6)]"></div>
<div>
<div class="text-[11px] font-bold text-slate-700 dark:text-slate-200">runner-us-east-1a</div>
<div class="text-[9px] text-slate-500 font-medium">m5.large | ubuntu-22.04</div>
</div>
</div>
<div class="text-[9px] font-mono text-slate-400">12ms</div>
</div>
<!-- Runner Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-primary dark:border-primary/50 rounded-sm flex items-center justify-between group cursor-pointer ring-1 ring-primary/20">
<div class="flex items-center gap-3">
<div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,109,236,0.6)]"></div>
<div>
<div class="text-[11px] font-bold text-slate-700 dark:text-slate-200">runner-us-east-1b</div>
<div class="text-[9px] text-slate-500 font-medium">m5.large | ubuntu-22.04</div>
</div>
</div>
<div class="text-[9px] font-mono text-slate-400">8ms</div>
</div>
<!-- Runner Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-colors">
<div class="flex items-center gap-3">
<div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,109,236,0.6)]"></div>
<div>
<div class="text-[11px] font-bold text-slate-700 dark:text-slate-200">runner-eu-west-1a</div>
<div class="text-[9px] text-slate-500 font-medium">t3.medium | ubuntu-22.04</div>
</div>
</div>
<div class="text-[9px] font-mono text-slate-400">42ms</div>
</div>
<!-- Runner Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-colors">
<div class="flex items-center gap-3">
<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
<div>
<div class="text-[11px] font-bold text-slate-700 dark:text-slate-200">runner-gcp-main-01</div>
<div class="text-[9px] text-slate-500 font-medium">n2-std-4 | container-os</div>
</div>
</div>
<div class="text-[9px] font-mono text-slate-400">15ms</div>
</div>
<!-- Runner Node (Alert State) -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-rose-500/50 dark:border-rose-500/30 rounded-sm flex items-center justify-between group cursor-pointer">
<div class="flex items-center gap-3">
<div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
<div>
<div class="text-[11px] font-bold text-slate-700 dark:text-slate-200">runner-onprem-dc1</div>
<div class="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">Connection Timeout</div>
</div>
</div>
<span class="material-symbols-outlined text-rose-500 text-xs">warning</span>
</div>
</div>
<!-- Environment Column -->
<div class="space-y-8">
<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Environments <span class="ml-2 px-1 border border-slate-700 text-slate-500">PROD READY</span></h3>
<!-- Environment Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm group">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-slate-400">cloud</span>
<span class="text-[11px] font-bold text-slate-200">env-aws-production</span>
</div>
<span class="text-[8px] font-bold px-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">AWS</span>
</div>
<div class="grid grid-cols-2 gap-1 mt-2">
<div class="h-1 bg-primary rounded-full"></div>
<div class="h-1 bg-primary rounded-full"></div>
</div>
<div class="mt-2 flex justify-between text-[8px] text-slate-500 font-mono">
<span>US-EAST-1</span>
<span>EKS-CLUSTER-01</span>
</div>
</div>
<!-- Environment Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm group">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-slate-400">cloud_queue</span>
<span class="text-[11px] font-bold text-slate-200">env-gcp-staging</span>
</div>
<span class="text-[8px] font-bold px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">GCP</span>
</div>
<div class="grid grid-cols-3 gap-1 mt-2">
<div class="h-1 bg-primary rounded-full"></div>
<div class="h-1 bg-slate-700 rounded-full"></div>
<div class="h-1 bg-slate-700 rounded-full"></div>
</div>
<div class="mt-2 flex justify-between text-[8px] text-slate-500 font-mono">
<span>EUROPE-WEST2</span>
<span>GKE-STAGING</span>
</div>
</div>
<!-- Environment Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm group">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-slate-400">dns</span>
<span class="text-[11px] font-bold text-slate-200">env-onprem-legacy</span>
</div>
<span class="text-[8px] font-bold px-1 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">DC</span>
</div>
<div class="grid grid-cols-1 gap-1 mt-2">
<div class="h-1 bg-primary/30 rounded-full"></div>
</div>
<div class="mt-2 flex justify-between text-[8px] text-slate-500 font-mono">
<span>DC-LONDON-01</span>
<span>VMWARE-CLUSTER</span>
</div>
</div>
<!-- Environment Node -->
<div class="w-64 p-3 bg-white dark:bg-node-bg border border-slate-200 dark:border-border-dark rounded-sm group">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-slate-400">cloud_done</span>
<span class="text-[11px] font-bold text-slate-200">env-aws-qa-test</span>
</div>
<span class="text-[8px] font-bold px-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">AWS</span>
</div>
<div class="grid grid-cols-2 gap-1 mt-2">
<div class="h-1 bg-primary rounded-full"></div>
<div class="h-1 bg-slate-700 rounded-full"></div>
</div>
<div class="mt-2 flex justify-between text-[8px] text-slate-500 font-mono">
<span>US-WEST-2</span>
<span>EKS-TEST-02</span>
</div>
</div>
</div>
</div>
<!-- Path Detail Overlay (Visible on focus) -->
<div class="absolute top-24 left-[400px] w-48 bg-background-dark/95 border border-primary p-3 rounded-sm shadow-2xl z-30 pointer-events-none">
<div class="text-[10px] font-bold text-primary uppercase mb-1">Active Path Detail</div>
<div class="flex justify-between text-[9px] mb-1">
<span class="text-slate-500">Throughput</span>
<span class="text-slate-200 font-mono">1.2 Gbps</span>
</div>
<div class="flex justify-between text-[9px] mb-1">
<span class="text-slate-500">Latency</span>
<span class="text-slate-200 font-mono">8.42 ms</span>
</div>
<div class="flex justify-between text-[9px]">
<span class="text-slate-500">MTU</span>
<span class="text-slate-200 font-mono">1500</span>
</div>
<div class="mt-2 h-8 w-full bg-primary/10 flex items-end gap-[1px]">
<div class="h-2 w-full bg-primary/40"></div>
<div class="h-4 w-full bg-primary/40"></div>
<div class="h-3 w-full bg-primary/40"></div>
<div class="h-6 w-full bg-primary/60"></div>
<div class="h-5 w-full bg-primary/40"></div>
<div class="h-7 w-full bg-primary/70"></div>
</div>
</div>
</div>
<!-- MiniMap Overlay -->
<div class="absolute bottom-6 right-6 w-48 h-32 bg-background-dark/80 border border-border-dark rounded-sm overflow-hidden pointer-events-none hidden md:block backdrop-blur-sm">
<div class="absolute inset-0 opacity-20">
<div class="absolute top-4 left-4 w-12 h-4 bg-slate-400"></div>
<div class="absolute top-12 left-4 w-12 h-4 bg-slate-400"></div>
<div class="absolute top-20 left-4 w-12 h-4 bg-slate-400"></div>
<div class="absolute top-4 right-4 w-12 h-4 bg-slate-400"></div>
<div class="absolute top-12 right-4 w-12 h-4 bg-slate-400"></div>
<svg class="absolute inset-0 w-full h-full">
<line stroke="white" stroke-width="1" x1="60" x2="130" y1="20" y2="20"></line>
<line stroke="white" stroke-width="1" x1="60" x2="130" y1="50" y2="50"></line>
</svg>
</div>
<div class="absolute inset-4 border border-primary/50 pointer-events-none"></div>
<div class="absolute bottom-1 right-1 text-[8px] font-mono text-slate-600 uppercase">Navigator</div>
</div>
</main>
<!-- Footer Stats -->
<footer class="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-border-dark px-4 py-2 flex items-center justify-between text-[10px]">
<div class="flex items-center gap-6">
<div class="flex items-center gap-2">
<span class="text-slate-500 uppercase">Total Nodes:</span>
<span class="font-bold">248</span>
</div>
<div class="flex items-center gap-2">
<span class="text-slate-500 uppercase">Active Links:</span>
<span class="font-bold text-primary">1,042</span>
</div>
<div class="flex items-center gap-2">
<span class="text-slate-500 uppercase">Error Rate:</span>
<span class="font-bold text-rose-500">0.02%</span>
</div>
</div>
<div class="flex items-center gap-2 text-slate-500">
<span class="material-symbols-outlined text-xs">schedule</span>
<span class="font-mono">Refreshed: 2023-10-27 14:02:11 UTC</span>
</div>
</footer>
</body></html>6:["$","$Lf",null,{"title":"Deployment Topology","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Runtime Status"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Deployment Topology","srcDoc":"$10","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}]
