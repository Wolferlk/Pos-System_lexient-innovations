import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg-base:     #0f1117;
    --bg-card:     #1a1d27;
    --bg-elevated: #22263a;
    --bg-hover:    #2a2f45;
    --accent:      #f5a623;
    --accent-dim:  rgba(245,166,35,0.13);
    --accent-glow: rgba(245,166,35,0.3);
    --success:     #22c55e;
    --success-dim: rgba(34,197,94,0.12);
    --danger:      #ef4444;
    --danger-dim:  rgba(239,68,68,0.1);
    --blue:        #3b82f6;
    --blue-dim:    rgba(59,130,246,0.12);
    --purple:      #a855f7;
    --purple-dim:  rgba(168,85,247,0.12);
    --text-primary:#f0f2f8;
    --text-muted:  #6b7499;
    --text-dim:    #3d4263;
    --border:      rgba(255,255,255,0.06);
    --radius:      14px;
    --radius-sm:   8px;
    --font:        'Sora', sans-serif;
    --mono:        'JetBrains Mono', monospace;
  }

  .mi-root * { box-sizing: border-box; }
  .mi-root { font-family: var(--font); color: var(--text-primary); }

  /* ── Page Header ── */
  .mi-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .mi-page-title { font-size: 24px; font-weight: 700; letter-spacing: -0.4px; }
  .mi-page-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; font-family: var(--mono); }
  .mi-stats { display: flex; gap: 12px; flex-wrap: wrap; }
  .mi-stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 20px; min-width: 110px; text-align: center; }
  .mi-stat-val { font-size: 20px; font-weight: 700; font-family: var(--mono); color: var(--accent); }
  .mi-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.8px; }

  /* ── Form Card ── */
  .mi-form-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
  .mi-form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .mi-form-title { font-size: 14px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); display: flex; align-items: center; gap: 8px; }
  .mi-form-title::before { content:''; display:block; width:3px; height:14px; background:var(--accent); border-radius:2px; }
  .mi-form-editing-badge { background: var(--blue-dim); color: var(--blue); border: 1px solid rgba(59,130,246,0.2); border-radius: 20px; font-size: 11px; font-weight: 600; padding: 3px 10px; font-family: var(--mono); }

  .mi-section-label { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); margin: 18px 0 12px; display: flex; align-items: center; gap: 8px; }
  .mi-section-label::after { content:''; flex:1; height:1px; background:var(--border); }

  .mi-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .mi-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mi-full { grid-column: 1 / -1; }

  .mi-field { display: flex; flex-direction: column; gap: 6px; }
  .mi-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .mi-input, .mi-select, .mi-textarea {
    background: var(--bg-elevated); border: 1px solid var(--border);
    color: var(--text-primary); font-family: var(--font); font-size: 13px;
    padding: 11px 14px; border-radius: var(--radius-sm); outline: none;
    transition: border-color .2s, box-shadow .2s; width: 100%;
  }
  .mi-input:focus, .mi-select:focus, .mi-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .mi-input::placeholder, .mi-textarea::placeholder { color: var(--text-dim); }
  .mi-select option { background: var(--bg-elevated); color: var(--text-primary); }
  .mi-textarea { resize: vertical; min-height: 72px; }

  /* Image preview */
  .mi-img-wrap { display: flex; gap: 12px; align-items: flex-start; }
  .mi-img-input { flex: 1; }
  .mi-img-preview { width: 56px; height: 56px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); object-fit: cover; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--text-dim); font-size: 22px; overflow: hidden; }
  .mi-img-preview img { width: 100%; height: 100%; object-fit: cover; }

  .mi-form-actions { display: flex; gap: 10px; margin-top: 20px; }
  .mi-submit-btn {
    flex: 1; background: var(--accent); color: #0f1117;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    padding: 13px; border-radius: var(--radius-sm); border: none;
    cursor: pointer; transition: all .2s; box-shadow: 0 4px 14px var(--accent-glow);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .mi-submit-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .mi-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .mi-cancel-btn {
    background: var(--bg-elevated); color: var(--text-muted);
    border: 1px solid var(--border); font-family: var(--font); font-size: 14px;
    font-weight: 600; padding: 13px 24px; border-radius: var(--radius-sm);
    cursor: pointer; transition: all .18s;
  }
  .mi-cancel-btn:hover { color: var(--text-primary); }

  /* ── Filters ── */
  .mi-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .mi-search { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: 13px; padding: 9px 14px; border-radius: var(--radius-sm); outline: none; flex: 1; min-width: 200px; transition: border-color .2s; }
  .mi-search:focus { border-color: var(--accent); }
  .mi-search::placeholder { color: var(--text-dim); }
  .mi-filter-select { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: 13px; padding: 9px 14px; border-radius: var(--radius-sm); outline: none; transition: border-color .2s; cursor: pointer; }
  .mi-filter-select:focus { border-color: var(--accent); }
  .mi-filter-select option { background: var(--bg-elevated); }

  /* ── Table ── */
  .mi-table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .mi-table-header { padding: 18px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .mi-table-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .mi-table-count { background: var(--accent-dim); color: var(--accent); font-size: 11px; font-weight: 700; font-family: var(--mono); padding: 2px 9px; border-radius: 20px; border: 1px solid rgba(245,166,35,0.2); }

  table.mi-table { width: 100%; border-collapse: collapse; }
  .mi-table thead tr { background: var(--bg-elevated); }
  .mi-table th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); white-space: nowrap; }
  .mi-table tbody tr { border-top: 1px solid var(--border); transition: background .15s; }
  .mi-table tbody tr:hover { background: var(--bg-hover); }
  .mi-table td { padding: 12px 16px; font-size: 13px; vertical-align: middle; }

  /* Item name cell */
  .mi-item-cell { display: flex; align-items: center; gap: 10px; }
  .mi-item-thumb { width: 38px; height: 38px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); object-fit: cover; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; overflow: hidden; }
  .mi-item-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
  .mi-item-name { font-weight: 600; font-size: 13px; }
  .mi-item-cat { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  .mi-price { font-family: var(--mono); font-size: 13px; color: var(--accent); font-weight: 500; }
  .mi-price-small { font-size: 11px; color: var(--text-muted); margin-top: 2px; font-family: var(--mono); }

  .mi-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .mi-badge-avail  { background: var(--success-dim); color: var(--success); border: 1px solid rgba(34,197,94,0.2); }
  .mi-badge-unavail{ background: var(--danger-dim);  color: var(--danger);  border: 1px solid rgba(239,68,68,0.2); }
  .mi-badge-time   { background: var(--purple-dim);  color: var(--purple);  border: 1px solid rgba(168,85,247,0.2); font-size: 10px; }
  .mi-badge-disc   { background: var(--accent-dim);  color: var(--accent);  border: 1px solid rgba(245,166,35,0.2); }

  .mi-actions { display: flex; gap: 6px; }
  .mi-action-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: transparent; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
  .mi-action-btn.edit:hover    { background: var(--blue-dim);    border-color: rgba(59,130,246,0.3); }
  .mi-action-btn.del:hover     { background: var(--danger-dim);  color: var(--danger); border-color: rgba(239,68,68,0.2); }
  .mi-action-btn.toggle:hover  { background: var(--accent-dim);  border-color: var(--accent); }

  .mi-empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px; }
  .mi-empty-icon { font-size: 36px; opacity: 0.3; margin-bottom: 8px; }

  /* ── Delete Confirm Modal ── */
  .mi-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fade-in .2s ease; }
  @keyframes fade-in { from{opacity:0}to{opacity:1} }
  .mi-confirm-modal { background: var(--bg-card); border: 1px solid rgba(239,68,68,0.25); border-radius: 16px; width: 380px; padding: 28px; animation: pop-in .22s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
  @keyframes pop-in { from{opacity:0;transform:scale(0.9) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)} }
  .mi-confirm-icon { font-size: 36px; text-align: center; margin-bottom: 12px; }
  .mi-confirm-title { font-size: 17px; font-weight: 700; text-align: center; margin-bottom: 6px; }
  .mi-confirm-sub { font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 22px; }
  .mi-confirm-actions { display: flex; gap: 10px; }
  .mi-confirm-btn { flex: 1; padding: 12px; border-radius: var(--radius-sm); border: none; font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; transition: all .18s; }
  .mi-confirm-btn.yes { background: var(--danger); color: #fff; }
  .mi-confirm-btn.yes:hover { filter: brightness(1.1); }
  .mi-confirm-btn.no  { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border); }
  .mi-confirm-btn.no:hover { color: var(--text-primary); }

  /* ── Toast ── */
  .mi-toast { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 20px; font-size: 13px; font-weight: 500; color: var(--text-primary); box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: toast-in .25s cubic-bezier(.34,1.56,.64,1); display: flex; align-items: center; gap: 10px; }
  @keyframes toast-in { from{opacity:0;transform:translateY(16px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)} }
  .mi-toast.success { border-color: rgba(34,197,94,0.3); }
  .mi-toast.error   { border-color: rgba(239,68,68,0.3); }
