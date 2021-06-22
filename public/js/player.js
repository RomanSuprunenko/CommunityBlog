/* global fscreen */

// via https://github.com/substack/path-browserify/blob/master/index.js
//
// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
const splitPath = filename => splitPathRe.exec(filename).slice(1)

const dirname = path => {
    let result = splitPath(path)

    let root = result[0]
    let dir = result[1].slice(0, -1)

    return root + dir
}

const msToTime = s => {
    if (!s) s = 0
    s = Math.max(0, s)
    const addZ = n => (n < 10 ? '0' : '') + n

    s = Math.round(s / 1000)

    var secs = s % 60
    s = (s - secs) / 60
    var mins = s % 60
    var hrs = (s - mins) / 60
    if (hrs) {
        return hrs + ':' + addZ(mins) + ':' + addZ(secs)
    } else {
        return mins + ':' + addZ(secs)
    }
}

const boardDuration = (scene, board) =>
    board.duration != null
        ? Number(board.duration)
        : Number(scene.defaultBoardTiming)

const boardDurationWithAudio = (scene, board) =>
    Math.max(
        board.audio && board.audio.duration ? board.audio.duration : 0,
        boardDuration(scene, board)
    )

const sceneDuration = scene =>
    scene.boards
        .map(board => board.time + boardDurationWithAudio(scene, board))
        // ... sort numerically high to low
        .sort((a, b) => b - a)[0]

class StoryboarderPlayer {
    constructor({ element, scenePath }) {
        this.element = element
        this.scenePath = scenePath

        this.scene = undefined
        this.audioBufferByBoardId = {}
        this.audioSourceByBoardId = {}

        this.onKeyDown = this.onKeyDown.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onFullscreenChange = this.onFullscreenChange.bind(this)
        this.tick = this.tick.bind(this)

        this.sceneDirPath = dirname(this.scenePath)

        this.state = {}
        this.playTimer = undefined

        this.imgEl = this.element.querySelector('.player__img')

        this.transportEl = this.element.querySelector('.player-transport')
        this.playPauseEl = this.transportEl.querySelector('.player-transport__btn--playpause')
        this.fullscreenEl = this.transportEl.querySelector('.player-transport__fullscreen')

        this.startBtnEl = this.transportEl.querySelector('.player-transport__btn--start')
        this.prevBtnEl = this.transportEl.querySelector('.player-transport__btn--prev')
        this.nextBtnEl = this.transportEl.querySelector('.player-transport__btn--next')
        this.endBtnEl = this.transportEl.querySelector('.player-transport__btn--end')

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }

    async init() {
        try {
            await this.loadScene()

            // initial state
            await this.update({
                currBoardIndex: 0,
                playing: false,
                playCurrTime: 0
            })

            this.addEventListeners()
        } catch (err) {
            console.log(err)
            window.alert('Error loading Storyboard assets')
        }
    }

    async loadScene() {
        let response = await window.fetch(this.scenePath)
        if (response.ok) {
            this.scene = await response.json()

            for (let board of this.scene.boards) {
                if (board.audio) {
                    let response = await window.fetch(`${this.sceneDirPath}/${board.audio.filename}`)
                    let arrayBuffer = await response.arrayBuffer()
                    let audioBuffer = window.AudioContext
                        ? await this.audioCtx.decodeAudioData(arrayBuffer)
                        // HACK for Mobile Safari, which doesn't use promises for decodeAudioData apparently
                        : await new Promise((resolve, reject) => this.audioCtx.decodeAudioData(arrayBuffer, resolve, reject))
                    this.audioBufferByBoardId[board.uid] = audioBuffer
                    if (!board.audio.duration) {
                        console.log('adding missing board.audio.duration')
                        board.audio.duration = audioBuffer.duration * 1000
                    }
                }
            }
        } else {
            throw new Error(`Could not load ${this.scenePath}`)
        }
    }

    onKeyDown(event) {
        this.update({ playing: false })

        if (event.key === 'ArrowLeft') {
            event.preventDefault()
            this.update({
                currBoardIndex: this.state.currBoardIndex - 1
            })
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault()
            this.update({
                currBoardIndex: this.state.currBoardIndex + 1
            })
        }
    }

    onMouseDown(event) {
        let el = event.target

        if (el === this.playPauseEl) {
            event.preventDefault()
            this.update({
                playing: !this.state.playing
            })
        } else {
            // anywhere else should pause playback
            this.update({ playing: false })
        }

        if (el === this.imgEl) {
            event.preventDefault()
            let rect = el.getBoundingClientRect()
            let x = event.x - rect.left
            if (x / rect.width < 0.5) {
                this.update({ currBoardIndex: this.state.currBoardIndex - 1 })
            } else {
                this.update({ currBoardIndex: this.state.currBoardIndex + 1 })
            }
        }

        if (el === this.fullscreenEl) {
            event.preventDefault()
            if (fscreen.fullscreenElement) {
                fscreen.exitFullscreen()
            } else {
                fscreen.requestFullscreen(this.element)
            }
        }

        switch (el) {
            case this.startBtnEl:
                event.preventDefault()
                this.update({ currBoardIndex: 0 })
                break
            case this.prevBtnEl:
                event.preventDefault()
                this.update({ currBoardIndex: this.state.currBoardIndex - 1 })
                break
            case this.nextBtnEl:
                event.preventDefault()
                this.update({ currBoardIndex: this.state.currBoardIndex + 1 })
                break
            case this.endBtnEl:
                event.preventDefault()
                this.update({ currBoardIndex: this.scene.boards.length - 1 })
                break
        }
    }

