import type { DocumentDto } from '@/types/entities';
import { DocumentCard } from '@/components/DocumentCard';

export interface StudentDocumentsSectionStudent {
  fullName: string;
  curp?: string | null;
  grade?: string | null;
}

export interface StudentDocumentsSectionProps {
  student: StudentDocumentsSectionStudent;
  documents: DocumentDto[];
  getCategoryName: (categoryId: number) => string;
  onDownload: (doc: DocumentDto) => void;
  onDelete: (doc: DocumentDto) => void;
  downloadingId: number | null;
}

export function StudentDocumentsSection({
  student,
  documents,
  getCategoryName,
  onDownload,
  onDelete,
  downloadingId,
}: StudentDocumentsSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">
        {student.fullName}
        {student.curp && (
          <span className="ml-2 font-normal text-slate-500">({student.curp})</span>
        )}
        {student.grade != null && student.grade !== '' && (
          <span className="ml-2 text-slate-500">· {student.grade}</span>
        )}
      </h3>
      <ul className="space-y-2">
        {documents.map((d) => (
          <DocumentCard
            key={d.id}
            document={d}
            categoryName={getCategoryName(d.categoryId)}
            subtitle={`Subido ${new Date(d.uploadedAt).toLocaleDateString('es')}`}
            onDownload={onDownload}
            onDelete={onDelete}
            downloadingId={downloadingId}
            className="rounded-lg"
          />
        ))}
      </ul>
    </div>
  );
}
