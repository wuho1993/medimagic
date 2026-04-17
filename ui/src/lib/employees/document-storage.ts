export const EMPLOYEE_DOCUMENT_BUCKET = 'employee-documents';

export type EmployeeDocumentType = 'certificate' | 'contract';

function sanitizePathSegment(value: string | null | undefined) {
  return (value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function getEmployeeDocumentFolder(params: {
  companyCode: string | null | undefined;
  branchCode: string | null | undefined;
  employeeCode: string;
  documentType: EmployeeDocumentType;
}) {
  const companyCode = sanitizePathSegment(params.companyCode) || 'unknown-company';
  const branchCode = sanitizePathSegment(params.branchCode) || 'unassigned-branch';
  const employeeCode = sanitizePathSegment(params.employeeCode) || 'unknown-employee';
  const typeFolder = params.documentType === 'contract' ? 'contracts' : 'certificates';

  return `${companyCode}/${branchCode}/${employeeCode}/${typeFolder}`;
}

export function buildEmployeeDocumentPath(folder: string, fileName: string) {
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
  return `${folder}/${Date.now()}-${cleanName}`;
}