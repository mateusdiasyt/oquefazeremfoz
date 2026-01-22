'use client'
import { useEffect, useState } from 'react'

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', priceCents: 0, isVerified: false, isActive: true, features: '' })

  async function load() {
    const res = await fetch('/api/admin/plans', { cache: 'no-store' })
    const data = await res.json()
    setPlans(data)
  }

  useEffect(() => { load() }, [])

  async function createPlan(e: any) {
    e.preventDefault()
    const payload = { ...form, priceCents: Number(form.priceCents), features: form.features.split('|').map(s=>s.trim()).filter(Boolean) }
    await fetch('/api/admin/plans', { method: 'POST', body: JSON.stringify(payload) })
    setForm({ name: '', priceCents: 0, isVerified: false, isActive: true, features: '' })
    load()
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Planos</h1>

      <form onSubmit={createPlan} className="grid grid-cols-2 gap-3 border rounded p-3 mb-6">
        <input className="border rounded px-2 py-1" placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border rounded px-2 py-1" placeholder="Preço (centavos)" type="number" value={form.priceCents} onChange={e=>setForm({...form, priceCents:e.target.value as any})} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isVerified} onChange={e=>setForm({...form, isVerified:e.target.checked})}/> Selo verificado</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})}/> Ativo</label>
        <input className="col-span-2 border rounded px-2 py-1" placeholder="Features separadas por |" value={form.features} onChange={e=>setForm({...form, features:e.target.value})} />
        <button className="border rounded px-3 py-2">Criar plano</button>
      </form>

      <div className="flex flex-col gap-3">
        {plans.map((p:any) => (
          <div key={p.id} className="border rounded p-3">
            <div className="font-medium">{p.name} {p.isVerified && '✔️'}</div>
            <div className="text-sm text-gray-600">R$ {(p.priceCents/100).toFixed(2)} • {p.isActive ? 'Ativo' : 'Inativo'}</div>
            <div className="text-xs text-gray-500">{(p.features||[]).join(', ')}</div>
          </div>
        ))}
      </div>
    </main>
  )
}

