1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","9019","static/chunks/app/capabilities/%5Bslug%5D/page-b735324e90a667f4.js"],""]
5:I[8028,[],"OutletBoundary"]
6:"$Sreact.suspense"
3:T2467,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Processing &amp; Hashing State - Zeo</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#0df26c",
              "background-light": "#f5f8f7",
              "background-dark": "#0a110c", // Deep charcoal/black
              "surface-dark": "#102318",
              "surface-highlight": "#1a3022",
            },
            fontFamily: {
              "display": ["Space Grotesk", "sans-serif"],
              "mono": ["JetBrains Mono", "monospace"],
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
          },
        },
      }
    </script>
<style>
        /* Custom scrollbar for terminal */
        .terminal-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
            background: #102318;
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
            background: #316848;
            border-radius: 4px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-hidden h-screen flex flex-col">
<!-- iOS Status Bar Placeholder (Safe Area) -->
<div class="h-12 w-full shrink-0 bg-background-light dark:bg-background-dark"></div>
<!-- Header -->
<header class="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark shrink-0 z-10">
<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
<span class="material-symbols-outlined text-primary text-[18px]">lock</span>
<span class="text-xs font-bold uppercase tracking-wider text-primary">Local Only</span>
</div>
<!-- Battery / Signal icons usually go here in iOS, keeping it clean for the design focused on app content -->
<div class="flex items-center gap-1">
<div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
<span class="text-xs text-white/40 font-mono">SECURE_LINK_ACTIVE</span>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-8 overflow-y-auto w-full max-w-md mx-auto relative">
<!-- Title Section -->
<div class="text-center mb-8">
<h1 class="text-2xl font-bold tracking-tight mb-1">Processing Evidence</h1>
<p class="text-white/50 text-sm">Ensuring cryptographic integrity...</p>
</div>
<!-- Central Progress Indicator -->
<div class="relative flex items-center justify-center mb-10 size-48 shrink-0">
<!-- Background Circle -->
<svg class="transform -rotate-90 size-full" viewbox="0 0 100 100">
<circle class="text-surface-highlight" cx="50" cy="50" fill="none" r="45" stroke="currentColor" stroke-width="6"></circle>
<!-- Progress Circle -->
<circle class="text-primary transition-all duration-300 ease-out" cx="50" cy="50" fill="none" r="45" stroke="currentColor" stroke-dasharray="283" stroke-dashoffset="100" stroke-linecap="round" stroke-width="6"></circle>
</svg>
<!-- Percentage Text -->
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-5xl font-mono font-bold text-white tracking-tighter">65%</span>
<span class="text-xs text-primary mt-1 font-mono uppercase tracking-widest animate-pulse">Hashing</span>
</div>
<!-- Decorative Glow -->
<div class="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10"></div>
</div>
<!-- Hash Display -->
<div class="w-full mb-8">
<div class="flex justify-between items-end mb-2 px-1">
<span class="text-xs text-white/40 uppercase tracking-widest font-bold">SHA-256 Hash</span>
<span class="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 font-mono">VERIFYING</span>
</div>
<div class="w-full bg-surface-dark border border-white/5 rounded-xl p-4 relative overflow-hidden group">
<div class="font-mono text-xl sm:text-2xl text-primary break-all leading-relaxed tracking-tight">
                    8f3a9b<span class="text-primary/50">c2</span>...<span class="animate-pulse text-white">|</span>
</div>
<!-- Scan line effect -->
<div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] w-full animate-[spin_4s_linear_infinite] opacity-20 pointer-events-none"></div>
</div>
</div>
<!-- Terminal Log -->
<div class="w-full flex-1 min-h-[160px] bg-black/40 border border-white/5 rounded-xl p-4 terminal-scroll overflow-y-auto flex flex-col justify-end backdrop-blur-sm shadow-inner">
<div class="space-y-3 font-mono text-sm">
<!-- Log Item: Done -->
<div class="flex gap-3 opacity-50">
<span class="text-primary shrink-0">✓</span>
<span class="text-white/60 line-through">Reading image buffer from raw source</span>
</div>
<!-- Log Item: Done -->
<div class="flex gap-3 opacity-70">
<span class="text-primary shrink-0">✓</span>
<span class="text-white/80">Buffer size confirmed: 4.2MB</span>
</div>
<!-- Log Item: Active -->
<div class="flex gap-3">
<span class="material-symbols-outlined text-base text-primary animate-spin shrink-0">progress_activity</span>
<div class="flex flex-col">
<span class="text-primary font-bold">Generating SHA-256 hash...</span>
<span class="text-[10px] text-primary/60 mt-0.5">Block 458/1024</span>
</div>
</div>
<!-- Log Item: Pending -->
<div class="flex gap-3 opacity-30">
<span class="text-white/40 shrink-0">○</span>
<span class="text-white/40">Packaging metadata &amp; geo-tags</span>
</div>
<!-- Log Item: Pending -->
<div class="flex gap-3 opacity-30">
<span class="text-white/40 shrink-0">○</span>
<span class="text-white/40">Finalizing localized signature</span>
</div>
</div>
</div>
<!-- Action Area -->
<div class="w-full mt-6 shrink-0">
<button class="w-full h-14 bg-surface-highlight hover:bg-[#254230] text-white border border-white/10 rounded-xl font-bold tracking-wide transition-colors flex items-center justify-center gap-2 group active:scale-[0.98]">
<span class="material-symbols-outlined text-white/70 group-hover:text-white transition-colors">cancel</span>
                Cancel Operation
            </button>
