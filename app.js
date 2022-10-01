const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const playList = $('.playlist');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('.progress');
const nextBtn = $('.btn-next');
const preBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const PLAYER_STORAGE_SETTING = 'Config_player';

const app = {
    currentIndex : 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_SETTING)) || {},
    songs: [
        {
            name: "In My Head",
            author: "Bred Room",
            path: "./mp3/y2mate.com - bedroom  in my head.mp3",
            img: "./image/inmyhead.PNG"       
        },
        {
            name: "Black Out Days",
            author: "Phantogram",
            path: "./mp3/y2mate.com - Black Out Days Slowed.mp3",
            img: "./image/blackoutday.PNG"  
        },
        {
            name: "Middle Of The Night",
            author: "Elley Duhé",
            path: "./mp3/y2mate.com - Elley Duhé  Middle of the Night slowed  Reverb.mp3",
            img: "./image/middleofthenight.PNG"       
        },
        {
            name: "Home X Another Love",
            author: "Broken Sad",
            path: "./mp3/y2mate.com - Home X Another Love  broken sad.mp3",
            img: "./image/homexanotherlove.PNG"       
        },
        {
            name: "Harley In Hawaii",
            author: "Katy Perry",
            path: "./mp3/y2mate.com - katy perry  harleys in hawaii s l o w e d.mp3",
            img: "./image/harleyinhawaii.PNG"       
        },
        {
            name: "Murder In My Mind",
            author: "KordHell",
            path: "./mp3/y2mate.com - KORDHELL  MURDER IN MY MIND.mp3",
            img: "./image/murderinmymind.PNG"       
        },
        {
            name: "One Kiss",
            author: "Dua Lipa",
            path: "./mp3/y2mate.com - One Kiss  Calvin Harris Dua Lipa slowedreverb  MusicSaga.mp3",
            img: "./image/onekiss.PNG"       
        },
        {
            name: "Move Your Body",
            author: "Öwnboss Sevek",
            path: "./mp3/y2mate.com - Öwnboss Sevek  Move Your Body Razihel Remix Official Audio.mp3",
            img: "./image/moveyourbody.PNG"       
        },
        {
            name: "Past Lives",
            author: "Sapientdream",
            path: "./mp3/y2mate.com - sapientdream  past lives lyrics.mp3",
            img: "./image/pastlive.PNG"       
        },
        {
            name: "Sweater Weather",
            author: "The Neighbourhood",
            path: "./mp3/sweaterweather.mp3",
            img: "./image/sweaterweather.PNG"       
        },
    ],
    setConfig: function(key,value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_SETTING, JSON.stringify(this.config))
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    render: function(){
        const htmls = this.songs.map((song,index) =>{
           return ` <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                        <div class="thumb" style="background-image: url('${song.img}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.author}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div> 
                    </div>`
        })
        playList.innerHTML = htmls.join('');
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;
        //Scroll
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        }

        //Rotate cd
        const cdRotateAnimate = cdThumb.animate([
            {
                transform : 'rotate(360deg)'
            }], {
                duration : 10000, //10s
                iterations : Infinity
            }
        
        )
        cdRotateAnimate.pause()
        //Play, pause song
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            } else {
                audio.play();      
            }
        }

        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdRotateAnimate.play()
        }

        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdRotateAnimate.pause()
        }

        audio.ontimeupdate = function(){
            if(audio.duration){
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
            progress.value = progressPercent;
            }
        }

        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;    
        }

        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }
            else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
             //Scroll to Song playing
            _this.scrollToActiveSong();
        }
        
        preBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }
            else{
                _this.preSong();
            }
            audio.play();
            _this.render();
             //Scroll to Song playing
            _this.scrollToActiveSong();
        }

        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom);
        }

        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            } else{
                nextBtn.onclick()
            }
        }

        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode && !e.target.closest('.option')){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index) 
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }

    },
    scrollToActiveSong: function(){
        if(this.currentIndex > 4){
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block : 'nearest'
                })
            }, 200);
        } else{
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block : 'center'
                })
            }, 200);
        }
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path     
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    preSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    randomSong: function(){
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function(){
        //Load Config player
        this.loadConfig();

        //Dinh nghia thuoc tinh cho Object
        this.defineProperties();

        //Xu ly su kien
        this.handleEvents();

        //load bai hat hien tai
        this.loadCurrentSong();
        
        //Render Playlist
        this.render();
        
        //Hiển thị trạng thái ban đầu repeat & random button
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    }
    
}
app.start();