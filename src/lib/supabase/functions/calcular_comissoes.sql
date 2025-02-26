CREATE OR REPLACE FUNCTION calcular_comissoes(
  data_fechamento timestamp,
  business_id uuid
) RETURNS void AS $$
DECLARE
  profissional RECORD;
  valor_comissao numeric;
  agendamentos_ids uuid[];
BEGIN
  -- Para cada profissional ativo
  FOR profissional IN 
    SELECT id, commission_rate 
    FROM professionals 
    WHERE business_id = $2 AND active = true
  LOOP
    -- Calcular valor total das comissões do período
    SELECT 
      COALESCE(SUM(s.price * (p.commission_rate / 100.0)), 0) as total,
      ARRAY_AGG(a.id) as ids
    INTO valor_comissao, agendamentos_ids
    FROM appointments a
    INNER JOIN services s ON s.id = a.service_id
    INNER JOIN professionals p ON p.id = a.professional_id
    WHERE 
      a.professional_id = profissional.id
      AND a.business_id = $2
      AND a.status = 'completed'
      AND a.start_time <= $1
      AND NOT EXISTS (
        SELECT 1 
        FROM comissoes_pagamentos cp
        WHERE cp.professional_id = a.professional_id
        AND a.id = ANY(cp.appointments)
      );

    -- Se houver comissão a pagar
    IF valor_comissao > 0 THEN
      -- Inserir registro de pagamento
      INSERT INTO comissoes_pagamentos (
        business_id,
        professional_id,
        valor,
        data_fechamento,
        status,
        appointments
      ) VALUES (
        $2,
        profissional.id,
        valor_comissao,
        $1,
        'pendente',
        agendamentos_ids
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
