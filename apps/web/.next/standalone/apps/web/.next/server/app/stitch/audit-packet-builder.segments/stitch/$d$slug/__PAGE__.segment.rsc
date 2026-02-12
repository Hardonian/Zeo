1:"$Sreact.fragment"
2:I[3180,["3180","static/chunks/3180-49ca78bebb59785c.js","2706","static/chunks/app/stitch/%5Bslug%5D/page-2eae595a34961720.js"],""]
6:I[8028,[],"OutletBoundary"]
7:"$Sreact.suspense"
3:T28fd,<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Audit Packet Builder - Zeo</title>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0df26c",
                        "background-light": "#f5f8f7",
                        "background-dark": "#102217",
                        "surface-dark": "#18281e",
                        "surface-darker": "#0a160f",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>/* Custom Checkbox Styles to match the high-trust aesthetic */
.custom-checkbox:checked {
    background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuD_7AP-BMQ7Kcw28N6IvNasinY3K8ygHQWJ32qMKzbj7Kyhge1ojOIyg4WZMcxUt2D7aAa5jxzXWefxmvy_u1c5YS88yvXb_dsgwBkSl9fnUOKDaV52gdPK00lkOalMtkN9uvUg0NxDdZrkhJLGe2yCUehXIjf1UGBfZYIbf8E44yGGGh0q4FljNFSY_FyRYVxGVQDqILE2TXN9GRZY4AjgdM6_qcMIb1WGIHLSShdT7F4JUVP9KeC5zmRW13HhhCxGv7FCddRYT3I)
    }
/* Custom Toggle Switch */
.toggle-checkbox:checked {
    right: 0;
    border-color: #0df26c
    }
.toggle-checkbox:checked + .toggle-label {
    background-color: #0df26c
    }
/* Scrollbar hiding for cleaner look */
.no-scrollbar::-webkit-scrollbar {
    display: none
    }
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none
    }</style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex justify-center overflow-hidden">
<!-- Mobile Container (Max Width Constrained) -->
<div class="relative w-full max-w-md h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl">
<!-- Header -->
<header class="flex items-center justify-between px-6 pt-12 pb-6 bg-surface-darker/50 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
<h1 class="text-white text-xl font-bold tracking-tight">Audit Packet Builder</h1>
<button class="text-white/70 hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5">
<span class="material-symbols-outlined">close</span>
</button>
</header>
<!-- Main Content (Scrollable) -->
<main class="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
<!-- Trust Indicator / Hero -->
<div class="mt-6 mb-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4 backdrop-blur-sm">
<div class="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
<span class="material-symbols-outlined text-[24px]">shield_lock</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="text-white font-bold text-sm tracking-wide uppercase">Zeo Secure Bridge: Active</h2>
<p class="text-white/60 text-xs leading-relaxed font-mono">256-bit encryption enabled via host bridge. Session ID: <span class="text-primary/80">#7X-992-AZ</span></p>
</div>
</div>
<!-- Data Components Section -->
<section class="mb-8">
<h3 class="text-white/90 text-sm font-semibold mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">folder_data</span>
                    DATA COMPONENTS
                </h3>
<div class="flex flex-col gap-3">
<!-- Item 1 -->
<label class="group relative flex items-center p-4 rounded-xl border border-white/10 bg-surface-dark hover:border-primary/50 transition-all cursor-pointer">
<input checked="" class="peer h-5 w-5 shrink-0 rounded border-2 border-white/20 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary checked:bg-primary checked:border-primary custom-checkbox transition-all" type="checkbox"/>
<div class="ml-4 flex-1">
<span class="block text-white font-medium group-hover:text-primary transition-colors">Full Branch Logic</span>
<span class="block text-white/40 text-xs font-mono mt-0.5">schema_v2.json</span>
</div>
<span class="material-symbols-outlined text-white/20 peer-checked:text-primary">check_circle</span>
</label>
<!-- Item 2 -->
<label class="group relative flex items-center p-4 rounded-xl border border-white/10 bg-surface-dark hover:border-primary/50 transition-all cursor-pointer">
<input checked="" class="peer h-5 w-5 shrink-0 rounded border-2 border-white/20 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary checked:bg-primary checked:border-primary custom-checkbox transition-all" type="checkbox"/>
<div class="ml-4 flex-1">
<span class="block text-white font-medium group-hover:text-primary transition-colors">Provenanced Evidence Trail</span>
<span class="block text-white/40 text-xs font-mono mt-0.5">export_raw.csv</span>
</div>
<span class="material-symbols-outlined text-white/20 peer-checked:text-primary">check_circle</span>
</label>
<!-- Item 3 -->
<label class="group relative flex items-center p-4 rounded-xl border border-white/10 bg-surface-dark hover:border-primary/50 transition-all cursor-pointer">
<input class="peer h-5 w-5 shrink-0 rounded border-2 border-white/20 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary checked:bg-primary checked:border-primary custom-checkbox transition-all" type="checkbox"/>
<div class="ml-4 flex-1">
<span class="block text-white font-medium group-hover:text-primary transition-colors">Assumption Sensitivity Logs</span>
<span class="block text-white/40 text-xs font-mono mt-0.5">logs_sensitivity.txt</span>
</div>
<span class="material-symbols-outlined text-white/20 peer-checked:text-primary">check_circle</span>
</label>
<!-- Item 4 -->
<label class="group relative flex items-center p-4 rounded-xl border border-white/10 bg-surface-dark hover:border-primary/50 transition-all cursor-pointer">
<input class="peer h-5 w-5 shrink-0 rounded border-2 border-white/20 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary checked:bg-primary checked:border-primary custom-checkbox transition-all" type="checkbox"/>
<div class="ml-4 flex-1">
<span class="block text-white font-medium group-hover:text-primary transition-colors">Governance Gate Sign-offs</span>
<span class="block text-white/40 text-xs font-mono mt-0.5">approvals_sig.pdf</span>
</div>
<span class="material-symbols-outlined text-white/20 peer-checked:text-primary">check_circle</span>
</label>
</div>
</section>
<!-- Security & Integrity Section -->
<section class="mb-8">
<h3 class="text-white/90 text-sm font-semibold mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">verified_user</span>
                    SECURITY &amp; INTEGRITY
                </h3>