`;

const CATEGORIES = ["Rice", "Noodles", "Burgers", "Pizza", "Drinks", "Desserts", "Salads", "Snacks", "Soups", "Other"];
const TIMES      = ["Breakfast", "Lunch", "Dinner", "All the Day"];
const SPICY      = ["None", "Mild", "Medium", "Hot", "Extra Hot"];

const itemEmoji = (name = "", cat = "") => {
  const n = (name + cat).toLowerCase();
  if (n.includes("coffee") || n.includes("latte")) return "☕";
  if (n.includes("tea")) return "🍵";
  if (n.includes("juice") || n.includes("drink")) return "🥤";
  if (n.includes("burger")) return "🍔";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("cake") || n.includes("dessert")) return "🎂";
  if (n.includes("rice")) return "🍚";
  if (n.includes("noodle") || n.includes("pasta")) return "🍝";
  if (n.includes("salad")) return "🥗";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("soup")) return "🍲";
  if (n.includes("snack") || n.includes("fries")) return "🍟";
  return "🍽️";
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`mi-toast ${type}`}><span>{type === "success" ? "✅" : "❌"}</span>{msg}</div>;
}

const EMPTY_FORM = { name: "", category: "", fullPrice: "", smallPrice: "", note: "", specialDiscount: "", availableTime: "", Photolink: "", spicyLevel: "None" };

export default function ManageItems() {
  const token = localStorage.getItem("token");
  const [items, setItems]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [availFilter, setAvailFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    let data = items;
    if (catFilter !== "All") data = data.filter(i => i.category === catFilter);
    if (availFilter === "Available")   data = data.filter(i => i.available !== false);
    if (availFilter === "Unavailable") data = data.filter(i => i.available === false);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i => i.name.toLowerCase().includes(q) || (i.category||"").toLowerCase().includes(q));
    }
    setFiltered(data);
  }, [items, search, catFilter, availFilter]);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items", { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data);
    } catch { showToast("Failed to load items", "error"); }
  };

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullPrice || isNaN(form.fullPrice)) return showToast("Full price is required", "error");
    setLoading(true);
    const payload = {
      name: form.name,
      category: form.category,
      Photolink: form.Photolink || undefined,
      portion: {
        fullPrice: Number(form.fullPrice),
        smallPrice: form.smallPrice ? Number(form.smallPrice) : undefined,
      },
      note: form.note,
      spicyLevel: form.spicyLevel !== "None" ? form.spicyLevel : undefined,
      specialDiscount: form.specialDiscount ? Number(form.specialDiscount) : 0,
      availableTime: form.availableTime || undefined,
    };
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/items/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        showToast("Item updated successfully");
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/items", payload, { headers: { Authorization: `Bearer ${token}` } });
        showToast("Item added successfully");
      }
      resetForm();
      fetchItems();
    } catch { showToast("Failed to save item", "error"); }
    setLoading(false);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${deleteTarget._id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchItems();
    } catch { showToast("Failed to delete item", "error"); }
  };

  const editItem = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      fullPrice: item.portion.fullPrice,
      smallPrice: item.portion.smallPrice || "",
      note: item.note || "",
      specialDiscount: item.specialDiscount || "",
      availableTime: item.availableTime || "",
      Photolink: item.Photolink || "",
      spicyLevel: item.spicyLevel || "None",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.put(`http://localhost:5000/api/items/${item._id}`, { available: !item.available }, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, available: !item.available } : i));
      showToast(`"${item.name}" marked ${!item.available ? "available" : "unavailable"}`);
    } catch { showToast("Failed to toggle availability", "error"); }
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const uniqueCategories = ["All", ...new Set(items.map(i => i.category).filter(Boolean))];
  const availCount   = items.filter(i => i.available !== false).length;
  const unavailCount = items.length - availCount;

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="mi-root">

        {/* Page Header */}
        <div className="mi-page-header">
          <div>
            <div className="mi-page-title">🍛 Manage Items</div>
            <div className="mi-page-sub">Add, edit & control menu availability</div>
          </div>
          <div className="mi-stats">
            <div className="mi-stat-card">
              <div className="mi-stat-val">{items.length}</div>
              <div className="mi-stat-label">Total</div>
            </div>
            <div className="mi-stat-card">
              <div className="mi-stat-val" style={{ color: "var(--success)" }}>{availCount}</div>
              <div className="mi-stat-label">Available</div>
            </div>
            <div className="mi-stat-card">
              <div className="mi-stat-val" style={{ color: "var(--danger)" }}>{unavailCount}</div>
              <div className="mi-stat-label">Hidden</div>
            </div>
          </div>
        </div>

        {/* ── FORM ── */}
        <div className="mi-form-card">
          <div className="mi-form-header">
            <div className="mi-form-title">{editingId ? "Edit Item" : "Add New Item"}</div>
            {editingId && <div className="mi-form-editing-badge">✏️ Editing Mode</div>}
          </div>

          <form onSubmit={handleSubmit}>

            {/* Basic Info */}
            <div className="mi-section-label">Basic Info</div>
            <div className="mi-grid-3">
              <div className="mi-field">
                <label className="mi-label">Item Name *</label>
                <input className="mi-input" placeholder="e.g. Chicken Fried Rice" value={form.name} required onChange={e => set("name", e.target.value)} />
              </div>
              <div className="mi-field">
                <label className="mi-label">Category *</label>
                <select className="mi-select" value={form.category} required onChange={e => set("category", e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mi-field">
                <label className="mi-label">Available Time</label>
                <select className="mi-select" value={form.availableTime} onChange={e => set("availableTime", e.target.value)}>
                  <option value="">All the Day</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="mi-section-label">Pricing</div>
            <div className="mi-grid-3">
              <div className="mi-field">
                <label className="mi-label">Full Price (Rs.) *</label>
                <input className="mi-input" type="number" placeholder="e.g. 450" value={form.fullPrice} required min={1} onChange={e => set("fullPrice", e.target.value)} />
              </div>
              <div className="mi-field">
                <label className="mi-label">Small Price (Rs.)</label>
                <input className="mi-input" type="number" placeholder="Optional" value={form.smallPrice} onChange={e => set("smallPrice", e.target.value)} />
              </div>
              <div className="mi-field">
                <label className="mi-label">Special Discount (%)</label>
                <input className="mi-input" type="number" placeholder="e.g. 10" min={0} max={100} value={form.specialDiscount} onChange={e => set("specialDiscount", e.target.value)} />
              </div>
            </div>

            {/* Photo & Details */}
            <div className="mi-section-label">Photo & Details</div>
            <div className="mi-grid-2">
              <div className="mi-field">
                <label className="mi-label">Photo URL (Photolink)</label>
                <div className="mi-img-wrap">
                  <div className="mi-img-input">
                    <input
                      className="mi-input" placeholder="https://example.com/image.jpg"
                      value={form.Photolink} onChange={e => set("Photolink", e.target.value)}
                    />
                  </div>
                  <div className="mi-img-preview">
                    {form.Photolink
                      ? <img src={form.Photolink} alt="preview" onError={e => e.target.style.display="none"} />
                      : "🖼️"}
                  </div>
                </div>
              </div>
              <div className="mi-field">
                <label className="mi-label">Spicy Level</label>
                <select className="mi-select" value={form.spicyLevel} onChange={e => set("spicyLevel", e.target.value)}>
                  {SPICY.map(s => <option key={s} value={s}>{s === "None" ? "🌿 None" : s === "Mild" ? "🌶 Mild" : s === "Medium" ? "🌶🌶 Medium" : s === "Hot" ? "🌶🌶🌶 Hot" : "🔥 Extra Hot"}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="mi-field">
                <label className="mi-label">Note</label>
                <textarea className="mi-textarea" placeholder="e.g. Contains nuts, gluten-free..." value={form.note} onChange={e => set("note", e.target.value)} />
              </div>
            </div>

            <div className="mi-form-actions">
              {editingId && <button type="button" className="mi-cancel-btn" onClick={resetForm}>Cancel</button>}
              <button type="submit" className="mi-submit-btn" disabled={loading}>
                {loading ? "⏳ Saving..." : editingId ? "💾 Update Item" : "＋ Add Item"}
              </button>
            </div>
          </form>
        </div>

        {/* ── FILTERS ── */}
        <div className="mi-filters">
          <input className="mi-search" placeholder="🔍 Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="mi-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="mi-filter-select" value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Available">✅ Available</option>
            <option value="Unavailable">❌ Unavailable</option>
          </select>
        </div>

        {/* ── TABLE ── */}
        <div className="mi-table-card">
          <div className="mi-table-header">
            <div className="mi-table-title">Menu Items <span className="mi-table-count">{filtered.length}</span></div>
          </div>
          <table className="mi-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Pricing</th>
                <th>Discount</th>
                <th>Time</th>
                <th>Spicy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="mi-empty"><div className="mi-empty-icon">🍽️</div><div>No items found</div></div></td></tr>
              ) : filtered.map(item => (
                <tr key={item._id}>
                  {/* Item */}
                  <td>
                    <div className="mi-item-cell">
                      <div className="mi-item-thumb">
                        {item.Photolink
                          ? <img src={item.Photolink} alt={item.name} onError={e => { e.target.style.display="none"; e.target.parentNode.innerText = itemEmoji(item.name, item.category); }} />
                          : itemEmoji(item.name, item.category)}
                      </div>
                      <div>
                        <div className="mi-item-name">{item.name}</div>
                        <div className="mi-item-cat">{item.category}</div>
                      </div>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td>
                    <div className="mi-price">Rs. {item.portion.fullPrice}</div>
                    {item.portion.smallPrice && <div className="mi-price-small">Small: Rs. {item.portion.smallPrice}</div>}
                  </td>

                  {/* Discount */}
                  <td>
                    {item.specialDiscount > 0
                      ? <span className="mi-badge mi-badge-disc">{item.specialDiscount}% OFF</span>
                      : <span style={{ color: "var(--text-dim)", fontSize: 12 }}>—</span>}
                  </td>

                  {/* Time */}
                  <td>
                    {item.availableTime
                      ? <span className="mi-badge mi-badge-time">{item.availableTime}</span>
                      : <span style={{ color: "var(--text-dim)", fontSize: 12 }}>All Day</span>}
                  </td>

                  {/* Spicy */}
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {item.spicyLevel && item.spicyLevel !== "None" ? item.spicyLevel : "—"}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`mi-badge ${item.available !== false ? "mi-badge-avail" : "mi-badge-unavail"}`}>
                      {item.available !== false ? "✅ Active" : "❌ Hidden"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="mi-actions">
                      <button className="mi-action-btn edit" title="Edit" onClick={() => editItem(item)}>✏️</button>
                      <button className="mi-action-btn toggle" title="Toggle availability" onClick={() => toggleAvailability(item)}>
                        {item.available !== false ? "🙈" : "👁️"}
                      </button>
                      <button className="mi-action-btn del" title="Delete" onClick={() => setDeleteTarget(item)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirm Modal */}
        {deleteTarget && (
          <div className="mi-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
            <div className="mi-confirm-modal">
              <div className="mi-confirm-icon">🗑️</div>
              <div className="mi-confirm-title">Delete Item?</div>
              <div className="mi-confirm-sub">
                Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>"{deleteTarget.name}"</strong>?<br />This cannot be undone.
              </div>
              <div className="mi-confirm-actions">
                <button className="mi-confirm-btn no" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="mi-confirm-btn yes" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}