</div>
</main>
<!-- Bottom Navigation -->
<nav class="shrink-0 bg-surface-dark border-t border-white/5 pb-6 pt-3 px-6 z-20">
<div class="flex justify-between items-center max-w-md mx-auto">
<!-- Dashboard Tab -->
<button class="flex flex-col items-center gap-1 group w-16">
<span class="material-symbols-outlined text-white/40 group-hover:text-white/80 transition-colors text-2xl">grid_view</span>
<span class="text-[10px] text-white/40 group-hover:text-white/80 font-medium">Dashboard</span>
</button>
<!-- Tree View Tab -->
<button class="flex flex-col items-center gap-1 group w-16">
<span class="material-symbols-outlined text-white/40 group-hover:text-white/80 transition-colors text-2xl">account_tree</span>
<span class="text-[10px] text-white/40 group-hover:text-white/80 font-medium">Tree View</span>
</button>
<!-- Evidence Tab (Active) -->
<button class="flex flex-col items-center gap-1 group w-16 relative">
<!-- Active Indicator Glow -->
<div class="absolute -top-3 w-12 h-1 bg-primary rounded-full shadow-[0_0_10px_2px_rgba(13,242,108,0.5)]"></div>
<span class="material-symbols-outlined text-primary text-2xl filled">folder_open</span>
<span class="text-[10px] text-primary font-bold">Evidence</span>
</button>
<!-- Settings Tab -->
<button class="flex flex-col items-center gap-1 group w-16">
<span class="material-symbols-outlined text-white/40 group-hover:text-white/80 transition-colors text-2xl">settings</span>
<span class="text-[10px] text-white/40 group-hover:text-white/80 font-medium">Settings</span>
</button>
</div>
</nav>
<!-- Background texture/noise for industrial feel -->
<div class="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCypuP73PWGZZH0f7Dn9zxOotJHkTVQoMzJGg9hz-SeSAxgj2OQlLYNmuyfT_2Ax9DvlauYwx9b7fPDTVvX9nVH4ckuq51pkzrbA0fEZtvbZip_SVLdplsHo8QpQAQs-avxlLVxzWU-OuOULMtP0VV_9W51Uf59FchHWqE-i5CYV1TjjcxcDZdSh9XqjAcG8ltuosVS4vP8zB1r7EzcZpKb1KDW8-u5EQnlivk9PXdMGQA4jfULPr79gcm_-VdjdA4zrV4eQyZ2m_0');"></div>
</body></html>0:{"buildId":"J_kVknmu6GSF5qixhc85u","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50","children":[["$","header",null,{"className":"bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20","children":["$","div",null,{"className":"max-w-7xl mx-auto flex items-center justify-between","children":[["$","div",null,{"className":"flex items-center gap-4","children":[["$","$L2",null,{"href":"/capabilities","className":"p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors","children":["$","svg",null,{"className":"w-5 h-5","fill":"none","viewBox":"0 0 24 24","stroke":"currentColor","children":["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M10 19l-7-7m0 0l7-7m-7 7h18"}]}]}],["$","div",null,{"children":[["$","h1",null,{"className":"text-lg font-bold text-gray-900 tracking-tight","children":"Processing & Hashing State"}],["$","p",null,{"className":"text-xs text-blue-600 font-medium uppercase tracking-widest","children":"Decision Intelligence"}]]}]]}],["$","div",null,{"className":"flex gap-3","children":["$","div",null,{"className":"hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100","children":[["$","span",null,{"className":"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}],"Live Preview"]}]}]]}]}],["$","main",null,{"className":"w-full","children":["$","div",null,{"className":"bg-white rounded-none shadow-none overflow-hidden","children":["$","iframe",null,{"title":"Processing & Hashing State","srcDoc":"$3","className":"w-full h-[calc(100vh-65px)] border-none","sandbox":"allow-scripts allow-same-origin"}]}]}]]}],null,"$L4"]}],"loading":null,"isPartial":false}
4:["$","$L5",null,{"children":["$","$6",null,{"name":"Next.MetadataOutlet","children":"$@7"}]}]
7:null
