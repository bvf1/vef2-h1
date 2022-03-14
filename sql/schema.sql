-- TODO ætti e.t.v. að vera í sér scriptu svo við droppum ekki „óvart“

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;

-- Allir foreign key constraints eru skilgreindir með „ON DELETE CASCADE“ þ.a. þeim færslum sem
-- vísað er í verður *eytt* þegar gögnum sem vísa í þær er eytt

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(128) UNIQUE NOT NULL
);

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
  url VARCHAR(255),
  constraint category FOREIGN KEY (category) REFERENCES categories (id)
);

CREATE TABLE carts (
  id uuid PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id uuid PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(128) NOT NULL
);

CREATE TABLE orderLines (
  constraint product FOREIGN KEY (product) REFERENCES products (id),
  constraint cart FOREIGN KEY (cart) REFERENCES carts (id),
  quantity SERIAL
);

create type orderState as enum('NEW', 'PREPARE', 'COOKING' 'READY', 'FINISHED');

CREATE TABLE orderStates (
  constraint order FOREIGN KEY (order) REFERENCES orders (id),
  stateOfOrder orderState DEFAULT 'NEW',
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);