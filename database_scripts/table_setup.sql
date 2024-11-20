-- CREATE TABLE app_users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(32) NOT NULL,
--     email VARCHAR(255) NOT NULL,
--     password_hash CHAR(60) NOT NULL,
--     balance INT NOT NULL
-- );

-- COMMENT ON COLUMN app_users.balance IS 'The users paper balance';

CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) UNIQUE NOT NULL
);

-- CREATE TABLE owned_stock (
--     user_id INTEGER NOT NULL,
--     FOREIGN KEY (app_users) REFERENCES app_users(id),
--
--     stock_id INTEGER NOT NULL,
--     FOREIGN KEY (stock) REFERENCES stock(id),
--
--     purchased_on TIMESTAMP NOT NULL
-- );

CREATE TABLE source_origin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    base_url TEXT NOT NULL
);

CREATE TABLE source (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,

    source_origin_id INTEGER NOT NULL,
    FOREIGN KEY (source_origin_id) REFERENCES source_origin(id),

    predicted_sentiment_score FLOAT4 NULL,
    CONSTRAINT sentiment CHECK (predicted_sentiment_score IS NULL OR (predicted_sentiment_score <= 1 AND predicted_sentiment_score >= -1)),

    predicted_opinion_score FLOAT4 NULL,
    CONSTRAINT opinion CHECK (predicted_opinion_score IS NULL OR (predicted_opinion_score <= 1 AND predicted_opinion_score >= 0)),

    CONSTRAINT sentiment_opinion CHECK (predicted_sentiment_score IS NULL OR predicted_opinion_score IS NULL OR predicted_sentiment_score IS NOT NULL AND predicted_opinion_score IS NOT NULL)
);

CREATE TABLE stocks_source (
    stock_id INTEGER NOT NULL,
    FOREIGN KEY (stock_id) REFERENCES stock(id),

    source_id INTEGER NOT NULL,
    FOREIGN KEY (source_id) REFERENCES source(id)
);

COMMENT ON COLUMN source.predicted_sentiment_score IS 'A number between -1 and 1';
COMMENT ON COLUMN source.predicted_opinion_score IS 'A number between 0 and 1';