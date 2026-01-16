-- 1. SEED FELLOWSHIPS (Jumuiya)
-- Using hardcoded UUIDs here for the seed script to allow referencing in donors insert.
-- In a real app, you would let the DB generate them.

INSERT INTO public.fellowships (id, name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Paradiso'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Jerusalemu B'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Paradiso C'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Kaanani'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Sayuni'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Betania'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Galilaya');

-- 2. SEED DONORS (Wahumini)
-- Mapping to the Fellowship IDs created above
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
('110', 'Joyce Temu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'), -- Kaanani
('111', 'Frank Mboya', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('112', 'Sarah Swai', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'), -- Paradiso C
('113', 'Michael Shirima', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'), -- Jerusalemu B
('114', 'Beatrice Tarimo', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
('115', 'Godfrey Moshi', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('116', 'Rose Minja', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'),
('117', 'Emmanuel Njau', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('118', 'Irene Chuwa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('119', 'Richard Kaaya', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('120', 'Elizabeth Mariki', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
('121', 'Samuel Ayo', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
('122', 'Anna Urio', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('123', 'Josephat Mandara', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'),
('124', 'Catherine Malya', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('125', 'Daniel Mrema', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('126', 'Lightness Pallangyo', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('127', 'George Sumari', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
('128', 'Happy Kwayu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
('129', 'Charles Lema', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('130', 'Faith Nnko', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17');

-- 3. SEED REGULAR OFFERINGS
INSERT INTO public.regular_offerings (service_date, service_type, amount) VALUES
('2024-01-07', 'Ibada ya Kwanza', 350000.00),
('2024-01-07', 'Ibada ya Pili', 420000.00),
('2024-01-14', 'Ibada ya Kwanza', 310000.00),
('2024-01-14', 'Ibada ya Pili', 450000.00),
('2024-01-21', 'Ibada ya Kwanza', 380000.00),
('2024-01-21', 'Ibada ya Pili', 410000.00),
('2024-01-28', 'Ibada ya Kwanza', 330000.00),
('2024-01-28', 'Ibada ya Pili', 440000.00),
('2024-02-04', 'Ibada ya Kwanza', 360000.00),
('2024-02-04', 'Ibada ya Pili', 430000.00),
('2024-02-11', 'Ibada ya Kwanza', 290000.00),
('2024-02-11', 'Ibada ya Pili', 400000.00),
('2024-02-18', 'Ibada ya Kwanza', 370000.00),
('2024-02-18', 'Ibada ya Pili', 460000.00),
('2024-02-25', 'Ibada ya Kwanza', 340000.00),
('2024-02-25', 'Ibada ya Pili', 425000.00),
('2024-03-03', 'Ibada ya Kwanza', 390000.00),
('2024-03-03', 'Ibada ya Pili', 470000.00),
('2024-03-10', 'Ibada ya Kwanza', 320000.00),
('2024-03-10', 'Ibada ya Pili', 415000.00),
('2024-03-17', 'Ibada ya Kwanza', 355000.00),
('2024-03-17', 'Ibada ya Pili', 445000.00),
('2024-03-24', 'Ibada ya Kwanza', 365000.00),
('2024-03-24', 'Ibada ya Pili', 435000.00),
('2024-03-31', 'Ibada Maalum', 850000.00),
('2024-03-31', 'Ibada ya Kwanza', 400000.00),
('2024-04-07', 'Ibada ya Kwanza', 315000.00),
('2024-04-07', 'Ibada ya Pili', 410000.00),
('2024-04-14', 'Ibada ya Kwanza', 345000.00),
('2024-04-14', 'Ibada ya Pili', 420000.00);

-- 4. SEED EXPENSES
INSERT INTO public.expenses (expense_date, description, amount) VALUES
('2024-01-05', 'Bili ya Umeme (Luku)', 50000.00),
('2024-01-08', 'Vifaa vya Usafi', 25000.00),
('2024-01-12', 'Posho ya Mchungaji Msaidizi', 150000.00),
('2024-01-15', 'Mafuta ya Generator', 40000.00),
('2024-01-20', 'Matengenezo ya Bomba', 35000.00),
('2024-01-25', 'Bili ya Maji', 18000.00),
('2024-01-30', 'Posho ya Walimu wa Sunday School', 100000.00),
('2024-02-02', 'Bili ya Umeme (Luku)', 45000.00),
('2024-02-05', 'Karatasi na Vifaa vya Ofisi', 30000.00),
('2024-02-10', 'Ukarabati wa Viti', 75000.00),
('2024-02-14', 'Chai na Vitafunwa (Wageni)', 20000.00),
('2024-02-18', 'Posho ya Mhubiri Mgeni', 100000.00),
('2024-02-22', 'Mafuta ya Generator', 45000.00),
('2024-02-28', 'Bili ya Maji', 22000.00),
('2024-03-01', 'Bili ya Umeme (Luku)', 55000.00),
('2024-03-05', 'Vifaa vya Usafi', 28000.00),
('2024-03-08', 'Mambo ya Kijamii (Msiba)', 50000.00),
('2024-03-12', 'Malipo ya Mlinzi', 120000.00),
('2024-03-15', 'Matengenezo ya Kinanda', 80000.00),
('2024-03-20', 'Msaada kwa Wahitaji', 150000.00),
('2024-03-25', 'Maua ya Madhabahuni', 15000.00),
('2024-03-28', 'Bili ya Maji', 19000.00),
('2024-03-30', 'Maandalizi ya Pasaka', 300000.00),
('2024-04-02', 'Bili ya Umeme (Luku)', 48000.00),
('2024-04-05', 'Usafiri wa Vijana', 60000.00),
('2024-04-08', 'Chaki na Vifaa vya Sunday School', 12000.00),
('2024-04-10', 'Malipo ya Mlinzi', 120000.00),
('2024-04-12', 'Mafuta ya Generator', 38000.00),
('2024-04-15', 'Matengenezo ya Taa', 25000.00),
('2024-04-16', 'Chakula cha Viongozi', 45000.00);

-- 5. SEED ENVELOPE OFFERINGS
INSERT INTO public.envelope_offerings (offering_date, envelope_number, amount) VALUES
('2024-01-07', '101', 10000.00),
('2024-01-07', '105', 20000.00),
('2024-01-07', '110', 5000.00),
('2024-01-14', '102', 15000.00),
('2024-01-14', '115', 50000.00),
('2024-01-14', '120', 10000.00),
('2024-01-21', '103', 25000.00),
('2024-01-21', '108', 7000.00),
('2024-01-21', '125', 10000.00),
('2024-01-28', '104', 30000.00),
('2024-01-28', '112', 12000.00),
('2024-01-28', '130', 5000.00),
('2024-02-04', '106', 20000.00),
('2024-02-04', '118', 15000.00),
('2024-02-04', '101', 10000.00),
('2024-02-11', '109', 100000.00),
('2024-02-11', '114', 8000.00),
('2024-02-11', '122', 10000.00),
('2024-02-18', '111', 25000.00),
('2024-02-18', '116', 6000.00),
('2024-02-18', '127', 15000.00),
('2024-02-25', '113', 40000.00),
('2024-02-25', '119', 20000.00),
('2024-02-25', '105', 10000.00),
('2024-03-03', '117', 30000.00),
('2024-03-03', '123', 5000.00),
('2024-03-03', '128', 10000.00),
('2024-03-10', '121', 15000.00),
('2024-03-10', '126', 8000.00),
('2024-03-10', '129', 50000.00);