    onFullscreenChange(event) {
        // TODO once we have resize detection triggering render,
        //      we could probably skip this handler

        // force update/render
        if (fscreen.fullscreenElement) {
            this.update()
        } else {
            this.update()
        }
    }

    addEventListeners() {
        document.addEventListener('keydown', this.onKeyDown)
        document.addEventListener('mousedown', this.onMouseDown)
        fscreen.addEventListener('fullscreenchange', this.onFullscreenChange)
    }

    _play() {
        // reset audio sources
        this.audioSourceByBoardId = {}

        this.playLastUpdate = Date.now()
        // this.update({ playCurrTime: 0 })
        this.playTimer = setInterval(this.tick, (1 / this.scene.fps) * 1000)
        this.tick()
    }

    _pause() {
        for (let audioSource of Object.values(this.audioSourceByBoardId)) {
            audioSource.stop()
        }
        clearInterval(this.playTimer)
    }

    tick() {
        let now = Date.now()
        let dt = now - this.playLastUpdate
        this.playLastUpdate = now

        this.update({ playCurrTime: this.state.playCurrTime + dt })
    }

    playAudio(board) {
        if (!this.audioSourceByBoardId[board.uid]) {
            let source = this.audioCtx.createBufferSource()
            let buffer = this.audioBufferByBoardId[board.uid]
            source.buffer = buffer
            source.connect(this.audioCtx.destination)
            source.start()
            this.audioSourceByBoardId[board.uid] = source
        }
    }

    async update(props = {}) {
        if (props.currBoardIndex != null) {
            // clamp
            let index = Math.min(Math.max(props.currBoardIndex, 0), this.scene.boards.length - 1)

            if (this.state.currBoardIndex !== index) {
                this.state.currBoardIndex = index
            }

            // update playhead
            this.update({ playCurrTime: this.scene.boards[this.state.currBoardIndex].time })
        }

        if (props.playCurrTime != null) {
            if (this.state.playCurrTime !== props.playCurrTime) {
                let lastBoard = this.scene.boards[this.scene.boards.length - 1]
                let sceneEndTime = lastBoard.time + boardDuration(this.scene, lastBoard)
                if (props.playCurrTime >= sceneEndTime) {
                    this.state.playCurrTime = sceneEndTime
                    await this.update({
                        playing: false
                    })
                    return
                }

                this.state.playCurrTime = props.playCurrTime

                // play sound
                let board = this.scene.boards[this.state.currBoardIndex]
                if (this.state.playing) {
                    if (board.audio) {
                        this.playAudio(board)
                    }
                }
            }

            let board = this.scene.boards[this.state.currBoardIndex]
            if (this.state.playCurrTime > board.time + boardDuration(this.scene, board)) {
                await this.update({ currBoardIndex: this.state.currBoardIndex + 1 })
            }
        }

        if (props.playing != null) {
            if (this.state.playing !== props.playing) {
                this.state.playing = props.playing
                if (this.state.playing) {
                    let lastBoard = this.scene.boards[this.scene.boards.length - 1]
                    let sceneEndTime = lastBoard.time + boardDuration(this.scene, lastBoard)

                    if (this.state.playCurrTime === sceneEndTime) {
                        await this.update({ currBoardIndex: 0 })
                    }

                    this._play()
                } else {
                    this._pause()
                }
            }
        }

        await this.render()
    }

    async render() {
        let board = this.scene.boards[this.state.currBoardIndex]

        this.playPauseEl.classList.toggle('player-transport__btn--paused', !this.state.playing)
        this.playPauseEl.classList.toggle('player-transport__btn--playing', this.state.playing)
        this.playPauseEl.querySelector('svg use').setAttribute(
            'xlink:href',
            this.playPauseEl.querySelector('svg use').getAttribute('xlink:href').split('#')[0] +
            (this.state.playing
                ? '#icon-pause'
                : '#icon-play'))

        if (fscreen.fullscreenElement) {
            this.element.classList.add('player--is-full-screen')
        } else {
            this.element.classList.remove('player--is-full-screen')
        }

        if (this.imgEl.src !== `${this.sceneDirPath}/${board.url}`) {
            this.imgEl.src = `${this.sceneDirPath}/${board.url}`

            // preload 3 boards ahead
            for (let i = 1; i <= 3; i++) {
                let b = this.scene.boards[this.state.currBoardIndex + i]
                if (b) {
                    let img = new window.Image()
                    img.src = `${this.sceneDirPath}/${b.url}`
                }
            }
        }

        let positionEl = this.transportEl.querySelector('.player-transport__position')
        let position = `${this.state.currBoardIndex + 1}<span>/</span>${(this.scene.boards.length - 1) + 1}`
        if (positionEl.innerHTML !== position) {
            positionEl.innerHTML = position
        }

        let timeEl = this.transportEl.querySelector('.player-transport__time')
        let time = msToTime(board.time)
        if (timeEl.innerHTML !== time) {
            timeEl.innerHTML = time
        }

        let durationEl = this.transportEl.querySelector('.player-transport__duration')
        let duration = msToTime(sceneDuration(this.scene))
        if (durationEl.innerHTML !== duration) {
            durationEl.innerHTML = duration
        }

        let meterEl = this.element.querySelector('.player-progress__meter')

        let pctBoardsComplete = this.state.currBoardIndex / (this.scene.boards.length - 1)
        meterEl.style.width = `${pctBoardsComplete * 100}%`

        // let pctTimeComplete = this.state.playCurrTime / (this.scene.boards[this.scene.boards.length - 1].time + boardDuration(this.scene, this.scene.boards[this.scene.boards.length - 1]))
        // meterEl.style.width = `${pctTimeComplete * 100}%`
    }
}
