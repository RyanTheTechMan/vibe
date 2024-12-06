import yfinance as yf
import warnings
import pandas as pd
import psycopg
from dotenv import load_dotenv
import os
from datetime import datetime

# Suppress DeprecationWarnings from yfinance
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Load environment variables from .env file
load_dotenv()

# Retrieve the database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

def get_stock_id(ticker_symbol):
    """
    Fetch the stock ID from the stock table based on the ticker symbol.
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Query the stock table for the given ticker symbol
                cur.execute("SELECT id FROM stock WHERE abbreviation = %s;", (ticker_symbol,))
                result = cur.fetchone()
                if result:
                    print(f"Stock ID for {ticker_symbol} is {result[0]}")
                    return result[0]
                else:
                    print(f"Stock ticker '{ticker_symbol}' not found in the database.")
                    return None
    except Exception as e:
        print(f"Error fetching stock ID: {e}")
        return None

def store_eps_data(stock_id, trailing_eps, forward_eps, upcoming_earnings_date):
    """
    Store the EPS data into the earnings_report table.
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Insert the data into earnings_report table
                cur.execute("""
                    INSERT INTO earnings_report (stock_id, eps_trailing, eps_forward, upcoming_date, date_fetched)
                    VALUES (%s, %s, %s, %s, %s);
                """, (stock_id, trailing_eps, forward_eps, upcoming_earnings_date, datetime.now()))
                conn.commit()
                print(f"Data for Stock ID {stock_id} stored successfully.\n")
    except Exception as e:
        print(f"Error storing EPS data: {e}\n")

def earning_fetch(ticker_symbol):
    """
    Fetch EPS data and upcoming earnings date for a given stock ticker
    and store it into the earnings_report table.
    """
    # Create a Ticker object for the given symbol
    stock = yf.Ticker(ticker_symbol)

    # Fetch EPS data from info
    info = stock.info

    trailing_eps = info.get('trailingEps', 'N/A')
    forward_eps = info.get('forwardEps', 'N/A')

    print("=== EPS Data ===")
    print(f"Trailing EPS: {trailing_eps}")
    print(f"Forward EPS: {forward_eps}\n")

    # Fetch upcoming earnings dates from the calendar
    earnings_calendar = stock.calendar

    print("=== Upcoming Earnings Dates ===")
    upcoming_earnings_date = None

    if isinstance(earnings_calendar, dict):
        earnings_date = earnings_calendar.get('Earnings Date', None)
        if earnings_date and isinstance(earnings_date, list) and len(earnings_date) > 0:
            upcoming_earnings_date = earnings_date[0]
            print(f"Next Earnings Date: {upcoming_earnings_date}")
        else:
            print("No upcoming earnings dates available.")
    else:
        print("Earnings calendar data is not available or is in an unexpected format.")

    # Get stock_id from the stock table
    stock_id = get_stock_id(ticker_symbol)

    if stock_id:
        # Store the fetched data into the database
        store_eps_data(stock_id, trailing_eps, forward_eps, upcoming_earnings_date)

if __name__ == "__main__":
    # List of stock tickers you want to fetch data for
    stock_tickers = ["NVDA", "AAPL"]  # Add more tickers as needed

    for ticker in stock_tickers:
        print(f"\nProcessing {ticker}...")
        earning_fetch(ticker)