FROM python:3.12-slim

RUN useradd -m app
USER app

WORKDIR /app

RUN pip install --no-cache-dir streamlit mysql-connector-python streamlit-cookies-controller pyyaml

COPY . .

EXPOSE 8501

CMD ["python", "-m", "streamlit", "run", "app.py", "--browser.gatherUsageStats", "false", "--server.enableCORS", "false"]