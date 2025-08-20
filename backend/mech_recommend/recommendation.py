import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import openrouteservice
from openrouteservice.exceptions import ApiError
import warnings
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

warnings.filterwarnings("ignore")

# ---------------------------
# Haversine Distance Function
# ---------------------------
def haversine_distance(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Earth radius in km
    return c * r

# ---------------------------
# Sentiment Analyzer
# ---------------------------
class SentimentAnalyzer:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
        self.model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
        self.model.eval()

    def score(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            output = self.model(**inputs)
        probs = torch.nn.functional.softmax(output.logits, dim=1).numpy().flatten()
        return probs[2] - probs[0]  # pos - neg

# ---------------------------
# Load & Preprocess Data
# ---------------------------

# MongoDB connection (use your actual connection string)
MONGO_URL = os.getenv('MONGO_URL')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME')

client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]
collection = db['find_mech']

# Fetch all documents from the collection
data = list(collection.find({}))

# Convert to DataFrame
df = pd.DataFrame(data)
# print(df.head())

df = df.dropna(subset=['mech_lat', 'mech_long'])
df['comment'] = df['comment'].fillna('')
df['rating'] = df['rating'].fillna(df['rating'].median())

# Compute sentiment scores
sentiment_analyzer = SentimentAnalyzer()
df['sentiment_score'] = df['comment'].apply(sentiment_analyzer.score)

# ---------------------------
# OpenRouteService Setup
# ---------------------------
ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJkOTIxMDYwMDQ0ODQwMjRhMjFjYjc4ZDRiZjI1ODcxIiwiaCI6Im11cm11cjY0In0="  # Replace with your real key
ors_client = openrouteservice.Client(key=ORS_API_KEY)

def get_road_distance(user_lat, user_long, mech_lat, mech_long):
    try:
        coords = ((user_long, user_lat), (mech_long, mech_lat))  # (lon, lat)
        result = ors_client.directions(coords)
        return result['routes'][0]['summary']['distance'] / 1000  # in km
    except ApiError:
        return haversine_distance(user_lat, user_long, mech_lat, mech_long)

# ---------------------------
# Recommendation Function
# ---------------------------

def recommend_mechanics(user_lat, user_long, breakdown_type):
    filtered = df[df['breakdown_type'].str.lower() == breakdown_type.lower()].copy()

    if filtered.empty:
        print(f"No exact match for breakdown_type '{breakdown_type}', using all data.")
        filtered = df.copy()

    filtered['distance_km'] = filtered.apply(
        lambda row: haversine_distance(user_lat, user_long, row['mech_lat'], row['mech_long']), axis=1
    )

    filtered['norm_rating'] = (filtered['rating'] - filtered['rating'].min()) / (filtered['rating'].max() - filtered['rating'].min())
    filtered['norm_sentiment'] = (filtered['sentiment_score'] - filtered['sentiment_score'].min()) / (filtered['sentiment_score'].max() - filtered['sentiment_score'].min())
    filtered['inv_distance'] = 1 / (filtered['distance_km'] + 1)
    filtered['norm_inv_distance'] = (filtered['inv_distance'] - filtered['inv_distance'].min()) / (filtered['inv_distance'].max() - filtered['inv_distance'].min())

    filtered['score'] = (
        0.5 * filtered['norm_inv_distance'] +
        0.3 * filtered['norm_rating'] +
        0.2 * filtered['norm_sentiment']
    )

    filtered = filtered.sort_values(by='score', ascending=False)
    filtered = filtered.drop_duplicates(subset='mech_name', keep='first')
    return filtered

# ---------------------------
# Example Usage
# ---------------------------
# def get_top_mechanics(user_lat, user_long, breakdown_type):
#     return recommend_mechanics(user_lat, user_long, breakdown_type)

def get_top_mechanics(user_lat, user_long, breakdown_type, offset=0, limit=5):
    all_mechs = recommend_mechanics(user_lat, user_long, breakdown_type)
    page = all_mechs.iloc[offset:offset+limit].copy()

    page['road_distance_km'] = page.apply(
        lambda row: get_road_distance(user_lat, user_long, row['mech_lat'], row['mech_long']),
        axis=1
    )

    print("Total mechanics found:", len(all_mechs))
    print("Returning mechanics from", offset, "to", offset+limit)
    return page[['mech_name', 'mech_lat', 'mech_long', 'rating', 'comment',
                 'breakdown_type', 'distance_km', 'road_distance_km', 'score']]