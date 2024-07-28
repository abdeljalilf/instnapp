INSERT INTO users (username, password, role) VALUES ('admin', 'admin_password_hash', 'admin');
INSERT INTO users (username, password, role) VALUES ('reception', 'reception_password_hash', 'reception');
SELECT * FROM analyses WHERE id = 1;
SELECT * FROM echantillons WHERE id = (SELECT echantillon_id FROM analyses WHERE id = 1);
SELECT * FROM elementsdinteret WHERE analysis_id = 1;
