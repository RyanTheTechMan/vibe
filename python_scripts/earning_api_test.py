import yfinance as yf
import warnings
import pandas as pd

# Suppress DeprecationWarnings from yfinance
warnings.filterwarnings("ignore", category=DeprecationWarning)

def earning_fetch():
    # Create a Ticker object for Apple
    apple = yf.Ticker("AAPL")

    # Fetch EPS data from info
    info = apple.info

    trailing_eps = info.get('trailingEps', 'N/A')
    forward_eps = info.get('forwardEps', 'N/A')

    print("=== EPS Data ===")
    print(f"Trailing EPS: {trailing_eps}")
    print(f"Forward EPS: {forward_eps}\n")

    # Fetch quarterly earnings
    quarterly_earnings = apple.quarterly_earnings

    print("=== Quarterly Earnings ===")
    if isinstance(quarterly_earnings, pd.DataFrame):
        if not quarterly_earnings.empty:
            print(quarterly_earnings)
            print("\nDetailed Quarterly Earnings:")
            for date, row in quarterly_earnings.iterrows():
                # Format the date
                date_str = date.strftime('%Y-%m-%d') if isinstance(date, pd.Timestamp) else str(date)
                eps = row.get('Earnings', 'N/A')
                print(f"Date: {date_str}")
                print(f"   EPS: {eps}\n")
        else:
            print("No quarterly earnings available.\n")
    else:
        print("Quarterly earnings data is not available or is in an unexpected format.\n")

    # Fetch upcoming earnings dates from the calendar
    earnings_calendar = apple.calendar

    print("=== Upcoming Earnings Dates ===")
    if isinstance(earnings_calendar, dict):
        earnings_date = earnings_calendar.get('Earnings Date', None)
        if earnings_date and isinstance(earnings_date, list) and len(earnings_date) > 0:
            print(f"Next Earnings Date: {earnings_date[0]}")
        else:
            print("No upcoming earnings dates available.")
    else:
        print("Earnings calendar data is not available or is in an unexpected format.")

if __name__ == "__main__":
    earning_fetch()