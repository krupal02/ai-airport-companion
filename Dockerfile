FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build Vite frontend
RUN npm run build

# Expose port (Render uses  or 10000 by default)
EXPOSE 8000

# Start FastAPI server
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
