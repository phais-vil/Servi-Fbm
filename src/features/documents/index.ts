export type {
  DocumentRequestDto,
  DocumentApprovalDto,
} from "./_internal/services";
export type {
  CreateDocumentInput,
  ReviewDocumentInput,
  DocumentTypeEnum,
  DocumentStatusEnum,
  ApprovalDecisionEnum,
} from "./_internal/validations";
export {
  documentTypes,
  documentStatuses,
  approvalDecisions,
} from "./_internal/validations";
export { DOCUMENT_P, DOCUMENT_PERMISSIONS } from "./permissions";
