import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { CompanyDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchCompanyById, createCompany, updateCompany } from '@/services/company.service';
import { useTheme } from '@/contexts/ThemeContext';

const DEFAULT_ID = 1;

const MAX_NAME = 40;
const MAX_EMAIL = 40;
const MAX_PHONE = 10;
const MAX_ADDRESS = 60;

/** Zonas horarias disponibles para el perfil del centro */
export const TIMEZONE_OPTIONS = [
  { value: '', label: 'Seleccionar zona horaria' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (America/Mexico_City)' },
  { value: 'America/Cancun', label: 'Cancún (America/Cancun)' },
  { value: 'America/Merida', label: 'Mérida (America/Merida)' },
  { value: 'America/Monterrey', label: 'Monterrey (America/Monterrey)' },
  { value: 'America/Tijuana', label: 'Tijuana (America/Tijuana)' },
  { value: 'America/Chihuahua', label: 'Chihuahua (America/Chihuahua)' },
  { value: 'America/Hermosillo', label: 'Hermosillo (America/Hermosillo)' },
  { value: 'America/Matamoros', label: 'Matamoros (America/Matamoros)' },
  { value: 'America/New_York', label: 'Nueva York (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (America/Los_Angeles)' },
  { value: 'America/Chicago', label: 'Chicago (America/Chicago)' },
  { value: 'America/Bogota', label: 'Bogotá (America/Bogota)' },
  { value: 'America/Lima', label: 'Lima (America/Lima)' },
  { value: 'America/Santiago', label: 'Santiago (America/Santiago)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (America/Buenos_Aires)' },
  { value: 'UTC', label: 'UTC' },
] as const;

export function CompanyPage() {
  const { primaryColor, accentColor, setPrimaryColor, setAccentColor } = useTheme();
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreate, setIsCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [timezone, setTimezone] = useState('');
  const [showLogoInput, setShowLogoInput] = useState(false);
  const [logoInput, setLogoInput] = useState('');

  const load = () => {
    setLoading(true);
    fetchCompanyById(DEFAULT_ID)
      .then((data) => {
        setCompany(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone ?? '');
        setAddress(data.address ?? '');
        setLogoUrl(data.logoUrl ?? '');
        setTimezone(data.timezone ?? '');
        setIsCreate(false);
      })
      .catch(() => {
        setCompany(null);
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setLogoUrl('');
        setTimezone('');
        setIsCreate(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    const body = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      logoUrl: logoUrl.trim() || null,
      timezone: timezone.trim() || null,
    };
    const promise = isCreate ? createCompany(body) : updateCompany(company!.id, body);
    promise
      .then((data) => {
        setCompany(data);
        setIsCreate(false);
        toast.success(isCreate ? 'Perfil creado' : 'Cambios guardados');
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al guardar'))
      .finally(() => setSaving(false));
  };

  const applyLogoUrl = () => {
    if (logoInput.trim()) {
      setLogoUrl(logoInput.trim());
      setShowLogoInput(false);
      setLogoInput('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-slate-100">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-100 pb-24 font-display">
      <div className="mx-auto w-full px-4 py-6 md:max-w-none md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:max-w-full md:p-8">
          {/* Header con back */}
          <div className="mb-8 flex items-center gap-4">
            <Link
              to="/more"
              className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Volver"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
              Perfil del centro
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Branding + Brand Colors en grid en md+ */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Branding */}
              <section>
                <h2 className="mb-4 text-base font-bold text-slate-800">Branding</h2>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="relative inline-block">
                    <div className="flex size-28 items-center justify-center overflow-hidden rounded-full bg-teal-700 md:size-32">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-white md:text-6xl">
                          shield
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogoInput(true)}
                      className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-lg text-white shadow"
                      style={{ backgroundColor: primaryColor }}
                      aria-label="Subir logo"
                    >
                      <span className="material-symbols-outlined text-lg">camera_alt</span>
                    </button>
                  </div>
                  <p className="mt-4 font-medium text-slate-800">Logo oficial</p>
                  <p className="mt-1 text-sm text-slate-500">Recomendado: 512×512 px</p>
                  {showLogoInput ? (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="url"
                        value={logoInput}
                        onChange={(e) => setLogoInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 rounded-lg border border-input bg-slate-50 px-3 py-2 text-slate-800 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={applyLogoUrl}
                        className="rounded-lg px-4 py-2 text-white font-medium"
                        style={{ backgroundColor: primaryColor }}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowLogoInput(false); setLogoInput(''); }}
                        className="rounded-lg border border-accent px-4 py-2 text-accent transition hover:bg-accent/10"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLogoInput(true)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="material-symbols-outlined">upload</span>
                      Actualizar logo
                    </button>
                  )}
                </div>
              </section>

              {/* Colores de marca: el usuario define aquí el tema */}
              <section>
                <h2 className="mb-4 text-base font-bold text-slate-800">Colores de marca</h2>
                <p className="mb-4 text-sm text-slate-500">
                  Elige el color primario y de acento para el tema de la aplicación.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Color primario
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="size-12 cursor-pointer rounded-lg border border-input bg-transparent p-0"
                        aria-label="Color primario"
                      />
                      <span className="font-mono text-sm font-medium text-slate-800">{primaryColor}</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Color de acento
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="size-12 cursor-pointer rounded-lg border border-input bg-transparent p-0"
                        aria-label="Color de acento"
                      />
                      <span className="font-mono text-sm font-medium text-slate-800">{accentColor}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Datos del centro */}
            <section>
              <h2 className="mb-4 text-base font-bold text-slate-800">Datos del centro</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nombre del centro
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={MAX_NAME}
                    className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    placeholder="Ej. Oakwood International Academy"
                  />
                  <p className="mt-1 text-xs text-slate-500">{name.length}/{MAX_NAME}</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={MAX_EMAIL}
                    className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  <p className="mt-1 text-xs text-slate-500">{email.length}/{MAX_EMAIL}</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={MAX_PHONE}
                    className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    placeholder="10 dígitos"
                  />
                  <p className="mt-1 text-xs text-slate-500">{phone.length}/{MAX_PHONE}</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Zona horaria
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  >
                    {TIMEZONE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={MAX_ADDRESS}
                    className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    placeholder="Máx. 60 caracteres"
                  />
                  <p className="mt-1 text-xs text-slate-500">{address.length}/{MAX_ADDRESS}</p>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl py-4 text-white font-semibold shadow-sm disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              Guardar todos los cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
