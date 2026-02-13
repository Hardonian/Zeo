1:"$Sreact.fragment"
2:I[9065,[],""]
3:I[6815,["8039","static/chunks/app/error-e24765025faea277.js"],"default"]
4:I[3613,[],""]
5:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
7:I[8028,[],"OutletBoundary"]
8:"$Sreact.suspense"
a:I[8028,[],"ViewportBoundary"]
c:I[8028,[],"MetadataBoundary"]
e:I[7211,[],""]
:HL["/_next/static/css/37847ea80569b263.css","style"]
0:{"P":null,"b":"J_kVknmu6GSF5qixhc85u","c":["","capabilities","stitch-merge-confirmation-dialog-stitch-merge-confirmation-dialog-in-line-explanation-popover-2"],"q":"","i":false,"f":[[["",{"children":["capabilities",{"children":[["slug","stitch-merge-confirmation-dialog-stitch-merge-confirmation-dialog-in-line-explanation-popover-2","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/37847ea80569b263.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"antialiased bg-gray-50 text-gray-900","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","main",null,{"className":"mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center","children":[["$","h1",null,{"className":"text-3xl font-semibold","children":"Page not found"}],["$","p",null,{"className":"mt-3 text-gray-600","children":"The page you requested could not be found."}],["$","$L5",null,{"href":"/","className":"mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100","children":"Return home"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":["$L6",null,["$","$L7",null,{"children":["$","$8",null,{"name":"Next.MetadataOutlet","children":"$@9"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],["$","$1","h",{"children":[null,["$","$La",null,{"children":"$Lb"}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$8",null,{"name":"Next.Metadata","children":"$Ld"}]}]}],null]}],false]],"m":"$undefined","G":["$e",[]],"S":true}
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
9:null
d:[["$","title","0",{"children":"Zeo"}],["$","meta","1",{"name":"description","content":"Static-first Zeo site for marketing, docs, onboarding, and support."}]]
f:T3d2a,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ReadyLayer - In-Line Explanation Popover</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
              "code-bg": "#111318",
              "code-gutter": "#1e2229",
              "popover-bg": "rgba(30, 34, 41, 0.95)",
            },
            fontFamily: {
              "display": ["Inter", "sans-serif"],
              "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
            backdropBlur: {
              xs: '2px',
            }
          },
        },
      }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .code-line {
            counter-increment: line;
        }
        .code-line::before {
            content: counter(line);
            display: inline-block;
            width: 2rem;
            margin-right: 1rem;
            text-align: right;
            color: #6b7280;
            font-size: 0.75rem;
            font-family: 'ui-monospace', monospace;
        }
        .sh-keyword { color: #c678dd; } /* Purple */
        .sh-function { color: #61afef; } /* Blue */
        .sh-string { color: #98c379; } /* Green */
        .sh-number { color: #d19a66; } /* Orange */
        .sh-comment { color: #5c6370; font-style: italic; } /* Grey */
        .sh-class { color: #e5c07b; } /* Yellow */
        
        /* Custom scrollbar for code block */
        .code-scroll::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .code-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .code-scroll::-webkit-scrollbar-thumb {
            background: #282e39;
            border-radius: 4px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark min-h-screen flex justify-center items-center overflow-hidden">
<!-- Mobile Device Simulator -->
<div class="relative w-full max-w-md h-screen max-h-[900px] bg-code-bg overflow-hidden shadow-2xl flex flex-col font-display">
<!-- Status Bar Area (Mock) -->
<div class="h-12 w-full bg-code-bg flex items-center justify-between px-6 pt-2 z-20">
<span class="text-white text-xs font-medium">9:41</span>
<div class="flex gap-1.5">
<span class="material-symbols-outlined text-white text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-white text-[16px]">wifi</span>
<span class="material-symbols-outlined text-white text-[16px]">battery_full</span>
</div>
</div>
<!-- Top App Bar -->
<div class="flex items-center bg-code-bg px-4 pb-2 justify-between z-20 border-b border-white/5">
<div class="text-white flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-white/5 rounded-full transition-colors">
<span class="material-symbols-outlined">arrow_back_ios_new</span>
</div>
<div class="flex flex-col items-center">
<h2 class="text-white text-base font-bold leading-tight tracking-tight">NetworkUtils.swift</h2>
<span class="text-gray-400 text-xs">Edited 2m ago</span>
</div>
<div class="flex w-10 items-center justify-end">
<button class="flex items-center justify-center rounded-lg size-10 text-white hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined">more_horiz</span>
</button>
</div>
</div>
<!-- Code Editor Area -->
<div class="flex-1 relative overflow-y-auto code-scroll bg-code-bg pt-4 pb-32">
<!-- Line 1 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">1</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
<span class="sh-keyword">import</span> Foundation
                </div>
</div>
<!-- Line 2 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">2</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
<span class="sh-keyword">import</span> Combine
                </div>
</div>
<!-- Line 3 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">3</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5"></div>
</div>
<!-- Line 4 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">4</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
<span class="sh-class">class</span> <span class="sh-class">NetworkManager</span> {
                </div>
</div>
<!-- Line 5 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">5</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
                      <span class="sh-keyword">static</span> <span class="sh-keyword">let</span> shared = <span class="sh-class">NetworkManager</span>()
                </div>
</div>
<!-- Line 6 (Active) -->
<div class="flex items-start px-2 min-h-[28px] bg-primary/10 border-l-2 border-primary relative">
<div class="w-8 text-right text-gray-400 font-mono text-xs pt-1 select-none font-bold">6</div>
<div class="w-8 flex justify-center items-center">
<!-- Active Gutter Icon -->
<div class="size-6 rounded-md bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors animate-pulse">
<span class="material-symbols-outlined text-primary text-[16px]">spark</span>
</div>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-100 whitespace-nowrap pt-0.5 overflow-x-auto">
                      <span class="sh-keyword">func</span> <span class="sh-function">retryConnection</span>(url: <span class="sh-class">String</span>) {
                </div>
</div>
<!-- Line 7 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">7</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
                        <span class="sh-keyword">guard</span> attempts &lt; <span class="sh-number">5</span> <span class="sh-keyword">else</span> { <span class="sh-keyword">throw</span> <span class="sh-class">Timeout</span> }
                </div>
</div>
<!-- Line 8 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">8</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
                         <span class="sh-function">connect</span>(url, attempts + <span class="sh-number">1</span>)
                </div>
</div>
<!-- Line 9 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">9</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
                       }
                </div>
</div>
<!-- Popover Overlay -->
<!-- Positioned absolute relative to the code area, specifically targeting below line 6 -->
<div class="absolute left-4 right-4 top-[180px] z-30">
<!-- Pointer/Arrow -->
<div class="absolute -top-2 left-12 w-4 h-4 bg-[#1e2229] border-t border-l border-white/10 transform rotate-45 z-40"></div>
<div class="bg-[#1e2229]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-0 overflow-hidden ring-1 ring-black/50">
<!-- Header -->
<div class="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">bolt</span>
<h3 class="text-white text-sm font-semibold tracking-wide">ReadyLayer Insight</h3>
</div>
<button class="text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined text-lg">close</span>
</button>
</div>
<!-- Content -->
<div class="p-4 space-y-5">
<!-- Plain Language Summary -->
<div>
<p class="text-gray-200 text-sm leading-relaxed">
                                This function recursively retries the API connection with <span class="text-primary font-medium">exponential backoff</span>. It safeguards against infinite loops by limiting attempts to 5 before throwing a timeout error.
                            </p>
</div>
<!-- How to Test -->
<div class="bg-black/30 rounded-lg p-3 border border-white/5">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-purple-400 text-sm">science</span>
<span class="text-xs font-bold text-purple-200 uppercase tracking-wider">How to Test</span>
</div>
<p class="text-xs text-gray-300 font-mono leading-relaxed">
                                Mock a network failure 4 times to verify the retry logic triggers, then return success on the 5th attempt to ensure it resolves.
                            </p>
</div>
<!-- Actions & Links -->
<div class="flex items-center justify-between pt-1">
<button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20 group">
<span class="text-xs font-semibold">View Docs</span>
<span class="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</button>
<div class="flex items-center gap-1">
<button class="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Copy Explanation">
<span class="material-symbols-outlined text-[18px]">content_copy</span>
</button>
<button class="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Regenerate">
<span class="material-symbols-outlined text-[18px]">refresh</span>
</button>
<div class="w-px h-4 bg-white/10 mx-1"></div>
<button class="p-1.5 rounded-md text-gray-400 hover:text-green-400 hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-[18px]">thumb_up</span>
</button>
<button class="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-[18px]">thumb_down</span>
</button>
</div>
</div>
</div>
<!-- Bottom Gradient Line -->
<div class="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
</div>
</div>
<!-- More Code Context (Blurred slightly to emphasize popover focus visually, though requested design says transparent over code) -->
<!-- Line 10 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5 opacity-50">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">10</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
</div>
</div>
<!-- Line 11 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5 opacity-50">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">11</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
                      <span class="sh-keyword">func</span> <span class="sh-function">connect</span>(_ url: <span class="sh-class">String</span>, _ attempts: <span class="sh-class">Int</span>) {
                </div>
</div>
<!-- Line 12 -->
<div class="flex items-start px-2 min-h-[28px] group hover:bg-white/5 opacity-50">
<div class="w-8 text-right text-gray-500 font-mono text-xs pt-1 select-none">12</div>
<div class="w-8 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-gray-500 text-[14px] cursor-pointer hover:text-white">add</span>
</div>
<div class="flex-1 font-mono text-sm pl-2 text-gray-300 whitespace-nowrap pt-0.5">
                        <span class="sh-comment">// Implementation details...</span>
</div>
</div>
</div>
<!-- Floating Action Button (Contextual) -->
<div class="absolute bottom-6 right-6 z-20">
<button class="bg-primary hover:bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-900/50 transition-all active:scale-95 flex items-center justify-center">
<span class="material-symbols-outlined">smart_toy</span>
</button>
</div>
</div>
</body></html>6:["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L5",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"In Line Explanation Popover 2"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Collaboration"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"In Line Explanation Popover 2","srcDoc":"$f","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}]
