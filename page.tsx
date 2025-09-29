"use client";
import { useState } from "react";

export default function Dashboard() {
  const [running, setRunning] = useState(false);
  const [odoStart, setOdoStart] = useState<number | "">("");
  const [odoEnd, setOdoEnd] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function startShift() {
    setMessage(null);
    const res = await fetch("/api/shift/start", { method: "POST", body: JSON.stringify({ odoStart: odoStart === "" ? undefined : Number(odoStart), note }) });
    if (res.ok) { setRunning(true); setMessage("Směna spuštěna."); } else { setMessage(await res.text()); }
  }

  async function endShift() {
    setMessage(null);
    const res = await fetch("/api/shift/end", { method: "POST", body: JSON.stringify({ odoEnd: odoEnd === "" ? undefined : Number(odoEnd), note }) });
    if (res.ok) { setRunning(false); setMessage("Směna ukončena a propsána do Sheets."); setOdoStart(""); setOdoEnd(""); }
    else { setMessage(await res.text()); }
  }

  return (
    <div className="grid gap-6">
      <section className="p-6 rounded-2xl border border-neutral-800">
        <h1 className="text-2xl font-semibold mb-2">Směna</h1>
        <p className="text-sm opacity-80 mb-4">Zadejte stav tachometru pro lepší výpočet kilometrů.</p>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <label className="grid gap-1">
            <span className="text-xs opacity-80">Odo start (km)</span>
            <input className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2" value={odoStart as any} onChange={e=>setOdoStart(e.target.value === '' ? '' : Number(e.target.value))} type="number" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs opacity-80">Odo konec (km)</span>
            <input className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2" value={odoEnd as any} onChange={e=>setOdoEnd(e.target.value === '' ? '' : Number(e.target.value))} type="number" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs opacity-80">Poznámka</span>
            <input className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2" value={note} onChange={e=>setNote(e.target.value)} />
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={startShift} disabled={running} className="px-4 py-2 rounded-xl bg-emerald-600 disabled:opacity-50">Začít směnu</button>
          <button onClick={endShift} disabled={!running} className="px-4 py-2 rounded-xl bg-rose-600 disabled:opacity-50">Ukončit směnu</button>
        </div>
        {message && <p className="mt-3 text-sm opacity-90">{message}</p>}
      </section>

      <section className="p-6 rounded-2xl border border-neutral-800">
        <h2 className="text-xl font-semibold mb-2">Dostupnost</h2>
        <AvailabilityQuickSet />
      </section>
    </div>
  );
}

function AvailabilityQuickSet() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [status, setStatus] = useState<'OFF'|'PROJECT'>('OFF');
  const [project, setProject] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    const res = await fetch('/api/availability', { method: 'POST', body: JSON.stringify({ date, status, project: project || undefined }) });
    setMsg(res.ok ? 'Uloženo' : 'Chyba');
  }

  return (
    <div className="grid sm:grid-cols-4 gap-3 items-end">
      <label className="grid gap-1">
        <span className="text-xs opacity-80">Datum</span>
        <input type="date" className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} />
      </label>
      <label className="grid gap-1">
        <span className="text-xs opacity-80">Status</span>
        <select className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="OFF">Volno</option>
          <option value="PROJECT">Projekt</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-xs opacity-80">Projekt (volitelné)</span>
        <input className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2" value={project} onChange={e=>setProject(e.target.value)} />
      </label>
      <button onClick={save} className="px-4 py-2 rounded-xl bg-neutral-700">Uložit</button>
      {msg && <p className="text-sm col-span-4">{msg}</p>}
    </div>
  );
}
