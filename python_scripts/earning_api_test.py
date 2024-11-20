import yfinance as yf

# Get earnings data for Apple (AAPL)
def earning_fetch():

    # Create a Ticker object for Apple
    apple = yf.Ticker("AAPL")

    # Get the earnings history
    earnings_history = apple.earnings

    # Get the upcoming earnings dates
    upcoming_earnings = apple.earnings_dates

    print(earnings_history)
    print(upcoming_earnings)

if __name__ == "__main__":
    earning_fetch()