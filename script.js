console.log(`Let's write javascript`);
let currentsong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${parseInt(formattedMinutes)}:${parseInt(formattedSeconds)}`;
}

function getCurrentTimeAndDuration() {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
    const durationInSeconds = 150; // Replace this with the actual duration in seconds

    const currentTime = formatTime(currentTimeInSeconds);
    const duration = formatTime(durationInSeconds);

    return { currentTime, duration };
}




async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500${folder}/`)
    let response = await a.text()
    let divs = document.createElement("div")
    divs.className = "songa"
    divs.innerHTML = response;
    let as = divs.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const itera of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="music.svg" class="invert" alt="">
        <div class="info">
            <div>${itera.replaceAll("%20", " ")}</div>
            <div>Artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img src="play.svg" class="invert imgplay" alt="">
        </div>
    </li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", elements => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
            playsong.src = "pause.svg"
        })
    });

    return songs;
}

const playMusic = (track, play = false) => {
    // let audio= new Audio("/songs/" + track)
    currentsong.src = `${currFolder}/` + track
    if (!play) {
        currentsong.play()
        playsong.src = "pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    // document.querySelector(".songTime").innerHTML= "00:00/00:00"

}

async function displayAulbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let divs = document.createElement("div")

    let anchors = divs.getElementsByTagName("a")
    divs.className = "songa"
    divs.innerHTML = response;
    
    console.log(anchors);
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            console.log(e.href)
            // console.log(e.href.split("/").slice(-2)[0]);
            let folder = e.href.split("/").slice(-2)[1];
            console.log(e.href.split("/").slice(-1)[0]);
            
            
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + 
            `<div data-folder="${folder}" class="card">
             <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" viewBox="0 0 24 24"
                    fill="#fff">
                    <rect x="1" y="1" width="22" height="22" rx="11" ry="11" fill="#00FF00" />
                    <path d="M7 18V6L17 12L7 18Z" fill="#000000" transform="translate(2, 0)" />
                </svg>
            </div>
            <img src="http://127.0.0.1:5500/songs/${folder}/cover.jpeg" alt="" />
            <h2>${response.title}</h2>
            <p>${response.description}.</p>
        </div>`


        }
    }

     //load the plalist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e => {

        e.addEventListener("click", async item => {
            songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            
        })

    });
    
}


async function main() {
   await getSongs("/songs/ncs")
    playMusic(songs[0], true)

    displayAulbums()




    //to update time and duration
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".pointer").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

    })



    playsong.addEventListener("click", elements => {
        if (currentsong.paused) {
            currentsong.play()
            playsong.src = "pause.svg"
        } else {
            currentsong.pause()
            playsong.src = "playsngbutton.svg"
        }
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".pointer").style.left = percent + "%";
        currentsong.currentTime = currentsong.duration * (percent) / 100

    })

    //for hamburger options in mobile phone
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = -100 + "%";
    })




    //to get previous song
    pervioussong.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split(`${currFolder}/`)[1])
        if (index - 1 >= 0) {

            playMusic(songs[index - 1])
        }

    })

    //to get next song
    nextssong.addEventListener("click", () => {
        currentsong.pause()
        console.log(songs);
        
        let index = songs.indexOf(currentsong.src.split(`${currFolder}/`)[1])
        if (index + 1 < songs.length) {

            playMusic(songs[index + 1])
        }

    })

    //add event listener to volume change
    volbar.addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100

    })

    // add event listener to mute the songs
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentsong.volume=0
        volbar.value=0;
    }else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume=0.6
            volbar.value=50;
        }
    })


}
main()



