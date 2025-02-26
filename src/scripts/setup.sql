-- Criar tabelas
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  endereco TEXT NOT NULL,
  business_type TEXT,
  logo_url TEXT,
  theme JSONB,
  notification_settings JSONB,
  payment_settings JSONB,
  business_hours JSONB,
  tax_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  bio TEXT,
  profile_image TEXT,
  services TEXT[],
  schedule JSONB,
  commission_rate FLOAT,
  rating FLOAT,
  total_reviews INTEGER DEFAULT 0,
  skills TEXT[],
  certificates TEXT[],
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_nascimento DATE,
  profile_image TEXT,
  address JSONB,
  preferencias TEXT[],
  favorite_services TEXT[],
  last_visit TIMESTAMPTZ,
  total_visits INTEGER DEFAULT 0,
  lifetime_value FLOAT DEFAULT 0,
  referral_source TEXT,
  marketing_preferences JSONB,
  notas TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor FLOAT NOT NULL,
  duracao INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  comissao FLOAT NOT NULL,
  image_url TEXT,
  preparation_time INTEGER,
  cleanup_time INTEGER,
  materials_cost FLOAT,
  minimum_notice INTEGER,
  cancellation_policy TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  client_id UUID REFERENCES clients(id),
  service_id UUID REFERENCES services(id),
  professional_id UUID REFERENCES professionals(id),
  data TIMESTAMPTZ NOT NULL,
  valor FLOAT NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT,
  payment_method TEXT,
  discount_amount FLOAT,
  tax_amount FLOAT,
  total_amount FLOAT,
  notes TEXT,
  rating INTEGER,
  review TEXT,
  review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  cost FLOAT,
  stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 5,
  brand TEXT,
  supplier TEXT,
  category TEXT,
  image_url TEXT,
  barcode TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  product_id UUID REFERENCES products(id),
  client_id UUID REFERENCES clients(id),
  quantity INTEGER NOT NULL,
  unit_price FLOAT NOT NULL,
  total_amount FLOAT NOT NULL,
  payment_method TEXT,
  payment_status TEXT,
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  professional_id UUID REFERENCES professionals(id),
  appointment_id UUID UNIQUE REFERENCES appointments(id),
  service_id UUID REFERENCES services(id),
  amount FLOAT NOT NULL,
  percentage FLOAT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  category TEXT NOT NULL,
  description TEXT,
  amount FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_interval TEXT,
  next_due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  type TEXT NOT NULL,
  target FLOAT NOT NULL,
  current FLOAT DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  appointment_id UUID UNIQUE REFERENCES appointments(id),
  type TEXT NOT NULL,
  amount FLOAT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metrics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  date TIMESTAMPTZ NOT NULL,
  total_appointments INTEGER NOT NULL,
  total_revenue FLOAT NOT NULL,
  average_ticket FLOAT NOT NULL,
  conversion_rate FLOAT NOT NULL,
  customer_satisfaction FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_settings(id),
  integration TEXT NOT NULL,
  event TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_professionals_business_id ON professionals(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_data ON appointments(data);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_business_id ON product_sales(business_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_product_id ON product_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_client_id ON product_sales(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_business_id ON commissions(business_id);
CREATE INDEX IF NOT EXISTS idx_commissions_professional_id ON commissions(professional_id);
CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_goals_business_id ON goals(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_business_id ON metrics_history(business_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_business_id ON integration_logs(business_id);

-- Criar funções
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_product_sales_updated_at
  BEFORE UPDATE ON product_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_metrics_history_updated_at
  BEFORE UPDATE ON metrics_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Criar políticas RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Acesso total para usuários autenticados" ON business_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON professionals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON product_sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON commissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON expenses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON goals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON metrics_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados" ON integration_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
