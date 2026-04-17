# Medi Magic HRMS Implementation Todo

## Phase 1 Foundation

- [x] Add companies, branches, departments foundation tables
- [x] Extend employees with company / branch / department / manager / contract fields
- [x] Add employee documents and visa tracking tables
- [x] Expand employee salary settings skeleton
- [ ] Backfill current production data into new foundation tables
- [ ] Apply Supabase migration to remote project

## Phase 2 Intranet Alignment

- [ ] Upgrade People page filters to company / branch / department
- [ ] Upgrade Employee Profile to include company / branch / department sections
- [ ] Add documents tab to Employee Profile
- [ ] Add visa reminder section to Employee Profile
- [ ] Expand salary tab to match payroll settings in plan
- [ ] Add commission settings tab

## Phase 3 System Management

- [x] Add companies / branches / departments to system management master data
- [ ] Add leave policy management
- [ ] Add payroll item management
- [ ] Add commission rule management
- [ ] Add MPF / tax parameter management
- [ ] Add approval workflow management
- [ ] Add audit log viewer

## Phase 4 Transaction Modules

- [ ] Build leave types, leave balances, leave requests, approvals
- [ ] Build attendance imports and attendance records
- [ ] Build roster / shift skeleton
- [ ] Build payroll periods, payroll inputs, payroll runs, payroll results
- [ ] Build claims and claims approval flow

## Phase 5 Compliance And Output

- [ ] MPF calculation module
- [ ] IR56 data model and output flow
- [ ] Payslip PDF generation
- [ ] BI report builder and export