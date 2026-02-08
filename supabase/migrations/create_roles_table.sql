
-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'bg-slate-100 text-slate-700 border-slate-200',
    perms TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Enable RLS and add policies if needed
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read for roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow full access for authenticated" ON roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert initial roles
INSERT INTO roles (name, description, perms, color)
VALUES 
('Super Admin', 'Akses penuh ke seluruh sistem pusat dan cabang.', ARRAY['dash_view', 'prod_manage', 'stock_manage', 'pos_access', 'trans_history', 'emp_manage', 'report_view', 'settings'], 'bg-red-100 text-red-700 border-red-200'),
('Admin Cabang', 'Mengelola operasional cabang tertentu.', ARRAY['dash_view', 'prod_manage', 'pos_access', 'trans_history', 'emp_manage'], 'bg-blue-100 text-blue-700 border-blue-200'),
('Kasir', 'Fokus pada operasional POS dan transaksi harian.', ARRAY['pos_access', 'trans_history'], 'bg-green-100 text-green-700 border-green-200')
ON CONFLICT (name) DO NOTHING;
