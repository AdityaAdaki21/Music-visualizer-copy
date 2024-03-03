from flask import Flask, jsonify, send_from_directory, send_file
import os
import json

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


def get_flac_files(directory):
    flac_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".flac"):
                file_path = os.path.relpath(os.path.join(root, file), directory)
                file_path = file_path.replace("\\", "/")
                flac_files.append(file_path)
    return flac_files


# Define the route to fetch FLAC files with album art
@app.route("/fetch_flac_files_with_art")
def fetch_flac_files_with_art():
    # Read the metadata from the JSON file
    with open("metadata.json", "r") as f:
        metadata = json.load(f)

    # Include album art paths in the metadata
    for song in metadata:
        if "album_art" in song:
            song["album_art_path"] = f"/album_art/{song['album_art']}"
        else:
            song["album_art_path"] = (
                "/default_album_art.jpg"  # Provide default album art path
            )

    return jsonify(metadata)


@app.route("/fetch_flac_files")
def fetch_flac_files():
    root_directory = "songs/"
    flac_files = get_flac_files(root_directory)
    print("FLAC Files:", flac_files)
    return jsonify(flac_files)


@app.route("/songs/<path:filename>")
def serve_song(filename):
    return send_from_directory("songs/", filename)


# Define the route to serve album art files
@app.route("/album_art/<path:filename>")
def serve_album_art(filename):
    return send_from_directory("album_art", filename)


@app.route("/styles.css")
def serve_css():
    return send_from_directory("static", "styles.css")


@app.route("/script.js")
def serve_js():
    return send_from_directory("static", "script.js")


if __name__ == "__main__":
    app.run(debug=True)
