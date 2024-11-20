# !/usr/bin/python
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()



def insert_source_origin():
    try:
        with psycopg.connect(os.getenv('DATABASE_URL')) as conn:
            with conn.cursor() as cur:
                # Insert the source
                cur.execute("""
                    INSERT INTO source_origin (name, logo_url, base_url)
                    VALUES (%s, %s, %s);
                """, (
                    "Yahoo Finance",
                    "",
                    "https://finance.yahoo.com/"
                ))
                conn.commit()
                print("Source inserted successfully.")
    except Exception as e:
        print(f"Error inserting source: {e}")


def get_source_origin_id(source_origin_name):
    try:
        with psycopg.connect(os.getenv('DATABASE_URL')) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM source_origin WHERE name = %s;", (source_origin_name,))
                result = cur.fetchone()
                return result[0] if result else None
    except Exception as e:
        print(f"Error fetching source_origin_id: {e}")
        return None

# Fetch Reddit posts
def fetch_posts(reddit, subreddit_name="wallstreetbets", flair="dd", limit=10):
    subreddit = reddit.subreddit(subreddit_name)
    return [
        {
            'title': submission.title,
            'text': submission.selftext,
            'url': submission.url,
            'author': str(submission.author),
            'created_utc': submission.created_utc
        }
        for submission in subreddit.new(limit=100)
        if submission.link_flair_text and submission.link_flair_text.lower() == flair.lower()
    ][:limit]

# Process posts and store in database
def process_posts_and_store(reddit, source_origin_name):
    source_origin_id = get_source_origin_id(source_origin_name)
    if not source_origin_id:
        print(f"Source origin '{source_origin_name}' not found.")
        return

    posts = fetch_posts(reddit)
    if not posts:
        print("No posts found.")
        return

    for post in posts:
        print(f"Processing post: {post['title']} by u/{post['author']}")

        # Analyze sentiment
        sentiment = analyze_sentiment(post['text'])
        sentiment_score = sentiment['polarity']
        opinion_score = sentiment['subjectivity']

        # Insert into the `source` table
        insert_source(
            url=post['url'],
            source_origin_id=source_origin_id,
            sentiment_score=sentiment_score,
            opinion_score=opinion_score,
            source_origin_name=source_origin_name
        )

def main():
    reddit = authenticate_reddit()
    source_origin_name = "WallStreetBets"  # Change to your source origin name
    process_posts_and_store(reddit, source_origin_name)

if __name__ == "__main__":
    main()



