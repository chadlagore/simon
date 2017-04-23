var KEYS = ['c', 'd', 'e', 'f'];
var NOTE_DURATION = 500;
var ECHO_LENGTH = 2500;

simon_on = true;

// NoteBox
//
// Acts as an interface to the coloured note boxes on the page, exposing methods
// for playing audio, handling clicks,and enabling/disabling the note box.
function NoteBox(key, onClick) {
	// Create references to box element and audio element.
	var boxEl = document.getElementById(key);
	var audioEl = document.getElementById(key + '-audio');
	if (!boxEl) throw new Error('No NoteBox element with id' + key);
	if (!audioEl) throw new Error('No audio element with id' + key + '-audio');

	// When enabled, will call this.play() and this.onClick() when clicked.
	// Otherwise, clicking has no effect.
	var enabled = true;
	// Counter of how many play calls have been made without completing.
	// Ensures that consequent plays won't prematurely remove the active class.
	var playing = 0;

	// True if already waiting to echo.
	var onEcho = false;

	this.key = key;
	this.onClick = onClick || function () {
		if (!simon_on) {
			clearTimeout(onEcho);
			onEcho = setTimeout(this.play, ECHO_LENGTH)
		}
	};

	// Plays the audio associated with this NoteBox
	this.play = function () {
		playing++;
		// Always play from the beginning of the file.
		audioEl.currentTime = 0;
		audioEl.play();

		// Set active class for NOTE_DURATION time
		boxEl.classList.add('active');
		setTimeout(function () {
			playing--
			if (!playing) {
				boxEl.classList.remove('active');
			}
		}, NOTE_DURATION)
	}

	// Enable this NoteBox
	this.enable = function () {
		enabled = true;
	}

	// Disable this NoteBox
	this.disable = function () {
		enabled = false;
	}

	// Call this NoteBox's clickHandler and play the note.
	this.clickHandler = function () {
		if (!enabled) return;

		this.onClick(this.key)
		this.play()
	}.bind(this)

	// Returns the box associated with this note.
	this.getBox = function () {
		return boxEl;
	}

	boxEl.addEventListener('mousedown', this.clickHandler);
}

// Simon
//
// Generates a game of simon, and plays with the user.
// Exposes methods for generating new new notes, and testing user input.
// There is no such thing as winning :/
function Simon() {
	var notes = {};

	// Create each note, add a click handler.
	KEYS.forEach(function (key) {
		notes[key] = new NoteBox(key);
		notes[key].getBox().addEventListener('mousedown', function(event) {
			clickHandler(event)
		})
	});

	var numNotes = Object.keys(notes).length

	// Save played notes.
	var simonNotes = []
	var userNotes = []

	// When enabled, will play the game in a loop.
	var enabled = true;

	// Starts the game by playing a note.
	this.startNextRound = function () {

		// Play a random note.
		var nextNote = getNextNote();
		simonNotes.push(nextNote)

		simonNotes.forEach(function(key, i) {
				setTimeout(notes[key].play.bind(key), i * NOTE_DURATION);
			}
		);
	}

	// Responds to a click.
	this.clickHandler = function (event) {
		userNotes.push(event.currentTarget.id)

		if(testProgress()) {

			// If round over, start next round in 2.5s.
			if (userNotes.length == simonNotes.length) {
				setTimeout(startNextRound, ECHO_LENGTH);
				userNotes = []
			}
		} else {
			alert("failure!")
		}
	}.bind(this)

	// Disables simon.
	this.stop = function() {
		enabled = false
	}

	// Returns true if the user entered a valid note.
	this.testProgress = function () {

		for (var i=0; i<userNotes.length; i++) {
			if (simonNotes[i] != userNotes[i]) {
				return false;
			}
		}

		return true;
	}

	// Gets a new note (randomly)
	this.getNextNote = function() {
		var index = Math.floor(Math.random() * (numNotes))
		console.log(index)
		return KEYS[index];
	}

	startNextRound()
}


// Create new instance of simon.
Simon()
