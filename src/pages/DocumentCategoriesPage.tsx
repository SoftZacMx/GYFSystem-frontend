import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { DocumentCategoryDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import {
  fetchDocumentCategories,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
} from '@/services/document-categories.service';
import { ListScreenLayout, ListCard } from '@/components/ListScreenLayout';

export function DocumentCategoriesPage() {
  const [list, setList] = useState<DocumentCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDocumentCategories()
      .then(setList)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
  }, [list, search]);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEdit = (c: DocumentCategoryDto) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description ?? '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const body = { name: name.trim(), description: description.trim() || null };
    (editingId == null ? createDocumentCategory(body) : updateDocumentCategory(editingId, body))
      .then(() => {
        toast.success(editingId == null ? 'Categoría creada' : 'Categoría actualizada');
        setShowModal(false);
        load();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al guardar'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (c: DocumentCategoryDto) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    deleteDocumentCategory(c.id)
      .then(() => {
        toast.success('Categoría eliminada');
        load();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'));
  };

  return (
    <ListScreenLayout
      title="Categorías de documentos"
      icon="folder"
      searchPlaceholder="Buscar categorías..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      {loading ? (
        <p className="py-8 text-center text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No hay categorías</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ListCard
              key={c.id}
              avatar={<span className="material-symbols-outlined text-slate-500">folder</span>}
              title={c.name}
              subtitle={c.description ?? undefined}
              onMenuClick={() => openEdit(c)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">{editingId == null ? 'Nueva categoría' : 'Editar categoría'}</h3>
            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800" required />
              <label className="mb-2 block text-sm font-medium text-slate-700">Descripción</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800" />
              <div className="flex justify-end gap-2">
                {editingId != null && (
                  <button type="button" onClick={() => { const c = list.find((x) => x.id === editingId); if (c) handleDelete(c); }} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Eliminar</button>
                )}
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button type="submit" disabled={saving} className="rounded-xl bg-[#136dec] px-4 py-2 text-sm font-medium text-white disabled:opacity-70">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ListScreenLayout>
  );
}
