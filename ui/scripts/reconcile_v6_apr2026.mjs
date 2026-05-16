import fs from 'node:fs/promises';
import path from 'node:path';
import dns from 'node:dns';
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';

dns.setDefaultResultOrder('ipv4first');

const UI_ROOT = process.cwd();
const ENV_PATH = path.join(UI_ROOT, '.env.local');
const REPORT_DIR = path.join(UI_ROOT, 'docs', 'reconciliation');
const BACKUP_DIR = path.join(UI_ROOT, 'supabase', 'manual', 'backups');

const V6_RECORD_PATH = '/Users/joecheung/Desktop/V6_員工資料對照_record.xlsx';
const SALARY_PATH = '/Users/joecheung/Desktop/Medi Magic 2026/04-2026_MM(FY)_V6.xlsx';
const ATTENDANCE_PATH = '/Users/joecheung/Desktop/Medi Magic 2026/2026 Apr員工出勤資料.xlsx';

const APPLY = process.argv.includes('--apply');
const NOW = new Date();
const STAMP = [
  NOW.getFullYear(),
  String(NOW.getMonth() + 1).padStart(2, '0'),
  String(NOW.getDate()).padStart(2, '0'),
  '-',
  String(NOW.getHours()).padStart(2, '0'),
  String(NOW.getMinutes()).padStart(2, '0'),
  String(NOW.getSeconds()).padStart(2, '0'),
].join('');

function parseEnv(raw) {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

function normalizeText(value) {
  if (value == null) return null;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text || null;
}

function getCellText(cellValue) {
  if (cellValue == null) return null;
  if (typeof cellValue === 'object') {
    if ('text' in cellValue && cellValue.text) return normalizeText(cellValue.text);
    if ('result' in cellValue && cellValue.result != null) return normalizeText(cellValue.result);
  }
  return normalizeText(cellValue);
}

function simplifyName(value) {
  return (normalizeText(value) || '')
    .toLowerCase()
    .replace(/\bpt\b/g, ' ')
    .replace(/\bcs\b/g, ' ')
    .replace(/\bdoctor\b/g, 'dr')
    .replace(/[()（）]/g, ' ')
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, '');
}

function containsCjk(value) {
  return /[\u3400-\u9fff]/.test(value || '');
}

function makeTempCode(v6Row) {
  return `V6TMP202603R${String(v6Row).padStart(3, '0')}`;
}

function isConflictReason(reason) {
  return /重複|未能確認/.test(reason || '');
}

function mergeUnique(values) {
  return [...new Set(values.map(normalizeText).filter(Boolean))];
}

function combineAlias(existingAlias, additions) {
  const merged = mergeUnique([existingAlias, ...additions]);
  return merged.length ? merged.join(' / ') : null;
}

function appendNoteSections(existingNotes, sections) {
  const base = normalizeText(existingNotes);
  const lines = new Set((base ? base.split('\n') : []).map((line) => line.trim()).filter(Boolean));
  for (const section of sections.map(normalizeText).filter(Boolean)) {
    lines.add(section);
  }
  return [...lines].join('\n');
}

async function loadWorkbook(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return workbook;
}

async function loadV6Records() {
  const workbook = await loadWorkbook(V6_RECORD_PATH);
  const records = [];

  for (const sheetName of ['V6_對到員工資料', 'V6_員工資料未有或未確認']) {
    const sheet = workbook.getWorksheet(sheetName);
    const matched = sheetName === 'V6_對到員工資料';

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const v6Row = Number(row.getCell(1).value);
      if (!v6Row) continue;

      const officialCode = normalizeText(row.getCell(2).value);
      const v6Name = normalizeText(row.getCell(3).value);
      const reason = matched ? null : normalizeText(row.getCell(12).value);
      const employeeNameZh = normalizeText(row.getCell(17).value);
      const employeeNameEn = normalizeText(row.getCell(18).value);
      const alias = normalizeText(row.getCell(16).value) || v6Name;

      records.push({
        sourceSheet: sheetName,
        matched,
        v6Row,
        tempCode: makeTempCode(v6Row),
        officialCode: officialCode && officialCode !== 'N/A' ? officialCode : null,
        v6Name,
        branch: normalizeText(row.getCell(4).value),
        company: normalizeText(row.getCell(5).value),
        reason,
        employeeNameZh,
        employeeNameEn,
        alias,
      });
    }
  }

  return records;
}

