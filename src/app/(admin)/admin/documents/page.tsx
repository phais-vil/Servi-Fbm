import { requirePermission, hasPermission } from "@/features/identity/server";
import { DOCUMENT_P, listDocumentRequests } from "@/features/documents/server";
import { DocumentClient } from "./_components/document-client";

export default async function DocumentsAdminPage() {
  const ctx = await requirePermission(DOCUMENT_P.documentReview);
  const initialDocs = await listDocumentRequests(ctx.tenantId);

  return (
    <DocumentClient
      initialDocs={initialDocs}
      canManage={hasPermission(ctx, DOCUMENT_P.documentManage)}
    />
  );
}
