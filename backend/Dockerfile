FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
RUN apt-get update && apt-get install -y graphviz
RUN python3 post_install_scripts.py
RUN python3 -m spacy download de_core_news_md
RUN python3 -m spacy download en_core_web_sm
ENV FLASK_ENV=production
RUN echo "The ENV variable value for FLASK_ENV is $FLASK_ENV"
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5000"]