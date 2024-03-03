// Assuming you have included libflac.js in your HTML

// Load and decode a FLAC file
function loadAndDecodeFLAC(url, context, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
            callback(buffer);
        }, function (error) {
            console.error('Failed to decode FLAC:', error);
        });
    };

    request.send();
}

// Play the decoded audio buffer
function playAudioBuffer(buffer, context) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
}

// Usage example
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Replace 'example.flac' with the path to your FLAC file
loadAndDecodeFLAC('./songs/Melatonin Dreams/01 - Blurry Nights.flac', audioContext, function (buffer) {
    playAudioBuffer(buffer, audioContext);
});