async function loadSalaryPeople() {
  const workbook = await loadWorkbook(SALARY_PATH);
  const sheet = workbook.getWorksheet('SALARY');
  const people = [];

  for (let rowNumber = 2; rowNumber <= 120; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const code = getCellText(row.getCell(2).value);
    const name = getCellText(row.getCell(15).value);

    if (!code && !name) continue;
    if (name === 'Staff Name') continue;
    if (['MK TOP', 'TAIWAI', 'TW', 'MKTOP', 'TMA', 'MOS'].includes(name || '')) continue;
    if (['Below 200000', '200001-330000', '330001-430000', '430001-600000', 'OVER 600001'].includes(name || '')) continue;

    people.push({ rowNumber, code: code === 'N/A' ? null : code, name });
  }

  return people;
}

async function loadAttendancePeople() {
  const workbook = await loadWorkbook(ATTENDANCE_PATH);
  const sheet = workbook.getWorksheet('2026年4月');
  const people = [];

  for (let rowNumber = 3; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const code = getCellText(row.getCell(2).value);
    const name = getCellText(row.getCell(3).value);
    if (!code && !name) continue;
    if (name && name === code) continue;
    if (name && (/^\*/.test(name) || /hrs$/i.test(String(row.getCell(5).value ?? '')))) {
      if (!code) continue;
    }
    if (['MKTOP', 'MKCY', 'TW', 'TMA', 'MOS', '街霸', 'OFFICE', '解痛館'].includes(code || '')) continue;

    people.push({ rowNumber, code: code && code.trim() ? code : null, name });
  }

  return people;
}

