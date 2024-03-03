document.addEventListener("DOMContentLoaded", function () {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const lyricsContainer = document.getElementById("lyricsContainer");
    const albumImage = document.getElementById("albumImage");
    const songTitleElement = document.getElementById("songTitle");
    const artistNameElement = document.getElementById("artistName");

    let currentLyricIndex = 0;

    const fetchFlacFiles = async () => {
        try {
            const response = await fetch('/fetch_flac_files_with_art');
            if (!response.ok) {
                throw new Error('Failed to fetch FLAC files');
            }
            const data = await response.json();
            data.forEach(song => {
                addSongToPlaylist(song);
            });
        } catch (error) {
            console.error('Error fetching FLAC files:', error.message);
        }
    };

    const addSongToPlaylist = (song) => {
        const songItem = document.createElement('div');
        songItem.textContent = song.title;
        songItem.classList.add('song-item');
        playlist.appendChild(songItem);

        songItem.addEventListener('click', function () {
            playSong(song);
        });
    };

    const playSong = (song) => {
        const songPath = song.path;
        audioPlayer.src = songPath;
        audioPlayer.play();
        currentLyricIndex = 0;
        if (song.lyrics) {
            displayTimedLyrics(song.lyrics);
        } else {
            clearLyricsContainer();
        }

        setAlbumImage(song.album_art);

        // Update song title and artist name
        songTitleElement.textContent = song.title;
        artistNameElement.textContent = song.artist;
    };

    const displayTimedLyrics = (lyrics) => {
        clearLyricsContainer();
        const lines = lyrics.split('\n');
        lines.forEach((line, index) => {
            if (line.trim() !== '') {
                addLyricItem(line, index);
            }
        });
    };

    const addLyricItem = (line, index) => {
        const [timestamp, lyricText] = line.split(']');
        const lyricItem = document.createElement('div');
        lyricItem.classList.add('lyric-item');
        lyricItem.textContent = lyricText.trim();
        lyricsContainer.appendChild(lyricItem);

        const [minutes, seconds] = timestamp.substring(1).split(':');
        const currentTimeInSeconds = parseInt(minutes) * 60 + parseInt(seconds);

        audioPlayer.addEventListener('timeupdate', function () {
            highlightCurrentLyric(currentTimeInSeconds, lyricItem, index);
        });

        lyricItem.addEventListener('click', function () {
            audioPlayer.currentTime = currentTimeInSeconds;
            audioPlayer.play();
        });
    };

    const highlightCurrentLyric = (currentTimeInSeconds, lyricItem, index) => {
        if (audioPlayer.currentTime >= currentTimeInSeconds) {
            const previousLyric = lyricsContainer.children[currentLyricIndex];
            if (previousLyric) {
                previousLyric.classList.remove('highlight');
            }
            lyricItem.classList.add('highlight');
            currentLyricIndex = index;
        }
    };

    const clearLyricsContainer = () => {
        lyricsContainer.innerHTML = "";
    };

    const setAlbumImage = (albumArtPath) => {
        if (albumArtPath) {
            albumImage.src = albumArtPath;
        } else {
            albumImage.src = "default_album_art.jpg";
        }
    };

    fetchFlacFiles();

    // Prevent scrolling when hitting Spacebar globally
    window.addEventListener('keydown', function (e) {
        if (e.keyCode === 32 && e.target === document.body) {
            e.preventDefault();
        }
    });

    // Keyboard controls globally
    document.addEventListener('keydown', function (event) {
        handleKeyboardControls(event);
    });

    const handleKeyboardControls = (event) => {
        switch (event.code) {
            case 'Space':
                togglePlayPause();
                break;
            case 'ArrowRight':
                audioPlayer.currentTime += 5;
                break;
            case 'ArrowLeft':
                audioPlayer.currentTime -= 5;
                break;
            default:
                break;
        }
    };

    const togglePlayPause = () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    };

    // Handle click outside the audio player to prevent scrolling
    document.addEventListener('click', function (e) {
        if (!audioPlayer.contains(e.target)) {
            e.preventDefault();
        }
    });
});
