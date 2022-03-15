DROP TABLE IF EXISTS orderLines;
DROP TABLE IF EXISTS orderStates;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TYPE IF EXISTS orderState;

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(128) UNIQUE NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  category INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
  productID INTEGER NOT NULL,
  cardID UUID NOT NULL,
  constraint productID FOREIGN KEY (productID) REFERENCES products (id),
  constraint cardID FOREIGN KEY (cardID) REFERENCES carts (id),
  quantity SERIAL
);

CREATE TYPE orderState AS ENUM('NEW', 'PREPARE', 'COOKING', 'READY', 'FINISHED');

CREATE TABLE orderStates (
  orderID UUID NOT NULL,
  constraint orderID FOREIGN KEY (orderID) REFERENCES orders (id),
  stateOfOrder orderState DEFAULT 'NEW',
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);
