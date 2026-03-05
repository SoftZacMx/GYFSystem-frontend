interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout reutilizable para login, forgot-password y reset-password.
 * Columna izquierda: logo (md+). Columna derecha: logo móvil, hero, contenido (children), footer.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 p-4 font-display md:bg-[#f6f7f8] md:p-8 lg:p-12">
      <div className="flex w-full max-w-[390px] sm:max-w-[420px] md:max-w-5xl md:min-h-[600px] lg:min-h-[640px] overflow-hidden rounded-2xl bg-white shadow-lg md:flex-row flex-col">
        {/* Columna izquierda (md+): solo logo */}
        <div className="hidden md:flex md:flex-[0_0_42%] lg:flex-[0_0_40%] flex-col items-center justify-center p-8 lg:p-12 bg-slate-50/70">
          <div className="h-[380px] w-[320px] shrink-0 lg:h-[460px] lg:w-[380px]">
            <img
              src="/Logo.png"
              alt="Get Your Files"
              className="h-full w-full object-contain object-center rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="hidden md:block w-px shrink-0 bg-slate-200/90" aria-hidden />

        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex flex-col items-center p-4 md:hidden">
            <img src="/Logo.png" alt="Get Your Files" className="h-32 w-auto object-contain rounded-xl shadow-md" />
          </div>

          <div
            className="h-[200px] md:h-[260px] lg:h-[300px] w-full shrink-0 bg-cover bg-center bg-no-repeat rounded-xl md:rounded-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1300&q=80")',
            }}
            aria-hidden
          />

          {children}

          <div className="mt-auto border-t border-slate-200 px-4 md:px-6 lg:px-8 py-4 text-center text-xs md:text-sm text-slate-500">
            © {new Date().getFullYear()} Get Your Files
          </div>
        </div>
      </div>
    </div>
  );
}
