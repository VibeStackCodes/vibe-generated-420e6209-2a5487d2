import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type License = {
  id: string;
  name: string;
  terms: string;
};

type Asset = {
  id: string;
  name: string;
  tags: string[];
  url?: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type SEOState = {
  title: string;
  description: string;
  keywords: string;
};

type MandalaSpec = {
  segments: number;
  symmetry: 'radial' | 'mirror';
  color: string;
  showWatermark: boolean;
};

const LICENSES: License[] = [
  {
    id: 'standard-commercial',
    name: 'Standard Commercial',
    terms: 'Allows sales of prints and digital assets with standard attribution not required.'
  },
  {
    id: 'editorial',
    name: 'Editorial License',
    terms: 'For editorial use only. No commercial resale of assets.'
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    terms: 'Limited exclusive licensing negotiated with artist.'
  }
];

const STORE_ITEMS = [
  { id: 'print-a4', name: 'Fine Art Print A4', price: 39 },
  { id: 'print-a3', name: 'Fine Art Print A3', price: 59 },
  { id: 'svg-asset', name: 'SVG Asset Pack', price: 12 }
];

function currency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function MandalaCanvas({ spec, watermark }: { spec: MandalaSpec; watermark: boolean }) {
  const cx = 210;
  const cy = 210;
  const outerR = 140;
  const step = 360 / spec.segments;
  const innerR = outerR * 0.6;

  const wedgesOuter = [] as JSX.Element[];
  const wedgesInner = [] as JSX.Element[];

  const a2 = (angle: number) => (angle * Math.PI) / 180;

  for (let i = 0; i < spec.segments; i++) {
    const a1 = i * step;
    const aStart = a1;
    const aEnd = a1 + step;

    const p1 = {
      x: cx + Math.cos(a2(aStart)) * outerR,
      y: cy + Math.sin(a2(aStart)) * outerR
    };
    const p2 = {
      x: cx + Math.cos(a2(aEnd)) * outerR,
      y: cy + Math.sin(a2(aEnd)) * outerR
    };

    wedgesOuter.push(
      <polygon key={`ow-${i}`} points={`${cx},${cy} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={spec.color} opacity={0.8} stroke="none" />
    );

    const p1i = {
      x: cx + Math.cos(a2(aStart)) * innerR,
      y: cy + Math.sin(a2(aStart)) * innerR
    };
    const p2i = {
      x: cx + Math.cos(a2(aEnd)) * innerR,
      y: cy + Math.sin(a2(aEnd)) * innerR
    };

    wedgesInner.push(
      <polygon key={`iw-${i}`} points={`${cx},${cy} ${p1i.x},${p1i.y} ${p2i.x},${p2i.y}`} fill={spec.color} opacity={0.25} stroke="none" />
    );
  }

  // If mirror symmetry is enabled, add mirrored wedges across the vertical axis by duplicating with negative angles
  const wedgesMirror = [] as JSX.Element[];
  if (spec.symmetry === 'mirror') {
    for (let i = 0; i < spec.segments; i++) {
      const a1 = -i * step;
      const aEnd = -(i * step) - step;
      const aStart = a1;
      const p1 = {
        x: cx + Math.cos((aStart * Math.PI) / 180) * outerR,
        y: cy + Math.sin((aStart * Math.PI) / 180) * outerR
      };
      const p2 = {
        x: cx + Math.cos((aEnd * Math.PI) / 180) * outerR,
        y: cy + Math.sin((aEnd * Math.PI) / 180) * outerR
      };
      wedgesMirror.push(
        <polygon key={`mw-${i}`} points={`${cx},${cy} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={spec.color} opacity={0.6} stroke="none" />
      );

      const p1i = {
        x: cx + Math.cos((aStart * Math.PI) / 180) * innerR,
        y: cy + Math.sin((aStart * Math.PI) / 180) * innerR
      };
      const p2i = {
        x: cx + Math.cos((aEnd * Math.PI) / 180) * innerR,
        y: cy + Math.sin((aEnd * Math.PI) / 180) * innerR
      };
      wedgesMirror.push(
        <polygon key={`mi-${i}`} points={`${cx},${cy} ${p1i.x},${p1i.y} ${p2i.x},${p2i.y}`} fill={spec.color} opacity={0.15} stroke="none" />
      );
    }
  }

  return (
    <svg ref={null} width={420} height={420} viewBox="0 0 420 420" aria-label="Mandala canvas" role="img">
      <defs>
        <circle id="grad" cx={cx} cy={cy} r={outerR} fill={spec.color} />
      </defs>
      <rect x={0} y={0} width={420} height={420} fill="#111" opacity={0.0} />
      {wedgesOuter}
      {wedgesInner}
      {spec.symmetry === 'mirror' ? wedgesMirror : null}
      {spec.showWatermark && (
        <text x={cx} y={cy} textAnchor="middle" fill="white" opacity={0.15} fontSize={42} fontFamily="Inter" style={{ userSelect: 'none' }}>
          MANDALA
        </text>
      )}
      <circle cx={cx} cy={cy} r={6} fill="#fff" opacity={0.3} />
    </svg>
  );
}

function ExportButton({ onExport }: { onExport: () => void }) {
  return (
    <button
      aria-label="Export mandala as SVG"
      onClick={onExport}
      className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      Export SVG
    </button>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold" style={{ fontFamily: 'Inter' }}>{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function App(): JSX.Element {
  const [active, setActive] = useState<'builder'|'licenses'|'store'|'cms'|'seo'>('builder');

  // Builder state
  const [spec, setSpec] = useState<MandalaSpec>({ segments: 12, symmetry: 'radial', color: '#ff7f50', showWatermark: true });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Licensing
  const [license, setLicense] = useState<License | null>(LICENSES[0]);

  // Store / Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [storeOpen, setStoreOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'idle'|'processing'|'success'|null>(null);

  // CMS
  const [assets, setAssets] = useState<Asset[]>([]);

  // SEO
  const [seo, setSeo] = useState<SEOState>({ title: 'Mandala Portfolio', description: 'A handcrafted mandala portfolio', keywords: 'mandala, portfolio, art' });

  useEffect(() => {
    // Seed initial asset
    if (assets.length === 0) {
      setAssets([{ id: 'sample-blank', name: 'Sample Mandala Asset', tags: ['sample'] }]);
    }
  }, []);

  // Upload handler (CMS)
  const onBulkUpload = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (!files || files.length === 0) return;
    const next: Asset[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const a: Asset = { id: `asset-${Date.now()}-${i}`, name: f.name, tags: [] };
      next.push(a);
    }
    setAssets((prev) => [...prev, ...next]);
    // reset value to allow re-upload same files if needed
    ev.currentTarget.value = '';
  }, []);

  // Export current mandala as SVG
  const exportSVG = useCallback(() => {
    const el = svgRef.current;
    // If using a dedicated <svg>, ensure we have an outer wrapper to serialize
    if (!el) return;
    const serializer = new XMLSerializer();
    // Wrap the mandala content to ensure a valid standalone SVG
    const outer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    outer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    outer.setAttribute('width', '420');
    outer.setAttribute('height', '420');
    outer.setAttribute('viewBox', '0 0 420 420');

    // Copy child nodes from existing SVG content
    const clone = el.cloneNode(true) as SVGSVGElement;
    // Remove any inner svg wrappers if present
    while (clone.firstChild) {
      outer.appendChild(clone.firstChild);
    }

    const source = serializer.serializeToString(outer);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mandala.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  // Add to cart
  const addToCart = useCallback((item: typeof STORE_ITEMS[number]) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    setStoreOpen(true);
  }, []);

  // Checkout simulation
  const checkout = useCallback(async () => {
    if (cart.length === 0) return;
    setCheckoutState('processing');
    await new Promise((r) => setTimeout(r, 1000));
    setCheckoutState('success');
    setCart([]);
  }, [cart]);

  const cartTotal = useMemo(() => cart.reduce((sum, it) => sum + it.price * it.quantity, 0), [cart]);

  // Update document title for SEO mimicry
  useEffect(() => {
    document.title = seo.title || 'Mandala Portfolio';
  }, [seo.title]);

  // Watermark toggle affects mandala by re-rendering
  const mandalaColor = spec.color;

  // UI
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/90" aria-label="Mandala Logo" />
            <h1 className="text-xl font-semibold">Mandala Portfolio Builder</h1>
          </div>
          <nav aria-label="Main navigation" className="flex items-center gap-3">
            {[
              { key: 'builder', label: 'Builder' },
              { key: 'licenses', label: 'Licensing' },
              { key: 'store', label: 'Store' },
              { key: 'cms', label: 'CMS' },
              { key: 'seo', label: 'SEO' }
            ].map((n) => (
              <button key={n.key}
                onClick={() => setActive(n.key as any)}
                className={"px-3 py-2 rounded-md text-white" + (active === (n.key as any) ? ' bg-primary-600' : ' bg-white/20')}
                aria-label={n.label}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar quick stats / controls */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="bg-white shadow rounded-md p-4">
            <SectionTitle title="Mandala Builder" />
            <div className="space-y-3">
              <label className="block text-sm">Segments: {spec.segments}</label>
              <input type="range" min={3} max={48} step={1} value={spec.segments}
                onChange={(e) => setSpec((s) => ({ ...s, segments: Number(e.target.value) }))}
                className="w-full"
              />
              <label className="block text-sm mt-2">Symmetry</label>
              <div className="flex gap-2">
                {(['radial','mirror'] as const).map((t) => (
                  <button key={t} onClick={() => setSpec((s)=> ({ ...s, symmetry: t }))}
                    className={"px-3 py-1 rounded-md border text-sm" + (spec.symmetry === t ? ' border-primary text-primary' : ' border-gray-200')}
                  >{t}</button>
                ))}
              </div>
              <label className="block text-sm mt-2">Color</label>
              <input type="color" value={spec.color}
                onChange={(e) => setSpec((s)=> ({ ...s, color: e.target.value }))}
                aria-label="Mandala color" className="w-16 h-9 p-0 border rounded"/>
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={spec.showWatermark} onChange={(e)=> setSpec((s)=> ({ ...s, showWatermark: e.target.checked }))} />
                <span>Watermark</span>
              </label>
            </div>
            <hr className="my-3" />
            <ExportButton onExport={exportSVG} />
          </section>

          <section className="bg-white shadow rounded-md p-4">
            <SectionTitle title="Licensing" />
            <div className="space-y-2" aria-label="Licenses">
              {LICENSES.map((l) => (
                <div key={l.id} className={"p-2 rounded-md border" + (license?.id === l.id ? ' border-primary' : ' border-gray-200')}>
                  <label className="flex items-center justify-between w-full">
                    <span>{l.name}</span>
                    <button onClick={()=> setLicense(l)} className="px-2 py-1 rounded bg-primary text-white text-sm">Select</button>
                  </label>
                </div>
              ))}
            </div>
            {license && (
              <div className="mt-2 text-sm text-gray-700">
                <strong>Selected:</strong> {license.name}
                <div className="text-xs mt-1">{license.terms}</div>
              </div>
            )}
          </section>
        </aside>

        {/* Main Builder View */}
        <section className="lg:col-span-2 bg-white shadow rounded-md p-4" aria-label="Mandala Builder">
          {active === 'builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center justify-center">
                <div ref={undefined} aria-label="Mandala SVG canvas">
                  <svg ref={svgRef} width={420} height={420} viewBox="0 0 420 420" role="img" aria-label="Mandala SVG" style={{ display: 'block' }}>
                    <g>
                      <MandalaCanvas spec={spec} watermark={spec.showWatermark} />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Inter' }}>Live Preview</h3>
                  <p className="text-sm text-gray-600">Symmetry-optimized mandalas generated on the fly. Export SVG or tweak settings for publication-ready assets.</p>
                </div>
                <div className="bg-gray-50 border rounded p-3 flex flex-col gap-2">
                  <div className="text-sm">License</div>
                  <div className="text-sm font-medium">{license?.name ?? 'None'}</div>
                </div>
                <button onClick={()=> setActive('licenses')} className="w-full py-2 px-4 rounded-md bg-primary text-white hover:bg-primary-600">Open Licensing</button>
              </div>
            </div>
          )}
        </section>
      </main>

      <section className="max-w-6xl mx-auto p-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Store / CMS / SEO">
        <div className="bg-white shadow rounded-md p-4">
          <SectionTitle title="E-Commerce" />
          <div className="space-y-2">
            {STORE_ITEMS.map((it) => (
              <div key={it.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">{currency(it.price)}</div>
                </div>
                <button onClick={()=> addToCart({ id: it.id, name: it.name, price: it.price, quantity: 1 })}
                  className="px-3 py-1 rounded bg-primary text-white">Add</button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Cart items: {cart.length}</span>
            <button onClick={()=> setStoreOpen((v)=>!v)} className="px-3 py-1 rounded bg-gray-200">Cart</button>
          </div>
          {storeOpen && (
            <div className="mt-2 border rounded p-2 bg-gray-50">
              {cart.length === 0 ? (
                <div className="text-sm text-gray-500">Cart is empty</div>
              ) : (
                <div className="space-y-2">
                  {cart.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span>{c.name} x{c.quantity}</span>
                      <span>{currency(c.price * c.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex items-center justify-between">
                    <strong>Total</strong>
                    <strong>{currency(cartTotal)}</strong>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 px-3 py-2 rounded bg-primary text-white" onClick={checkoutState === 'processing' ? undefined : checkout} disabled={checkoutState==='processing'}>
                      {checkoutState === 'processing' ? 'Processing...' : 'Checkout'}
                    </button>
                    <button className="flex-1 px-3 py-2 rounded border" onClick={()=> setCart([])}>Clear</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-md p-4">
          <SectionTitle title="CMS" />
          <div className="space-y-3">
            <label className="block text-sm">Bulk Upload</label>
            <input type="file" multiple accept="image/*" onChange={onBulkUpload} aria-label="Bulk upload images" className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {assets.map((a) => (
                <div key={a.id} className="border rounded p-2 flex flex-col items-start">
                  <span className="text-sm font-medium">{a.name}</span>
                  <input placeholder="tag1, tag2" value={a.tags.join(', ')} onChange={(e)=>{ const tags = e.target.value.split(',').map(t=>t.trim()).filter(Boolean); setAssets((arr)=> arr.map(it => it.id===a.id?{...it, tags}: it)); }} className="text-xs w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-md p-4">
          <SectionTitle title="SEO" />
          <div className="space-y-2">
            <label className="block text-sm">Title</label>
            <input className="w-full border rounded p-2" value={seo.title} onChange={(e)=> setSeo((s)=> ({ ...s, title: e.target.value }))} />
            <label className="block text-sm">Description</label>
            <textarea className="w-full border rounded p-2" value={seo.description} onChange={(e)=> setSeo((s)=> ({ ...s, description: e.target.value }))} />
            <label className="block text-sm">Keywords</label>
            <input className="w-full border rounded p-2" value={seo.keywords} onChange={(e)=> setSeo((s)=> ({ ...s, keywords: e.target.value }))} />
            <button
              onClick={()=>{
                // apply SEO to document and offer a download of meta data
                const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
                if (meta) meta.content = seo.description; else {
                  const m = document.createElement('meta');
                  m.name = 'description';
                  m.content = seo.description;
                  document.head.appendChild(m);
                }
                document.title = seo.title;
                const data = { title: seo.title, description: seo.description, keywords: seo.keywords };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'seo.json'; a.click(); URL.revokeObjectURL(url);
              }}
              className="w-full py-2 rounded bg-accent text-black mt-2"
              aria-label="Publish SEO data"
            >Publish SEO Data</button>
          </div>
        </div>
      </section>

      <footer className="border-t mt-8 py-6 text-center text-sm text-gray-500">
        © Mandala Portfolio Builder. Brand colors: primary #5200ff, accent #ffd600. Font: Inter.
      </footer>
    </div>
  );
}
