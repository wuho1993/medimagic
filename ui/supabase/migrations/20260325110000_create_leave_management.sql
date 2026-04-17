-- Leave Management System
-- Supports 12 leave types per HK labour ordinance + company specific types
-- 3-level approval workflow: direct supervisor → dept/branch manager → HR

-- Leave types enum
DO $$ BEGIN
  CREATE TYPE leave_type AS ENUM (
    'annual',           -- 年假
    'sick',             -- 有薪病假
    'sick_no_pay',      -- 無薪病假
    'marriage',         -- 婚假
    'special',          -- 特別假期
    'funeral',          -- 喪假
    'jury',             -- 陪審員假
    'no_pay',           -- 無薪假
    'maternity',        -- 產假
    'paternity',        -- 侍產假
    'compensation',     -- 補假
    'injury',           -- 工傷假
    'birthday',         -- 生日假
    'reward'            -- 有薪獎勵假
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Leave request status
DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM (
    'draft',
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Leave balances per employee per year
CREATE TABLE IF NOT EXISTS leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  year integer NOT NULL,
  entitled_days numeric NOT NULL DEFAULT 0,
  used_days numeric NOT NULL DEFAULT 0,
  pending_days numeric NOT NULL DEFAULT 0,
  carried_over numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, leave_type, year)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON leave_balances (employee_id, year);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL,
  is_half_day boolean NOT NULL DEFAULT false,
  half_day_period text CHECK (half_day_period IS NULL OR half_day_period IN ('am', 'pm')),
  reason text,
  status leave_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests (start_date, end_date);

-- Seed leave balances for existing active employees (2026)
INSERT INTO leave_balances (employee_id, leave_type, year, entitled_days, used_days, pending_days, carried_over)
SELECT
  e.id,
  lt.leave_type,
  2026,
  CASE lt.leave_type
    WHEN 'annual' THEN COALESCE(e.annual_leave_days, 7)
    WHEN 'sick' THEN 12   -- HK statutory: 2 paid sick days per month in first year
    WHEN 'birthday' THEN 1
    WHEN 'compensation' THEN 0
    ELSE 0
  END,
  0, 0, 0
FROM employees e
CROSS JOIN (
  VALUES
    ('annual'::leave_type),
    ('sick'::leave_type),
    ('birthday'::leave_type),
    ('compensation'::leave_type),
    ('no_pay'::leave_type)
) AS lt(leave_type)
WHERE e.employment_status = 'active'
ON CONFLICT (employee_id, leave_type, year) DO NOTHING;
