CREATE TABLE IF NOT EXISTS qr_encoding_phases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  matrix_data JSONB NOT NULL,
  "order" SERIAL NOT NULL
);
