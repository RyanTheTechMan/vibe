
-- Returns number between -1 and 1
CREATE OR REPLACE FUNCTION GetStockSentimentScore(
    p_stock_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS FLOAT AS $$
    -- Return AVG of sentiment scores based on the date range
    SELECT AVG(predicted_sentiment_score)
    FROM source
    JOIN stocks_source ON source.id = stocks_source.source_id
    WHERE stocks_source.stock_id = p_stock_id
    AND date_fetched BETWEEN p_start_date AND p_end_date
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION GetStockBiasScore(
    p_stock_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS FLOAT AS $$
    -- Return AVG of sentiment scores based on the date range
    SELECT AVG(predicted_opinion_score)
    FROM source
    JOIN stocks_source ON source.id = stocks_source.source_id
    WHERE stocks_source.stock_id = p_stock_id
    AND date_fetched BETWEEN p_start_date AND p_end_date
$$ LANGUAGE SQL;


-- get stock name from id
SELECT stock.name from stock where id = 156;
SELECT GetStockSentimentScore(156, DATE '2024-01-01', DATE(NOW()));
SELECT GetStockBiasScore(156, DATE '2024-01-01', DATE(NOW()));

-- show all data above
SELECT
    stock.id as stock_id,
    stock.name as stock_name,
   GetStockSentimentScore(stock.id, DATE '2024-01-01', DATE(NOW())) as sentiment_score,
   GetStockBiasScore(stock.id, DATE '2024-01-01', DATE(NOW())) as bias_score
FROM stock
