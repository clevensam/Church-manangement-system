-- 0. SEED USERS (Using public.users table with pgcrypto)

INSERT INTO public.users (id, email, password_hash, full_name, role, must_change_password) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'admin@kanisa.or.tz', crypt('admin123', gen_salt('bf')), 'System Admin', 'admin', FALSE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'mhasibu@kanisa.or.tz', crypt('admin123', gen_salt('bf')), 'Mhasibu Mkuu', 'accountant', FALSE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'kiongozi@kanisa.or.tz', crypt('admin123', gen_salt('bf')), 'Kiongozi Jumuiya', 'jumuiya_leader', FALSE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'mchungaji@kanisa.or.tz', crypt('admin123', gen_salt('bf')), 'Mchungaji Kiongozi', 'pastor', FALSE)
ON CONFLICT (email) DO NOTHING;

-- 1. SEED FELLOWSHIPS (Jumuiya)
INSERT INTO public.fellowships (id, name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Paradiso'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Jerusalemu B'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Paradiso C'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Kaanani'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Sayuni'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Betania'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Galilaya')
ON CONFLICT DO NOTHING;

-- 2. SEED DONORS (Wahumini)
INSERT INTO public.donors (envelope_number, donor_name, fellowship_id) VALUES
('101', 'Baraka John', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), -- Paradiso
('102', 'Amina Juma', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'), -- Kaanani
('103', 'Peter Joseph', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'), -- Jerusalemu B
('104', 'Grace Mushi', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), -- Paradiso
('105', 'David Mollel', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'), -- Sayuni
('106', 'Esther Massawe', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'), -- Kaanani
('107', 'John Kavishe', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'), -- Galilaya
('108', 'Mary Lyimo', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'), -- Paradiso C
('109', 'Elias Kimaro', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'), -- Betania
('110', 'Joyce Temu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14')
ON CONFLICT DO NOTHING;

-- 3. SEED REGULAR OFFERINGS
INSERT INTO public.regular_offerings (service_date, service_type, amount) VALUES
('2024-01-07', 'Ibada ya Kwanza', 350000.00),
('2024-01-07', 'Ibada ya Pili', 420000.00),
('2024-01-14', 'Ibada ya Kwanza', 310000.00),
('2024-01-14', 'Ibada ya Pili', 450000.00)
ON CONFLICT DO NOTHING;

-- 4. SEED EXPENSES
INSERT INTO public.expenses (expense_date, description, amount) VALUES
('2024-01-05', 'Bili ya Umeme (Luku)', 50000.00),
('2024-01-08', 'Vifaa vya Usafi', 25000.00),
('2024-01-12', 'Posho ya Mchungaji Msaidizi', 150000.00)
ON CONFLICT DO NOTHING;

-- 5. SEED ENVELOPE OFFERINGS
INSERT INTO public.envelope_offerings (offering_date, envelope_number, amount, bahasha_type) VALUES
('2024-01-07', '101', 10000.00, 'Ahadi'),
('2024-01-07', '105', 20000.00, 'Jengo'),
('2024-01-07', '110', 5000.00, 'Ahadi')
ON CONFLICT DO NOTHING;