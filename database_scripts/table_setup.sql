CREATE OR REPLACE TABLE user (
    id INTEGER UNSIGNED PRIMARY KEY,
    username VARCHAR(32) NOT NULL,
    password VARCHAR(100) NOT NULL, -- TODO: Password format
    balance INT NOT NULL COMMENT 'The user\'s paper balance'
);

CREATE OR REPLACE TABLE stock (
    id INTEGER UNSIGNED PRIMARY KEY,
    abbreviation VARCHAR(10) UNIQUE NOT NULL
);


CREATE OR REPLACE TABLE owned_stock (
    user INTEGER UNSIGNED NOT NULL,
    FOREIGN KEY (user) REFERENCES user(id),

    stock INTEGER UNSIGNED NOT NULL,
    FOREIGN KEY (stock) REFERENCES stock(id),

    purchased_on DATETIME NOT NULL
);

CREATE OR REPLACE TABLE stock_history (
    stock_id INTEGER UNSIGNED NOT NULL,
    FOREIGN KEY (stock_id) REFERENCES stock(id),
    volume INTEGER UNSIGNED NOT NULL,
    price DOUBLE UNSIGNED NOT NULL,
    date DATETIME NOT NULL
);

CREATE OR REPLACE TABLE prediction_source (
    stock_id INTEGER UNSIGNED NOT NULL,
    FOREIGN KEY (stock_id) REFERENCES stock(id),

    source_url TEXT NOT NULL,

    predicted_sentiment FLOAT4 NULL COMMENT 'A number between -1 and 1',

    CONSTRAINT sentiment_test CHECK (predicted_sentiment IS NULL OR (predicted_sentiment <= 1 AND predicted_sentiment >= -1))
);