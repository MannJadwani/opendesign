"use client";

const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root{--bg:#F4F8F2;--ink:#2A3A2B;--accent:#6FA772;--soft:#E3F0DC;}
  *{box-sizing:border-box}
  body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink);}
  .nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;}
  .logo{display:flex;align-items:center;gap:10px;font-weight:600;}
  .dot{width:18px;height:18px;border-radius:50%;background:#6FA772;}
  .nav a{margin-left:20px;color:#3E5A43;text-decoration:none;font-size:13px;}
  .cta{background:var(--ink);color:#fff;padding:9px 16px;border-radius:999px;font-size:13px;margin-left:20px;}
  .hero{padding:56px 40px 88px;display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center;}
  .eyebrow{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);font-weight:600;}
  h1{font-family:"Iowan Old Style","Georgia",serif;font-size:52px;line-height:1.05;letter-spacing:-0.02em;margin:16px 0 18px;font-weight:500;}
  p.lead{font-size:16px;line-height:1.6;color:#4B5A4D;max-width:440px;}
  .row{display:flex;gap:10px;margin-top:24px;}
  .btn{padding:12px 20px;border-radius:999px;font-size:13px;font-weight:600;}
  .btn.primary{background:var(--accent);color:#fff;}
  .btn.ghost{background:var(--soft);color:var(--ink);}
  .phone{justify-self:center;width:260px;height:520px;border-radius:36px;background:#DBEAD3;box-shadow:0 30px 60px -24px rgba(60,100,70,0.3),inset 0 0 0 1px rgba(255,255,255,0.6);padding:20px;display:flex;flex-direction:column;gap:14px;}
  .pill{background:#fff;border-radius:18px;padding:14px;box-shadow:0 8px 20px -12px rgba(60,100,70,0.25);}
  .bar{height:10px;border-radius:999px;background:#E3F0DC;}
  .bar.sm{width:55%;}.bar.md{width:75%;margin-top:8px;}
  .cards{display:flex;gap:8px;margin-top:6px;}
  .card{flex:1;aspect-ratio:1;border-radius:14px;background:#CFE8C8;}
  .card:nth-child(2){background:#F9D9C4;}
  .card:nth-child(3){background:#CFD9F5;}
  .footer{padding:30px 40px;color:#6B7A6D;font-size:12px;}
</style></head><body>
<nav class="nav"><div class="logo"><span class="dot"></span>stilla</div>
  <div><a>features</a><a>sessions</a><a>pricing</a><span class="cta">download</span></div></nav>
<section class="hero">
  <div><div class="eyebrow">a quieter mind</div>
    <h1>breathe with intention, every single day.</h1>
    <p class="lead">stilla guides you through micro-meditations tuned to your mood — gentle prompts, ambient soundscapes, and a timer that fades, not rings.</p>
    <div class="row"><span class="btn primary">start free</span><span class="btn ghost">watch demo</span></div></div>
  <div class="phone">
    <div class="pill"><div class="bar sm"></div><div class="bar md"></div></div>
    <div class="pill"><div style="font-size:10px;color:#6B7A6D;letter-spacing:2px;text-transform:uppercase;">today</div>
      <div style="font-family:Georgia,serif;font-size:20px;margin-top:6px;">4 min breath</div>
      <div class="cards"><div class="card"></div><div class="card"></div><div class="card"></div></div></div>
    <div class="pill" style="display:flex;align-items:center;gap:10px;">
      <div style="width:40px;height:40px;border-radius:50%;background:#6FA772;"></div>
      <div><div style="font-weight:600;">evening wind-down</div>
        <div style="font-size:11px;color:#6B7A6D;">6 min · ambient</div></div></div></div>
</section>
<div class="footer">© stilla — rest, restored.</div>
</body></html>`;

export function Preview() {
  return (
    <iframe
      sandbox="allow-scripts"
      srcDoc={html}
      className="h-full w-full"
      title="design preview"
    />
  );
}
