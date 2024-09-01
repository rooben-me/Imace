# Imace - Find your photos Easily 📷✨

Imace is a web application that allows you to search your images using natural language and explore them in an interactive 3D space.

## Features

- **Natural Language Search:** Find your photos by describing them, just like you would to a friend!
- **Interactive 3D Visualization:** Explore your images in a 3D space, revealing visual relationships between them.
- **Local Processing:** All processing happens on your machine, ensuring your privacy.

## How it works

Imace uses the CLIP model to encode your images and search queries, allowing for accurate semantic matching.

## Disclaimer

**Warning:** This code was lovingly crafted (and slightly panicked over) in 3-hour. Proceed with caution and a sense of humor! 😅 If you find any bugs, please submit an issue (or better yet, a pull request with a fix!).

## Running the project

To get Imace up and running, follow these steps:

**Backend:**

1. **Navigate to the `backend` directory:** `cd backend`
2. **Create a virtual environment:**
   - Using `venv`: `python3 -m venv venv`
   - Using `virtualenv`: `virtualenv venv`
3. **Activate the virtual environment:**
   - On Linux/macOS: `source venv/bin/activate`
   - On Windows: `venv\Scripts\activate`
4. **Install dependencies:** `pip install -r requirements.txt`
5. **Start the Uvicorn server:** `uvicorn app:app --reload`

**Frontend:**

1. **Navigate to the `frontend` directory:** `cd frontend`
2. **Install pnpm (if you don't have it):** `npm install -g pnpm`
3. **Install dependencies:** `pnpm install`
4. **Run the frontend:** `pnpm run dev`

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

The source code is licensed under the MIT license.