<div class="bg-surface-dark rounded-xl border border-white/10 overflow-hidden">
<!-- Toggle 1 -->
<div class="p-4 border-b border-white/5 flex items-center justify-between">
<div class="flex flex-col gap-1 pr-4">
<span class="text-white font-medium text-sm">Include SHA-256 Signatures</span>
<span class="text-white/40 text-xs">Generates a hash manifest for all files.</span>
</div>
<label class="flex items-center cursor-pointer relative" for="toggle-sha">
<input checked="" class="sr-only peer" id="toggle-sha" type="checkbox"/>
<div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<!-- Toggle 2 -->
<div class="p-4 flex items-center justify-between">
<div class="flex flex-col gap-1 pr-4">
<span class="text-white font-medium text-sm">Redact PII/Sensitive Metadata</span>
<span class="text-white/40 text-xs">Removes user emails and internal IP references.</span>
</div>
<label class="flex items-center cursor-pointer relative" for="toggle-pii">
<input class="sr-only peer" id="toggle-pii" type="checkbox"/>
<div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
<!-- Checksum Preview Micro-interaction -->
<div class="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] text-white/50 flex items-center justify-between">
<span>PREVIEW HASH:</span>
<span class="text-primary truncate ml-2">8f9d...2a1b</span>
</div>
</section>
</main>
<!-- Fixed Footer Action -->
<div class="absolute bottom-0 w-full bg-surface-darker/90 backdrop-blur-xl border-t border-white/10 p-6 z-30">
<div class="flex justify-between items-center mb-4">
<span class="text-white/60 text-sm">Estimated Packet Size</span>
<span class="text-white font-mono font-bold text-lg">12.4 MB</span>
</div>
<button class="w-full bg-primary hover:bg-[#0bc256] text-surface-darker font-bold py-4 px-6 rounded-lg text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(13,242,108,0.3)]">
<span class="material-symbols-outlined text-[20px]">lock_reset</span>
                Generate Signed Packet
            </button>
</div>
</div>
</body></html>0:{"buildId":"ncTonRn3hvG10lbw3EzX3","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-gray-50 text-gray-900","children":[["$","header",null,{"className":"border-b border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4","children":[["$","$L2",null,{"href":"/","className":"text-lg font-semibold text-blue-700","children":"Zeo"}],["$","nav",null,{"className":"flex flex-wrap items-center gap-4 text-sm","children":[[["$","$L2","/",{"href":"/","className":"text-gray-700 hover:text-blue-700","children":"Home"}],["$","$L2","/about",{"href":"/about","className":"text-gray-700 hover:text-blue-700","children":"About"}],["$","$L2","/pricing",{"href":"/pricing","className":"text-gray-700 hover:text-blue-700","children":"Pricing"}],["$","$L2","/platform",{"href":"/platform","className":"text-gray-700 hover:text-blue-700","children":"Platform"}],["$","$L2","/stitch",{"href":"/stitch","className":"text-gray-700 hover:text-blue-700","children":"Stitch Pages"}],["$","$L2","/contact",{"href":"/contact","className":"text-gray-700 hover:text-blue-700","children":"Contact"}]],["$","$L2",null,{"href":"/dashboard","className":"rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50","children":"Dashboard"}]]}]]}]}],["$","main",null,{"className":"mx-auto w-full max-w-6xl px-6 py-10","children":[["$","h1",null,{"className":"mb-6 text-3xl font-semibold","children":"Audit Packet Builder"}],["$","div",null,{"className":"overflow-hidden rounded border border-gray-200 bg-white","children":["$","iframe",null,{"title":"Audit Packet Builder","srcDoc":"$3","className":"h-[900px] w-full","sandbox":"allow-scripts allow-same-origin"}]}]]}],"$L4"]}],null,"$L5"]}],"loading":null,"isPartial":false}
4:["$","footer",null,{"className":"border-t border-gray-200 bg-white","children":["$","div",null,{"className":"mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600","children":[["$","span",null,{"children":"Confidence range, assumptions, provenance, and sensitivity first."}],["$","div",null,{"className":"flex gap-3","children":[["$","$L2",null,{"href":"/privacy","className":"hover:text-blue-700","children":"Privacy"}],["$","$L2",null,{"href":"/terms","className":"hover:text-blue-700","children":"Terms"}]]}]]}]}]
5:["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]
8:null
