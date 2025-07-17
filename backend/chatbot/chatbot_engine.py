import json
import random
import os
import nltk
from nltk.tokenize import word_tokenize
from textblob import TextBlob
from rapidfuzz import fuzz

nltk.data.find('tokenizers/punkt')

# Load intents only once
intents_path = os.path.join(os.path.dirname(__file__), 'intents.json')
with open(intents_path, 'r', encoding="utf-8") as file:
    data = json.load(file)

def get_sentiment_response(user_input):
    blob = TextBlob(user_input)
    polarity = blob.sentiment.polarity
    if polarity < -0.2:
        return "I'm really sorry you're experiencing this. Let's get it fixed fast!"
    elif polarity > 0.2:
        return "That's great to hear! How can I assist you further?"
    else:
        return ""

def get_bot_response(user_input):
    user_input = user_input.lower()
    sentiment_message = get_sentiment_response(user_input)

    best_match = {"intent": None, "score": 0}

    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            if isinstance(pattern, str):
                similarity = fuzz.partial_ratio(user_input, pattern.lower())
                if similarity > best_match["score"]:
                    best_match = {"intent": intent, "score": similarity}

    # Return best match if above threshold
    if best_match["score"] > 70:  # You can tune this threshold
        return sentiment_message + " " + random.choice(best_match["intent"]["responses"])

    # Fallback intent
    for intent in data["intents"]:
        if intent["tag"] == "fallback":
            return sentiment_message + " " + random.choice(intent["responses"])

    return sentiment_message + " I'm not sure how to help with that."