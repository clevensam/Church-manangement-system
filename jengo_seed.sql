-- Insert initial pledges for existing donors
-- Assumes donors with these envelope numbers exist (from mock_data.sql)

INSERT INTO public.jengo_pledges (envelope_number, amount) VALUES
('101', 500000.00),  -- Baraka John: Ahadi 500k
('102', 250000.00),  -- Amina Juma: Ahadi 250k
('103', 1000000.00), -- Peter Joseph: Ahadi 1M
('105', 150000.00),  -- David Mollel: Ahadi 150k
('107', 300000.00)   -- John Kavishe: Ahadi 300k
ON CONFLICT (envelope_number) 
DO UPDATE SET amount = EXCLUDED.amount;

-- Add some specific Jengo transactions to envelope_offerings to show progress
-- Note: Check if these exist first or just insert. 
-- Since envelope_offerings ID is UUID, we just insert new rows for demonstration.

INSERT INTO public.envelope_offerings (offering_date, envelope_number, amount, bahasha_type) VALUES
('2024-01-14', '101', 50000.00, 'Jengo'),
('2024-01-21', '101', 50000.00, 'Jengo'),
('2024-01-14', '105', 20000.00, 'Jengo'),
('2024-01-14', '103', 100000.00, 'Jengo')
;