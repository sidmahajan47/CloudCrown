from flask import Flask, request, jsonify, send_from_directory
import os
import requests
import requests_cache
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_url_path='/static', static_folder='static')

# Setup request caching (180 seconds = 3 minutes)
requests_cache.install_cache('weather_cache', expire_after=180)

def map_epa_index(index):
    mapping = {
        1: "Good",
        2: "Moderate",
        3: "Unhealthy for Sensitive Groups",
        4: "Unhealthy",
        5: "Very Unhealthy",
        6: "Hazardous"
    }
    return mapping.get(index, "Unknown")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/weather')
def get_weather():
    location = request.args.get('location')
    if not location:
        return jsonify({"error": "Location parameter is required"}), 400

    api_key = os.getenv('WEATHER_API_KEY')
    url = f"http://api.weatherapi.com/v1/current.json"
    
    try:
        response = requests.get(url, params={
            'key': api_key,
            'q': location,
            'aqi': 'yes'
        })
        
        # Forward the rate limit header
        headers = {
            'x-weatherapi-qpm-left': response.headers.get('x-weatherapi-qpm-left', 'N/A')
        }
        
        if response.status_code != 200:
            return jsonify(response.json()), response.status_code, headers
            
        data = response.json()
        
        processed_data = {
            "location": f"{data['location']['name']}, {data['location']['country']}",
            "temp_c": data['current']['temp_c'],
            "temp_f": data['current']['temp_f'],
            "condition": data['current']['condition']['text'],
            "icon": f"https:{data['current']['condition']['icon']}",
            "humidity": data['current']['humidity'],
            "wind_kph": data['current']['wind_kph'],
            "feelslike_c": data['current']['feelslike_c'],
            "air_quality": map_epa_index(data['current']['air_quality']['us-epa-index'])
        }
        
        return jsonify(processed_data), 200, headers
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    app.run(debug=True)