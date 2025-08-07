# Google Maps API Setup for MechaFix

## Overview
The application now uses Google Maps Geocoding API instead of LocationIQ for converting addresses to coordinates.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Geocoding API"
   - Click on it and press "Enable"

4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Set Environment Variable

Add the API key to your environment variables:

```bash
# In your .env file or environment
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Key Restrictions (Recommended)

For security, restrict your API key:

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers" or "IP addresses"
4. Under "API restrictions", select "Restrict key" and choose "Geocoding API"

### 4. Testing

The geocoding function will now:
- Try the full address first
- Fall back to city/area if full address fails
- Try postal code with "India" suffix
- Try general area (removing street names)

## Error Handling

The function includes comprehensive error handling:
- Invalid API key
- Network timeouts
- Invalid responses
- Multiple fallback strategies

## Cost Considerations

Google Maps Geocoding API pricing:
- $5 per 1,000 requests
- Free tier: 2,500 requests per month
- Monitor usage in Google Cloud Console

## Migration from LocationIQ

The function maintains the same interface, so no changes are needed in other parts of the application. The only change is the environment variable name from `LOCATIONIQ_API_KEY` to `GOOGLE_MAPS_API_KEY`. 