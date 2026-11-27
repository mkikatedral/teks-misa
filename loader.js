(async function () {
  const BASE = "https://krisostomosabdi.github.io/teks-misa-katedral-semarang";
  // Refreshes browser cache every 5 minutes after a git push
  const ver = Math.floor(Date.now() / (5 * 60 * 1000));
  const root = document.getElementById("misa-widget-root");
  if (!root) return;

  const res = await fetch(`${BASE}/index.html?v=${ver}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  // 1. Inject Google Fonts & stylesheet links
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link.cloneNode(true));
    }
  });

  // 2. Inject scoped <style> blocks
  doc.querySelectorAll("style").forEach((style) => {
    const s = document.createElement("style");
    s.textContent = style.textContent;
    document.head.appendChild(s);
  });

  // 3. Mount #buku-misa-container into WordPress
  const widget = doc.getElementById("buku-misa-container");
  if (widget) root.replaceChildren(widget);

  // 4. Load external libraries sequentially (pdf.js, page-flip, SweetAlert2)
  for (const extScript of doc.querySelectorAll("script[src]")) {
    if (document.querySelector(`script[src="${extScript.src}"]`)) continue;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = extScript.src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // 5. Execute the widget's module script
  const inlineScript = doc.querySelector("script:not([src])");
  if (inlineScript) {
    const s = document.createElement("script");
    s.type = "module";
    s.textContent = inlineScript.textContent;
    document.body.appendChild(s);
  }
})();
