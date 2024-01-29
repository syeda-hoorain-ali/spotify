let currentSong = new Audio();
let currentFolder;
let songs;
let cards;
let wow;

let songInfo = document.querySelector('.song-info');
let songTime = document.querySelector('.song-time');
let volumeIcon = document.querySelector('.song-volume i');
let cardContainer = document.querySelector('.card-container');



let play = document.getElementById('play');
let next = document.getElementById('next');
let previous = document.getElementById('previous');
let range = document.getElementById('range');



function secToMin(seconds) {
    let min = ("0" + Math.floor(seconds / 60)).substr(-2);
    let sec = ("0" + Math.floor(seconds % 60)).substr(-2);
    let result = min + ":" + sec;
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    return result;
}

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`https://syeda-hoorain-ali.github.io/spotify/songs/${folder}`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    //* Show all the songs in playlist
    let songUl = document.querySelector(".song-list ul");
    songUl.innerHTML = "";
    function showSongs() {
        for (const song of songs) {
            songUl.innerHTML = songUl.innerHTML + `<li>
            <i class="fa-solid fa-music"></i>
            <div class="info">
                <div class="name">${song.replaceAll('%20', ' ').split('.mp3')[0]}</div>
                <div class="">Song Artist</div>
            </div>
            <i class="fa-solid fa-circle-play"></i>
        </li>`
        }
    };
    showSongs();


    //* Attach an event listener to each song
    let songLi = document.querySelectorAll(".song-list ul li");
    Array.from(songLi).forEach((li) => {
        li.addEventListener('click', (e) => {
            console.log(li.querySelector(".info div").innerHTML);
            playMusic(li.querySelector(".info div").innerHTML.trim() + '.mp3');
            play.classList.replace('fa-circle-play', 'fa-circle-pause');
        })
    })

}









function playMusic(track, pause = false) {
    currentSong.src = `songs/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
    }
    songInfo.innerHTML = decodeURI(track).split('.mp3')[0];
    songTime.innerHTML = "00:00 / 00:00";
}



async function displayAlbums() {

   //* Get the metadata of folders


    fetch('./api.json') 
        .then(response => response.json())
        .then(data => {
            data.forEach((e) => {
                cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card radius" data-folder="${e.folder_name}">
                    <img src="${e.cover}" alt="${e.title}" title="${e.title}">
                    <h3>${e.title}</h3>
                    <p>${e.description}</p>
                    <div class="play"><i class="fa-solid fa-play"></i></div>
                </div>`;

                //* Load the playlist whenever card is clicked
                cards = document.querySelectorAll('.card');

                cards.forEach((card) => {
                    card.addEventListener('click', async (e) => {
                        await getSongs(`${e.currentTarget.dataset.folder}`);

                        playMusic(songs[0]);
                        play.classList.replace('fa-circle-play', 'fa-circle-pause');
                    })
                });
            })

        })
        .catch(error => console.error('Error:', error));
}



async function main() {

    //* Get the lists of all songs
    await getSongs('soulfulDinner');
    playMusic(songs[0], true)
    // console.log(songs);

    //* Display all the albums on the page 
    displayAlbums()



    //* Add an event listener to play button
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.classList.replace('fa-circle-play', 'fa-circle-pause');
        } else {
            currentSong.pause();
            play.classList.replace('fa-circle-pause', 'fa-circle-play');
        }
    });



    //* Add an event listener to previous button
    previous.addEventListener('click', () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        console.log(index);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    });



    //* Add an event listener to next button
    next.addEventListener('click', () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });


    //* Add an event listener to show volume bar
    volumeIcon.addEventListener('click', () => {
        let range = document.querySelector('.range');

        if (range.style.top == '-175px') {
            range.style.top = '-75px';
            range.style.opacity = '0';
            range.style.visibility = 'hidden';
        } else {
            range.style.top = '-175px';
            range.style.opacity = '1';
            range.style.visibility = 'visible';
        }

    });


    //* Add an event listener to volume button
    range.addEventListener('change', (e) => {
        currentSong.volume = e.target.value / 100;
        let span = document.querySelector('.range span');
        span.innerHTML = e.target.value;

        if (e.target.value <= 5) {
            volumeIcon.classList.replace('fa-volume-low', 'fa-volume-xmark')
        } else {
            volumeIcon.classList.replace('fa-volume-xmark', 'fa-volume-low')
        }
    })


    //* Event listener for time update
    let circle = document.querySelector('.circle');
    let played = document.querySelector('.played');

    currentSong.addEventListener('timeupdate', (e) => {
        let currTime = secToMin(currentSong.currentTime);
        let duration = secToMin(currentSong.duration);
        songTime.innerHTML = currTime + " / " + duration;
        circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        played.style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })



    //* Event listener for seek bar
    let seekBar = document.querySelector('.seek-bar');
    seekBar.addEventListener('click', (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        circle.style.left = percent + '%';
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })




}
main();




//* Event listener for responsive navbar

document.querySelector('.fa-bars').addEventListener('click', () => {
    document.querySelector('.left').style.left = '0%'
})

document.querySelector('.fa-xmark').addEventListener('click', () => {
    document.querySelector('.left').style.left = '-130%'
})


//* Event listener for preloader 

function loader() {
    document.getElementById('loader').style.display = 'none';
}















