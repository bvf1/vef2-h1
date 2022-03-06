-- TODO ætti e.t.v. að vera í sér scriptu svo við droppum ekki „óvart“

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;

-- Allir foreign key constraints eru skilgreindir með „ON DELETE CASCADE“ þ.a. þeim færslum sem
-- vísað er í verður *eytt* þegar gögnum sem vísa í þær er eytt

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  air_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  in_production BOOLEAN DEFAULT false,
  tagline TEXT,
  image VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(2) NOT NULL,
  network VARCHAR(128),
  url VARCHAR(255)
);

