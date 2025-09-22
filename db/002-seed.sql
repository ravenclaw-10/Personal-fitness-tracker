INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@pft.local', '$2b$10$EIXh3v1g2K6oeq0kzR3YQO4r6k2Zxw0t4Kjv5Y/6u7a8f9b0c1d2', 'Admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, is_global) VALUES ('Food', true) ON CONFLICT DO NOTHING;
INSERT INTO categories (name, is_global) VALUES ('Transport', true) ON CONFLICT DO NOTHING;
INSERT INTO categories (name, is_global) VALUES ('Entertainment', true) ON CONFLICT DO NOTHING;

INSERT INTO transactions (user_id, amount, type, category_id, description, occurred_at)
SELECT u.id, 500, 'expense', c.id, 'Lunch', current_date - interval '2 days'
FROM users u, categories c WHERE u.email='admin@pft.local' AND c.name='Food'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (user_id, amount, type, category_id, description, occurred_at)
SELECT u.id, 2000, 'income', NULL, 'Salary', current_date - interval '15 days'
FROM users u WHERE u.email='admin@pft.local'
ON CONFLICT DO NOTHING;
