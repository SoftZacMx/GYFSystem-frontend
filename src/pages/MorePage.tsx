import { ListScreenLayout, ListCard } from '@/components/ListScreenLayout';

const items = [
  { to: '/events', title: 'Eventos', subtitle: 'Calendario y eventos', icon: 'event' },
  { to: '/notifications', title: 'Notificaciones', subtitle: 'Ver avisos y alertas', icon: 'notifications' },
  { to: '/document-categories', title: 'Categorías de documentos', subtitle: 'Gestionar categorías', icon: 'folder' },
  { to: '/company', title: 'Company', subtitle: 'Datos de la empresa', icon: 'business' },
];

export function MorePage() {
  return (
    <ListScreenLayout title="Más" icon="apps">
      <div className="space-y-3">
        {items.map((item) => (
          <ListCard
            key={item.to}
            to={item.to}
            avatar={<span className="material-symbols-outlined text-slate-500">{item.icon}</span>}
            title={item.title}
            subtitle={item.subtitle}
          />
        ))}
      </div>
    </ListScreenLayout>
  );
}
