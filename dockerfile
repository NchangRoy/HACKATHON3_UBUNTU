FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port (Render uses 10000)
EXPOSE 10000

# Run FastAPI
CMD ["uvicorn", "AImodel.main:app", "--host", "0.0.0.0", "--port", "10000"]