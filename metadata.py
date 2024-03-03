import os
import json
from mutagen import flac


def extract_metadata(file_path):
    """Extract metadata from a FLAC file and convert it to JSON format."""
    if not os.path.isfile(file_path) or not file_path.endswith(".flac"):
        raise FileNotFoundError("The file does not exist or is not a FLAC file.")

    # Open the FLAC file
    audio = flac.FLAC(file_path)

    if int(audio.get("TRACKNUMBER", [""])[0]) < 10:
        change_path = (
            "0"
            + (audio.get("TRACKNUMBER", [""])[0] if audio.get("TRACKNUMBER") else "0")
            + " - "
            + (audio.get("TITLE", [""])[0] if audio.get("TITLE") else "")
            + ".flac"
        )
    else:
        change_path = (
            (audio.get("TRACKNUMBER", [""])[0] if audio.get("TRACKNUMBER") else "0")
            + " - "
            + (audio.get("TITLE", [""])[0] if audio.get("TITLE") else "")
            + ".flac"
        )

    # Extract the metadata
    metadata = {
        "artist": audio.get("ARTIST", [""])[0] if audio.get("ARTIST") else "",
        "title": audio.get("TITLE", [""])[0] if audio.get("TITLE") else "",
        "album": audio.get("ALBUM", [""])[0] if audio.get("ALBUM") else "",
        "track_number": (
            int(audio.get("TRACKNUMBER", [""])[0]) if audio.get("TRACKNUMBER") else 0
        ),
        "genre": audio.get("GENRE", [""])[0] if audio.get("GENRE") else "",
        "lyrics": (
            "\n".join(audio.get("LYRICS", [""]) or []) if audio.get("LYRICS") else ""
        ),
        "album_art": find_album_art(file_path),
        "path": "./songs/"
        + (audio.get("ALBUM", [""])[0] if audio.get("ALBUM") else "")
        + "/"
        + change_path,
    }

    return metadata


def find_album_art(file_path):
    """Find album art path for the FLAC file."""
    # Extract directory path
    directory = os.path.dirname(file_path)
    # Check for album art files in the directory
    for root, dirs, files in os.walk(directory):
        print(directory)
        for file_name in files:
            if file_name.lower() in ["cover.png", "folder.jpg"]:
                return os.path.join(root, file_name)
            # print(file_name, file_path)
    return None


def find_path(file_path):
    """Find album art path for the FLAC file."""
    # Extract directory path
    directory = os.path.dirname(file_path)
    # Check for album art files in the directory
    for root, dirs, files in os.walk(directory):
        for file_name in files:
            return os.path.join(root, file_name)
    return None


def process_directory(directory):
    """Process all FLAC files in a directory and its subdirectories."""
    metadata_list = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".flac"):
                file_path = os.path.join(root, file)
                metadata = extract_metadata(file_path)
                metadata_list.append(metadata)

    return metadata_list


def create_json_file(metadata_list, output_file="metadata.json"):
    """Create a JSON file containing all metadata."""
    with open(output_file, "w") as json_file:
        json.dump(metadata_list, json_file, indent=4)


if __name__ == "__main__":
    directory = "./songs/"
    metadata_list = process_directory(directory)
    create_json_file(metadata_list)
    print("Metadata JSON file created successfully.")
