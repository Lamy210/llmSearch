from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import pipeline, set_seed

app = FastAPI()
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

# テキスト生成モデルをロード（CPU 固定）
set_seed(42)
gen_model = pipeline(
    "text-generation",
    model="gpt2",
    framework="pt",
    device=-1  # CPU モード
)
# デフォルト max_length を拡張 (例: +50)
gen_model.model.config.max_length = gen_model.model.config.max_length + 50

class TextReq(BaseModel):
    text: str

@app.post("/embed")
async def embed(req: TextReq):
    vec = embed_model.encode(req.text).tolist()
    return {"embedding": vec}

class PromptReq(BaseModel):
    prompt: str

@app.post("/generate")
async def generate(req: PromptReq):
    prompt = req.prompt
    # モデルの最大コンテキスト長を取得
    max_ctx = gen_model.model.config.max_position_embeddings
    new_tokens = 50

    # プロンプトが長すぎる場合は末尾を残して切り詰め
    if len(prompt) > max_ctx - new_tokens:
        print(f"Prompt too long ({len(prompt)}), trimming to last {max_ctx - new_tokens} chars")
        prompt = prompt[-(max_ctx - new_tokens):]

    print("Model generate: prompt length", len(prompt))
    output = gen_model(
        prompt,
        max_new_tokens=new_tokens,
        do_sample=False,
        return_full_text=False
    )
    text = output[0]['generated_text']
    print("Model generate: output length", len(text))
    return {"answer": text}

@app.get("/")
async def root():
    return {"message": "LLM model service is running. Use /health, /embed, /generate endpoints."}

@app.get("/health")
async def health():
    return {"status": "ok"}
