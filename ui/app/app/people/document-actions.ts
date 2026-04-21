
"use server";

import { canAccessRoute } from '@/src/lib/auth/roles';
import { getCurrentUser } from '@/src/lib/auth/session';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasBranchAccess, hasCompanyAccess } from '@/src/lib/auth/access';
import {
  buildEmployeeDocumentPath,
  EMPLOYEE_DOCUMENT_BUCKET,
  getEmployeeDocumentFolder,
  type EmployeeDocumentType,
} from '@/src/lib/employees/document-storage';

function normalizeDocumentType(value: string): EmployeeDocumentType {
  return value === 'contract' ? 'contract' : 'certificate';
}

function getNullableValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim();
  return value.length > 0 ? value : null;
}

async function assertEmployeeDocumentAccess(employeeId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !canAccessRoute(currentUser.role, 'people_detail')) {
    throw new Error('You do not have permission to manage employee documents.');
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('employees')
    .select('id, employee_code, company_type, branch_code, company_id, branch_id')
    .eq('id', employeeId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? 'Employee not found.');
  }

  if (!hasCompanyAccess(currentUser.accessScope, data.company_id)) {
    throw new Error('You do not have access to the selected company.');
  }

  if (!hasBranchAccess(currentUser.accessScope, data.branch_id)) {
    throw new Error('You do not have access to the selected branch.');
  }

  return {
    supabase,
    employee: data,
  };
}

async function ensureEmployeeDocumentBucket(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(error.message);
  }

  if (!buckets?.some((bucket) => bucket.name === EMPLOYEE_DOCUMENT_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(EMPLOYEE_DOCUMENT_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });

    if (createError && !createError.message.toLowerCase().includes('already exists')) {
      throw new Error(createError.message);
    }
  }
}

export async function uploadEmployeeDocument(formData: FormData) {
  const employeeId = String(formData.get('employeeId') ?? '').trim();
  const file = formData.get('file');

  if (!employeeId) {
    throw new Error('Missing employee id.');
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Please select a file to upload.');
  }

  const documentType = normalizeDocumentType(String(formData.get('documentType') ?? 'certificate'));
  const expiryDate = documentType === 'certificate' ? getNullableValue(formData, 'expiryDate') : null;
  const remarks = getNullableValue(formData, 'remarks');

  const { supabase, employee } = await assertEmployeeDocumentAccess(employeeId);
  await ensureEmployeeDocumentBucket(supabase);

  const folder = getEmployeeDocumentFolder({
    companyCode: employee.company_type,
    branchCode: employee.branch_code,
    employeeCode: employee.employee_code,
    documentType,
  });
  const path = buildEmployeeDocumentPath(folder, file.name);

  const { error: uploadError } = await supabase.storage
    .from(EMPLOYEE_DOCUMENT_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: insertError } = await supabase.from('employee_documents').insert({
    employee_id: employee.id,
    document_type: documentType,
    file_name: file.name,
    file_path: path,
    storage_folder: folder,
    expiry_date: expiryDate,
    remarks,
  });

  if (insertError) {
    await supabase.storage.from(EMPLOYEE_DOCUMENT_BUCKET).remove([path]).catch(() => undefined);
    throw new Error(insertError.message);
  }

  void 0;
}

export async function deleteEmployeeDocument(formData: FormData) {
  const documentId = String(formData.get('documentId') ?? '').trim();
  const employeeId = String(formData.get('employeeId') ?? '').trim();

  if (!documentId || !employeeId) {
    throw new Error('Missing document id.');
  }

  const { supabase, employee } = await assertEmployeeDocumentAccess(employeeId);

  const { data: document, error: documentError } = await supabase
    .from('employee_documents')
    .select('id, file_path')
    .eq('id', documentId)
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (documentError || !document) {
    throw new Error(documentError?.message ?? 'Document not found.');
  }

  await supabase.storage.from(EMPLOYEE_DOCUMENT_BUCKET).remove([document.file_path]).catch(() => undefined);

  const { error: deleteError } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', documentId)
    .eq('employee_id', employeeId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  void 0;
}