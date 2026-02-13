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
0:{"P":null,"b":"8ZfsPSrfgPx8SRye8yuF4","c":["","stitch","stitch-runner-status-popover-runner-status-popover"],"q":"","i":false,"f":[[["",{"children":["stitch",{"children":[["slug","stitch-runner-status-popover-runner-status-popover","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/bc06321d88be975e.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:I[785,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-eeaefdb5c8c8cd5f.js"],"PublicShell"]
10:T1db0,<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Runner Status Popover</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#238636", // GitHub Green vibe for the primary action/status
                        "background-light": "#ffffff",
                        "background-dark": "#0d1117", // GitHub Dark background
                        "surface-light": "#f6f8fa",
                        "surface-dark": "#161b22",
                        "border-light": "#d0d7de",
                        "border-dark": "#30363d",
                        "text-primary-light": "#24292f",
                        "text-primary-dark": "#c9d1d9",
                        "text-secondary-light": "#57606a",
                        "text-secondary-dark": "#8b949e",
                    },
                    fontFamily: {
                        display: ["SF Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
                        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "6px",
                    },
                    boxShadow: {
                        'popover': '0 8px 24px rgba(140,149,159,0.2)',
                        'popover-dark': '0 8px 24px rgba(0,0,0,0.5)',
                    }
                },
            },
        };
    </script>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }@keyframes pulse-ring {
            0% { transform: scale(0.33); }
            80%, 100% { opacity: 0; }
        }
        @keyframes pulse-dot {
            0% { transform: scale(0.8); }
            50% { transform: scale(1); }
            100% { transform: scale(0.8); }
        }
        .pulse-ring {
            position: absolute;
            height: 100%;
            width: 100%;
            border-radius: 50%;
            animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .pulse-dot {
            position: relative;
            animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 dark:bg-black min-h-screen flex items-center justify-center font-sans p-4 antialiased">
<div class="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] transition-opacity"></div>
<div class="relative w-full max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-popover dark:shadow-popover-dark overflow-hidden transform transition-all duration-200 ease-in-out">
<div class="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-start justify-between">
<div>
<div class="flex items-baseline space-x-2">
<h2 class="text-lg font-display font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">ops-autopilot</h2>
</div>
<p class="text-xs font-display text-text-secondary-light dark:text-text-secondary-dark mt-1">v2.4.0-alpha</p>
</div>
<button class="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
<span class="material-icons-round text-xl">close</span>
</button>
</div>
<div class="px-5 py-6">
<div class="flex items-center space-x-3 mb-6">
<div class="relative flex items-center justify-center w-6 h-6">
<span class="pulse-ring bg-primary/40 inline-block"></span>
<span class="pulse-dot h-3 w-3 bg-primary rounded-full inline-block"></span>
</div>
<div>
<span class="block text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wide">Running</span>
<span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">Healthy check 2s ago</span>
</div>
</div>
<div class="grid grid-cols-1 gap-y-3 font-display text-sm">
<div class="flex justify-between items-center py-2 border-b border-dashed border-border-light dark:border-border-dark">
<span class="text-text-secondary-light dark:text-text-secondary-dark">Last Execution</span>
<span class="text-text-primary-light dark:text-text-primary-dark">Today, 10:42 AM</span>
</div>
<div class="flex justify-between items-center py-2 border-b border-dashed border-border-light dark:border-border-dark">
<span class="text-text-secondary-light dark:text-text-secondary-dark">Exit Reason</span>
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                        Success
                    </span>
</div>
<div class="flex justify-between items-center py-2 border-b border-dashed border-border-light dark:border-border-dark">
<span class="text-text-secondary-light dark:text-text-secondary-dark">Runner ID</span>
<span class="text-text-primary-light dark:text-text-primary-dark font-mono text-xs truncate max-w-[140px]" title="runner-aws-us-east-1-prod-04">runner-aws-us-east...</span>
</div>
<div class="flex justify-between items-center py-2">
<span class="text-text-secondary-light dark:text-text-secondary-dark">Uptime</span>
<span class="text-text-primary-light dark:text-text-primary-dark">4d 12h 30m</span>
</div>
</div>
</div>
<div class="bg-surface-light/50 dark:bg-surface-dark/50 px-5 py-4 border-t border-border-light dark:border-border-dark flex flex-col space-y-3">
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark text-sm font-medium">
<span class="material-icons-round text-base">replay</span>
<span>Rerun</span>
</button>
<button class="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark text-sm font-medium">
<span class="material-icons-round text-base">pause</span>
<span>Pause</span>
</button>
</div>
<a class="group flex items-center justify-center w-full py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors font-display" href="#">
<span class="mr-2 group-hover:underline decoration-primary decoration-1 underline-offset-4">View Full Logs</span>
<span class="material-icons-round text-sm transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
</div>
</div>

</body></html>6:["$","$Lf",null,{"title":"Runner Status Popover","children":[["$","div",null,{"className":"mb-3 text-sm text-gray-500","children":["Category: ","Runtime Status"]}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Runner Status Popover","srcDoc":"$10","className":"h-[1100px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}]
