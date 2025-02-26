-- Habilitar RLS em todas as tabelas
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para appointments
CREATE POLICY "Appointments são visíveis apenas para o negócio" ON appointments
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = business_id
  )
);

-- Política para businesses
CREATE POLICY "Businesses são visíveis apenas para o dono" ON businesses
FOR ALL USING (
  auth.uid() = owner_id
);

-- Política para professionals
CREATE POLICY "Professionals são visíveis apenas para o negócio" ON professionals
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = business_id
  )
);

-- Política para services
CREATE POLICY "Services são visíveis apenas para o negócio" ON services
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = business_id
  )
);

-- Política para customers
CREATE POLICY "Customers são visíveis apenas para o negócio" ON customers
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = business_id
  )
);

-- Política para subscriptions
CREATE POLICY "Subscriptions são visíveis apenas para o dono" ON subscriptions
FOR ALL USING (
  auth.uid() = user_id
);

-- Funções auxiliares de segurança
CREATE OR REPLACE FUNCTION check_business_owner(business_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id 
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para validar operações em appointments
CREATE OR REPLACE FUNCTION validate_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o profissional pertence ao negócio
  IF NOT EXISTS (
    SELECT 1 FROM professionals 
    WHERE id = NEW.professional_id 
    AND business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION 'Profissional inválido';
  END IF;

  -- Verificar se o serviço pertence ao negócio
  IF NOT EXISTS (
    SELECT 1 FROM services 
    WHERE id = NEW.service_id 
    AND business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION 'Serviço inválido';
  END IF;

  -- Verificar conflito de horários
  IF EXISTS (
    SELECT 1 FROM appointments 
    WHERE professional_id = NEW.professional_id
    AND status = 'scheduled'
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Conflito de horário';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_validation
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment();
