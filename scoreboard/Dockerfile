FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
# COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir streamlit mysql-connector-python streamlit-cookies-controller pyyaml

# Copy the rest of the application code
COPY . .

# Expose the port Streamlit runs on
EXPOSE 8501

# Run Streamlit
CMD ["streamlit", "run", "app.py", "--browser.gatherUsageStats", "false", "--server.enableCORS", "false"]