from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import os
import numpy as np
import sqlite3
from sklearn.decomposition import PCA
import base64
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CLIP model
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Database setup
conn = sqlite3.connect('images.db', check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS images
             (id INTEGER PRIMARY KEY, path TEXT, embedding BLOB)''')
conn.commit()

# Set up upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Mount the uploads folder as a static directory
app.mount("/uploads", StaticFiles(directory="uploads", html=True), name="uploads") 

def process_image(image_path):
    image = Image.open(image_path)
    image_feature = model.get_image_features(**processor(images=[image], return_tensors="pt"))
    
    # Store in database
    c.execute("INSERT INTO images (path, embedding) VALUES (?, ?)",
              (image_path, image_feature.detach().numpy().tobytes()))
    conn.commit()

@app.post("/upload")
async def upload_files(request: Request, images: list[UploadFile] = File(...)):
    for image in images:
        if image.filename == '':
            raise HTTPException(status_code=400, detail="No selected file")
        
        contents = await image.read()
        filename = image.filename
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        process_image(file_path)
    
    return {"message": "Files uploaded successfully"}

@app.post("/search_by_image")
async def search_by_image(image: UploadFile = File(...)):
    if image.filename == '':
        raise HTTPException(status_code=400, detail="No selected file")
    
    contents = await image.read()
    filename = image.filename
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Get image embedding
    image = Image.open(file_path)
    image_features = model.get_image_features(**processor(images=[image], return_tensors="pt"))
    
    # Fetch all embeddings from database
    c.execute("SELECT path, embedding FROM images")
    results = c.fetchall()
    
    similarities = []
    for path, embedding_bytes in results:
        image_feature = torch.from_numpy(np.frombuffer(embedding_bytes, dtype=np.float32).reshape(1, -1))
        similarity = torch.cosine_similarity(image_features, image_feature)
        similarities.append((path, float(similarity)))
    
    # Sort by similarity
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Return top 10 results
    top_results = [{"path": os.path.basename(path), "similarity": sim * 100} for path, sim in similarities[:10]]
    return top_results

@app.post("/search")
async def search(request: Request):
    data = await request.json()
    query = data.get('query')
    if not query:
        raise HTTPException(status_code=400, detail="No query specified")
    
    # Get text embedding
    text_features = model.get_text_features(**processor(text=[query], return_tensors="pt"))
    
    # Fetch all embeddings from database
    c.execute("SELECT path, embedding FROM images")
    results = c.fetchall()
    
    similarities = []
    for path, embedding_bytes in results:
        image_feature = torch.from_numpy(np.frombuffer(embedding_bytes, dtype=np.float32).reshape(1, -1))
        similarity = torch.cosine_similarity(text_features, image_feature)
        similarities.append((path, float(similarity)))
    
    # Sort by similarity
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Return top 10 results
    top_results = [{"path": os.path.basename(path), "similarity": sim * 100} for path, sim in similarities[:10]]
    return top_results

@app.get("/all_images")
async def get_all_images():
    c.execute("SELECT path FROM images")
    results = c.fetchall()
    image_paths = [os.path.basename(result[0]) for result in results]
    return image_paths

@app.get("/image/{filename}")
async def serve_image(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

@app.post("/delete_all")
async def delete_all():
    try:
        # Delete all records from the database
        c.execute("DELETE FROM images")
        conn.commit()

        # Delete all files in the upload folder
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)

        return {"message": "All data deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/image_points")
async def get_image_points():
    c.execute("SELECT id, path, embedding FROM images")
    results = c.fetchall()
    
    if not results:
        return []
    
    embeddings = []
    ids = []
    image_data = []
    
    for id, path, embedding_bytes in results:
        embedding = np.frombuffer(embedding_bytes, dtype=np.float32).reshape(1, -1)
        embeddings.append(embedding)
        ids.append(id)
        
        # Open the image and resize it to a lower resolution
        with Image.open(os.path.join(UPLOAD_FOLDER, os.path.basename(path))) as img:
            # Resize the image to a maximum width or height of 300 pixels
            img.thumbnail((300, 300))
            
            # Convert the image to RGB mode (in case it's not)
            img = img.convert('RGB')
            
            # Save the resized image to a bytes buffer in WebP format
            buffer = io.BytesIO()
            img.save(buffer, format="WebP", quality=80)
            img_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        image_data.append(img_data)
    
    # Combine all embeddings
    all_embeddings = np.vstack(embeddings)
    
    # Perform PCA to reduce dimensionality to 3
    pca = PCA(n_components=3)
    reduced_embeddings = pca.fit_transform(all_embeddings)
    
    # Normalize the reduced embeddings to a reasonable range (e.g., -10 to 10)
    min_vals = np.min(reduced_embeddings, axis=0)
    max_vals = np.max(reduced_embeddings, axis=0)
    normalized_embeddings = (reduced_embeddings - min_vals) / (max_vals - min_vals) * 20 - 10
    
    image_points = []
    for i, (id, img_data) in enumerate(zip(ids, image_data)):
        image_points.append({
            "id": id,
            "imageData": f"data:image/webp;base64,{img_data}",
            "position": normalized_embeddings[i].tolist()
        })
    
    return image_points

@app.get("/paginated_images")
async def get_paginated_images(page: int = 1, page_size: int = 12):
    offset = (page - 1) * page_size
    
    # Get total count of images
    c.execute("SELECT COUNT(*) FROM images")
    total_images = c.fetchone()[0]
    
    # Get paginated images
    c.execute("SELECT path FROM images LIMIT ? OFFSET ?", (page_size, offset))
    results = c.fetchall()
    image_paths = [os.path.basename(result[0]) for result in results]
    
    return {
        "images": image_paths,
        "total": total_images,
        "page": page,
        "page_size": page_size
    }
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)