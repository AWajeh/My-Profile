/* ============================================
   MY APPS — application metadata
   To publish a new app, add an object to the list below.
   No other code needs to change.

   Fields
   ------
   id           unique slug (used for #app=<id> deep links)
   name         display name
   category     e.g. "Windows Desktop Application", "Game", "Web App"
   kind         filter group: "app" | "game" | "web"
   platforms    list of platform labels shown as badges
   price        e.g. "Free"
   version      fallback version (replaced by the latest GitHub release when found)
   status       "available" | "beta" | "coming-soon" | "in-development"
   featured     true = large showcase card
   logo         square logo image (or null to show logoText)
   preview      optional wide preview image (omit for a compact featured card)
   tagline      one-line summary
   description  card description
   downloads    static downloads [{ label, url, platform, primary }]
   release      optional GitHub release lookup:
                { repo: "owner/name", asset: "File.exe", label: "Download for Windows" }
                When a release with that asset exists, the download button switches
                on automatically. Until then the card shows "Coming soon".
   details      content for the Learn More dialog (overview, features, gallery,
                screenshots, requirements, install steps)
   installHtml  optional HTML for an inline "How to install" panel
   note         optional footnote; noteLabel is its bold prefix
============================================ */
window.APPS = [
  {
    id: "awajeh-3d",
    name: "Awajeh 3D",
    category: "Windows Desktop Application",
    kind: "app",
    platforms: ["Windows 10", "Windows 11"],
    price: "Free",
    version: "1.2.0",
    status: "available",
    featured: true,
    logo: "assets/apps/awajeh-3d/logo.png",
    tagline: "Animated 3D wallpapers for your Windows desktop",
    description:
      "Experience your desktop differently. Awajeh 3D brings immersive animated 3D wallpapers, interactive desktop widgets, customizable shortcut docks, and advanced desktop personalization into one application.",
    downloads: [{ label: "DOWNLOAD FOR WINDOWS ↓", url: "downloads/Awajeh3D-Setup.exe", platform: "Windows", primary: true, size: "79 MB" }],
    details: {
      overview:
        "Awajeh 3D runs real-time 3D scenes directly behind your desktop icons. Every wallpaper is a live Three.js / WebGL environment with its own lighting, camera movement and particles, not a looping video. It also adds a shortcut dock and live widgets, and it automatically pauses when a game or fullscreen app is running.",
      features: [
        "Live 3D wallpapers rendered in real time behind your desktop icons",
        "Customizable shortcut dock for apps, folders and websites",
        "Clock, date, music and live CPU / GPU / RAM / FPS widgets (shows N/A when a value cannot be measured)",
        "Pauses automatically for fullscreen games, maximized windows, a locked PC or battery power",
        "FPS limit (30 / 60 / unlimited), quality presets, render scale and parallax controls",
        "Multi-monitor support, favorites, recently used and custom video / image imports",
        "Starts with Windows, lives in the system tray, works fully offline. No account needed."
      ],
      gallery: [
        { src: "assets/apps/awajeh-3d/fujiyama.jpg", alt: "Fujiyama Dawn: mountain, lake, torii gate and cherry blossoms at dawn", caption: "Fujiyama Dawn" },
        { src: "assets/apps/awajeh-3d/cyberpunk.jpg", alt: "Neon Rain: a rainy neon-lit futuristic city street at night", caption: "Neon Rain" },
        { src: "assets/apps/awajeh-3d/deepspace.jpg", alt: "Deep Space: a ringed gas giant, asteroid belt and nebula", caption: "Deep Space" },
        { src: "assets/apps/awajeh-3d/abstract.jpg", alt: "Monolith: floating chrome, gold and glass shapes around a liquid metal core", caption: "Monolith" }
      ],
      screenshots: [],
      requirements: [
        ["OS", "Windows 10 (64-bit) or Windows 11"],
        ["Graphics", "GPU with WebGL 2 / DirectX 11 support"],
        ["Memory", "4 GB RAM (8 GB recommended)"],
        ["Disk", "About 400 MB"],
        ["Internet", "Not required (only for optional update checks)"]
      ],
      install: [
        "Download <code>Awajeh3D-Setup.exe</code>.",
        "Run it. If <strong>Windows SmartScreen</strong> appears, click <strong>More info</strong> → <strong>Run anyway</strong>. This is expected because the installer is not code-signed yet.",
        "Choose the install folder and shortcut options, then click <strong>Install</strong>.",
        "Launch Awajeh 3D from the desktop or Start menu, pick a wallpaper and click <strong>Apply</strong>.",
        "To uninstall, go to Settings → Apps → Awajeh 3D → Uninstall. Your settings are kept in %APPDATA%."
      ]
    }
  },
  {
    id: "last-lie",
    name: "Last Lie Beta",
    category: "Game",
    kind: "game",
    platforms: ["Windows", "Linux"],
    price: "Free",
    version: "Beta",
    status: "beta",
    logo: "assets/last-lie-logo.jpg",
    logoAlt: "Last Lie game logo",
    tagline: "Built with AI assistance",
    downloads: [
      { label: "Download for Windows ↓", url: "downloads/LastLie-Setup.exe", platform: "Windows", primary: true },
      { label: "Download for Linux ↓", url: "downloads/LastLie-Setup.run", platform: "Linux" }
    ],
    installHtml:
      '<p><strong>Windows</strong></p><ol><li>Download <code>LastLie-Setup.exe</code> and double-click it.</li><li>If a blue <strong>Windows SmartScreen</strong> window appears, click <strong>More info</strong> → <strong>Run anyway</strong> (expected for an unsigned early build).</li><li>Choose a language (Arabic / English), then <strong>Next</strong> → <strong>Install</strong>. No admin rights needed.</li><li>Launch the game from the desktop or Start menu shortcut.</li></ol><p>To uninstall: Settings → Apps → Last Lie → Uninstall.</p><p><strong>Linux</strong></p><ol><li>Download <code>LastLie-Setup.run</code>.</li><li>Open a terminal in the download folder and run:<br><code>chmod +x LastLie-Setup.run &amp;&amp; ./LastLie-Setup.run</code></li><li>Launch the game from your app menu, the desktop icon, or by typing <code>lastlie</code>. No <code>sudo</code> needed.</li></ol><p>To uninstall: <code>~/.local/share/lastlie/uninstall.sh</code></p>',
    noteLabel: "Early build, made with AI assistance.",
    note: "The game is playable, but it has no official code-signing certificate yet, so Windows or your antivirus may flag it as unknown or suspicious. That is expected for an independent early release. After the final release, the game will be published on Steam."
  },
  {
    id: "web-game",
    name: "Web Game",
    category: "Browser Game",
    kind: "web",
    platforms: ["Web"],
    price: "Free",
    status: "in-development",
    logo: null,
    logoText: "WEB GAME",
    tagline: "Coming soon — playable in the browser",
    downloads: [{ label: "Play in browser · soon", url: null }],
    noteLabel: "In development.",
    note: "A browser game I'm working on. It will be playable right here, with no download, once it's ready."
  }
];