function buildLookup(list, keyFn) {
  const map = new Map();
  for (const item of list) {
    const key = keyFn(item);
    if (!key) continue;
    const bucket = map.get(key) || [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

function collectAlternateNames(record, salaryByCode, salaryByName, attendanceByCode, attendanceByName) {
  const names = [];
  if (record.officialCode && !isConflictReason(record.reason) && salaryByCode.has(record.officialCode)) {
    names.push(...salaryByCode.get(record.officialCode).map((item) => item.name));
  }
  if (record.officialCode && !isConflictReason(record.reason) && attendanceByCode.has(record.officialCode)) {
    names.push(...attendanceByCode.get(record.officialCode).map((item) => item.name));
  }
  if (record.v6Name) {
    const normalized = simplifyName(record.v6Name);
    if (salaryByName.has(normalized)) {
      names.push(...salaryByName.get(normalized).map((item) => item.name));
    }
    if (attendanceByName.has(normalized)) {
      names.push(...attendanceByName.get(normalized).map((item) => item.name));
    }
  }
  return mergeUnique(names.filter(Boolean));
}

function chooseTargetEmployee(record, employeesByCode, employeesByTempCode, employeesByName) {
  if (isConflictReason(record.reason) && employeesByTempCode.has(record.tempCode)) {
    return employeesByTempCode.get(record.tempCode);
  }
  if (record.officialCode && employeesByCode.has(record.officialCode)) {
    return employeesByCode.get(record.officialCode);
  }
  if (employeesByTempCode.has(record.tempCode)) {
    return employeesByTempCode.get(record.tempCode);
  }

  const candidateNames = mergeUnique([
    record.v6Name,
    record.alias,
    record.employeeNameZh,
    record.employeeNameEn,
  ]).map(simplifyName);

  const matches = [];
  for (const nameKey of candidateNames) {
    if (employeesByName.has(nameKey)) {
      matches.push(...employeesByName.get(nameKey));
    }
  }

  return matches.length === 1 ? matches[0] : null;
}

function buildEmployeeUpdate(record, employee, alternateNames, codeTakenByOther) {
  const sections = [];
  const aliasParts = [record.alias, record.v6Name, ...alternateNames];
  const meaningfulAltNames = alternateNames.filter((name) => simplifyName(name) !== simplifyName(record.v6Name));
  const shouldFlagNa = !record.officialCode;
  const shouldFlagConflict = !!record.officialCode && (isConflictReason(record.reason) || codeTakenByOther);
  const shouldFlagReason = !!record.reason && (shouldFlagNa || shouldFlagConflict || meaningfulAltNames.length > 0);
  const shouldAppendNotes = shouldFlagNa || shouldFlagConflict || shouldFlagReason || meaningfulAltNames.length > 0;

  if (shouldFlagConflict && record.officialCode) {
    sections.push(`V6 official code conflict: ${record.officialCode}。`);
  } else if (shouldFlagNa) {
    sections.push('V6 official code: N/A。');
  } else if (record.officialCode && meaningfulAltNames.length > 0) {
    sections.push(`V6 official code: ${record.officialCode}。`);
  }

  if (record.officialCode) {
    if (isConflictReason(record.reason)) {
      sections.push(`V6 重複/未確認，暫保留技術編號。`);
    } else if (codeTakenByOther) {
      sections.push(`V6 official code ${record.officialCode} 已由其他員工使用，暫保留技術編號。`);
    }
  }

  if (shouldFlagReason) {
    sections.push(`V6 note: ${record.reason.replace(/[。]+$/u, '')}。`);
  }

  if (meaningfulAltNames.length) {
    sections.push(`Alternative names: ${meaningfulAltNames.join(' / ')}。`);
  }

  const update = {
    id: employee.id,
    employee_code:
      record.officialCode && !isConflictReason(record.reason) && !codeTakenByOther
        ? record.officialCode
        : employee.employee_code,
    employment_status: 'active',
    alias: meaningfulAltNames.length > 0 ? combineAlias(employee.alias, aliasParts) : employee.alias,
    name_zh: employee.name_zh || record.employeeNameZh || record.v6Name,
    name_en: employee.name_en || record.employeeNameEn || record.v6Name,
    notes: shouldAppendNotes ? appendNoteSections(employee.notes, sections) : employee.notes,
  };

  return update;
}

function matchPerson(person, employeesByCode, employeesByName) {
  if (person.code && employeesByCode.has(person.code)) {
    return { kind: 'code', employee: employeesByCode.get(person.code) };
  }

  const normalizedName = simplifyName(person.name);
  const nameMatches = normalizedName ? employeesByName.get(normalizedName) || [] : [];
  if (nameMatches.length === 1) {
    return { kind: 'name', employee: nameMatches[0] };
  }
  if (nameMatches.length > 1) {
    return { kind: 'ambiguous', matches: nameMatches };
  }
  return { kind: 'missing' };
}

function isRealAttendanceRow(person) {
  if (!person.name && !person.code) return false;
  if (person.name && /^\*/.test(person.name)) return false;
  return true;
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const env = parseEnv(await fs.readFile(ENV_PATH, 'utf8'));
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const [{ data: employees, error }, v6Records, salaryPeople, attendancePeople] = await Promise.all([
    supabase.from('employees').select('*').order('employee_code'),
    loadV6Records(),
    loadSalaryPeople(),
    loadAttendancePeople(),
  ]);

  if (error) throw error;

  const backupPath = path.join(BACKUP_DIR, `employees-before-v6-apr-2026-${STAMP}.json`);
  await fs.writeFile(backupPath, JSON.stringify(employees, null, 2));

  const employeesByCode = new Map(employees.map((employee) => [employee.employee_code, employee]));
  const employeesByTempCode = new Map(
    employees
      .filter((employee) => String(employee.employee_code).startsWith('V6TMP'))
      .map((employee) => [employee.employee_code, employee]),
  );
  const employeesByName = buildLookup(
    employees.flatMap((employee) => [
      { key: simplifyName(employee.alias), employee },
      { key: simplifyName(employee.name_zh), employee },
      { key: simplifyName(employee.name_en), employee },
    ]),
    (item) => item.key,
  );

  const foldedEmployeesByName = new Map(
    [...employeesByName.entries()].map(([key, rows]) => [key, rows.map((row) => row.employee)]),
  );

  const salaryByCode = buildLookup(salaryPeople, (item) => item.code);
  const salaryByName = buildLookup(salaryPeople, (item) => simplifyName(item.name));
  const attendanceByCode = buildLookup(attendancePeople, (item) => item.code);
  const attendanceByName = buildLookup(attendancePeople, (item) => simplifyName(item.name));

  const updatePlan = [];
  const unresolvedV6 = [];
  const matchedEmployeeIds = new Set();

  for (const record of v6Records) {
    const employee = chooseTargetEmployee(record, employeesByCode, employeesByTempCode, foldedEmployeesByName);
    if (!employee) {
      unresolvedV6.push({
        v6Row: record.v6Row,
        officialCode: record.officialCode,
        tempCode: record.tempCode,
        v6Name: record.v6Name,
        reason: record.reason || 'No matching employee row found in database',
      });
      continue;
    }

    matchedEmployeeIds.add(employee.id);

    const codeTakenByOther =
      !!record.officialCode &&
      employeesByCode.has(record.officialCode) &&
      employeesByCode.get(record.officialCode).id !== employee.id;

    const alternateNames = collectAlternateNames(
      record,
      salaryByCode,
      salaryByName,
      attendanceByCode,
      attendanceByName,
    );

    const update = buildEmployeeUpdate(record, employee, alternateNames, codeTakenByOther);
    const changedFields = Object.keys(update).filter((key) => key !== 'id' && update[key] !== employee[key]);

    if (changedFields.length) {
      updatePlan.push({
        source: {
          v6Row: record.v6Row,
          officialCode: record.officialCode,
          tempCode: record.tempCode,
          v6Name: record.v6Name,
        },
        employeeId: employee.id,
        before: {
          employee_code: employee.employee_code,
          name_zh: employee.name_zh,
          name_en: employee.name_en,
          alias: employee.alias,
          notes: employee.notes,
          employment_status: employee.employment_status,
        },
        after: update,
        changedFields,
      });
    }
  }

  for (const employee of employees) {
    if (matchedEmployeeIds.has(employee.id)) {
      continue;
    }

    const resignedNotes = appendNoteSections(employee.notes, [
      'Not found in current V6 authority list; set to resigned.',
    ]);

    const after = {
      id: employee.id,
      employee_code: employee.employee_code,
      employment_status: 'resigned',
      alias: employee.alias,
      name_zh: employee.name_zh,
      name_en: employee.name_en,
      notes: resignedNotes,
    };

    const changedFields = Object.keys(after).filter((key) => key !== 'id' && after[key] !== employee[key]);
    if (changedFields.length) {
      updatePlan.push({
        source: {
          v6Row: null,
          officialCode: null,
          tempCode: null,
          v6Name: null,
        },
        employeeId: employee.id,
        before: {
          employee_code: employee.employee_code,
          name_zh: employee.name_zh,
          name_en: employee.name_en,
          alias: employee.alias,
          notes: employee.notes,
          employment_status: employee.employment_status,
        },
        after,
        changedFields,
      });
    }
  }

  const appliedUpdates = [];
  if (APPLY) {
    for (const planItem of updatePlan) {
      const payload = {
        employee_code: planItem.after.employee_code,
        employment_status: planItem.after.employment_status,
        name_zh: planItem.after.name_zh,
        name_en: planItem.after.name_en,
        alias: planItem.after.alias,
        notes: planItem.after.notes,
      };

      const { error: updateError } = await supabase.from('employees').update(payload).eq('id', planItem.employeeId);
      if (updateError) {
        throw new Error(`Failed to update ${planItem.employeeId}: ${updateError.message}`);
      }
      appliedUpdates.push({ employeeId: planItem.employeeId, employee_code: payload.employee_code });
    }
  }

  const projectedEmployees = new Map(employees.map((employee) => [employee.id, employee]));
  for (const planItem of updatePlan) {
    projectedEmployees.set(planItem.employeeId, {
      ...projectedEmployees.get(planItem.employeeId),
      ...planItem.after,
    });
  }

  const projectedByCode = new Map([...projectedEmployees.values()].map((employee) => [employee.employee_code, employee]));
  const projectedByName = buildLookup(
    [...projectedEmployees.values()].flatMap((employee) => [
      { key: simplifyName(employee.alias), employee },
      { key: simplifyName(employee.name_zh), employee },
      { key: simplifyName(employee.name_en), employee },
    ]),
    (item) => item.key,
  );
  const foldedProjectedByName = new Map(
    [...projectedByName.entries()].map(([key, rows]) => [key, rows.map((row) => row.employee)]),
  );

  const salaryCheck = salaryPeople.map((person) => ({ ...person, match: matchPerson(person, projectedByCode, foldedProjectedByName) }));
  const attendanceCheck = attendancePeople
    .filter(isRealAttendanceRow)
    .map((person) => ({ ...person, match: matchPerson(person, projectedByCode, foldedProjectedByName) }));

  const report = {
    generatedAt: NOW.toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    backupPath,
    counts: {
      dbEmployees: employees.length,
      v6Records: v6Records.length,
      plannedUpdates: updatePlan.length,
      unresolvedV6: unresolvedV6.length,
      appliedUpdates: appliedUpdates.length,
      salaryRowsChecked: salaryCheck.length,
      attendanceRowsChecked: attendanceCheck.length,
    },
    updatePlan,
    unresolvedV6,
    salarySummary: {
      missing: salaryCheck.filter((item) => item.match.kind === 'missing'),
      ambiguous: salaryCheck
        .filter((item) => item.match.kind === 'ambiguous')
        .map((item) => ({ rowNumber: item.rowNumber, code: item.code, name: item.name })),
    },
    attendanceSummary: {
      missing: attendanceCheck.filter((item) => item.match.kind === 'missing'),
      ambiguous: attendanceCheck
        .filter((item) => item.match.kind === 'ambiguous')
        .map((item) => ({ rowNumber: item.rowNumber, code: item.code, name: item.name })),
    },
  };

  const reportPath = path.join(REPORT_DIR, `v6-apr-2026-reconciliation-${STAMP}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    mode: report.mode,
    reportPath,
    backupPath,
    counts: report.counts,
    salaryMissing: report.salarySummary.missing.length,
    attendanceMissing: report.attendanceSummary.missing.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
