#!/bin/bash

# Diabetes Detection AI Backend - Quick Start Script

echo "Starting Diabetes Detection AI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p logs uploads models/retinal/weights models/lifestyle/weights

# Run the application
echo "Starting Flask server..."
python app.py
