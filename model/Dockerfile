FROM python:3.9-slim
WORKDIR /app

# FastAPI, SentenceTransformers, Transformers, Torch, Accelerate, Xet Storage をインストール
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    sentence-transformers \
    transformers \
    torch \
    accelerate \
    huggingface_hub[hf_xet] \
    hf_xet

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
