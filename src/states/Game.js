import Phaser from 'phaser'

const MidiConvert = require('midiconvert')
let music
let play
let notes
let hasStarted = false
let score
let streakText
const bottomLine = 549

let failAfterStreakAudio
let failedAudio
let failTooMuchAudio
let streakAudio
export default class extends Phaser.State {
  init () { }
  preload () {}

  notesGroupe = ''
  notesEmptyGroupe = ''

  n1Position = 31
  n2Position = 81
  n3Position = 131
  n4Position = 181
  n5Position = 231

  n1empty = 0
  n2empty = 0
  n3empty = 0
  n4empty = 0
  n5empty = 0

  score = 0
  streak = 0
  fail = 0

  addEmptyToGame () {
    this.notesEmptyGroupe = this.game.add.group()
    this.n1empty = this.notesEmptyGroupe.create(-100, 0, 'n1empty')
    this.n2empty = this.notesEmptyGroupe.create(-100, 0, 'n2empty')
    this.n3empty = this.notesEmptyGroupe.create(-100, 0, 'n3empty')
    this.n4empty = this.notesEmptyGroupe.create(-100, 0, 'n4empty')
    this.n5empty = this.notesEmptyGroupe.create(-100, 0, 'n5empty')
  }
  addKeyEvents () {
    const keyA = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
    const keyZ = this.game.input.keyboard.addKey(Phaser.Keyboard.Z)
    const keyI = this.game.input.keyboard.addKey(Phaser.Keyboard.I)
    const keyO = this.game.input.keyboard.addKey(Phaser.Keyboard.O)
    const keyP = this.game.input.keyboard.addKey(Phaser.Keyboard.P)
    const keyPause = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACE)
    keyA.onDown.add(() => this.onTap(this.n1empty, this.n1Position), this)
    keyA.onUp.add(() => this.onTapUp(this.n1empty), this)
    keyZ.onDown.add(() => this.onTap(this.n2empty, this.n2Position), this)
    keyZ.onUp.add(() => this.onTapUp(this.n2empty), this)
    keyI.onDown.add(() => this.onTap(this.n3empty, this.n3Position), this)
    keyI.onUp.add(() => this.onTapUp(this.n3empty), this)
    keyO.onDown.add(() => this.onTap(this.n4empty, this.n4Position), this)
    keyO.onUp.add(() => this.onTapUp(this.n4empty), this)
    keyP.onDown.add(() => this.onTap(this.n5empty, this.n5Position), this)
    keyP.onUp.add(() => this.onTapUp(this.n5empty), this)
    keyPause.onUp.add(() => {
      this.game.pause = this.game.pause ? !this.game.pause : true
      music.pause()
    }, this)
  }
  addPlayButton () {
    play = this.game.add.sprite(50, 100, 'play')
    play.inputEnabled = true
    play.input.useHandCursor = true
    play.events.onInputDown.add(this.startGame, this)
  }

  startGame () {
    music.play()
    play.kill()
    hasStarted = true
    this.notesGroupe.forEach(s => {
      s.body.velocity.y = 400
    })
  }

  addSong () {
    music = this.game.add.audio('gameMusic')
    failAfterStreakAudio = this.game.add.audio('failAfterStreak')
    failedAudio = this.game.add.audio('failed')
    failTooMuchAudio = this.game.add.audio('failTooMuch')
    streakAudio = this.game.add.audio('streak')
  }

  timeToPixel (time) {
    return 568 - (time * 400 / 1000)
  }

  onTap (what, whereX) {
    what.y = bottomLine
    what.x = whereX
    what.hitting = true
  }
  onTapUp (what) {
    what.y = -100
    what.x = 0
    if (what.hasHit) {
      if (this.streak % 25 === 0 && !streakAudio.isPlaying) streakAudio.play()
    } else {
      if (this.fail) failedAudio.play()
      if (this.fail && this.streak > 10) failAfterStreakAudio.play()
      if (this.fail > 10 && !failTooMuchAudio.isPlaying) failTooMuchAudio.play()
      this.fail += 1
      this.streak = 0
    }

    what.hasHit = false
  }

  createNotes (midi) {
    const notesMidi = midi.tracks[1].notes

    notes = notesMidi.reduce((p, c) => {
      if (c.time > 0) {
        let jam = (c.midi % 5)
        if (jam === 0) jam = 5
        const toAdd = {
          time: c.time,
          jam,
          duration: c.duration
        }
        if (p.length && p[p.length - 1].time === c.time) {
          return p
        }
        p.push(toAdd)
        return p
      }
      return p
    }, [])
      .map((n) => ({
        jam: n.jam,
        time: (Math.round(n.time * 1000) / 1000) * 1000,
        duration: n.duration,
        toHit: this[`n${n.jam}empty`]
      }))
    // notes = [notes[0], notes[1], notes[2], notes[3], notes[4], notes[5], notes[6]]
  }

  create () {
    score = this.game.add.text(400, 0, this.score)
    streakText = this.game.add.text(400, 100, this.streak)

    MidiConvert.load('../../assets/songs/Infernoplex/notes.mid', (midi) => {
      this.createNotes(midi)
      // J'ai les notes, il faut les sprites associés
      this.game.add.sprite(0, 0, 'background')

      this.notesGroupe = this.game.add.group()
      for (let index = 0; index < notes.length; index++) {
        const { jam, time } = notes[index]
        const s = this.notesGroupe.create(this[`n${jam}Position`], this.timeToPixel(time), `n${jam}`)
        s.checkWorldBounds = true
        s.events.onEnterBounds.add(() => {
          this.checkOverlap(s, this[`n${jam}empty`])
        })
        this.game.physics.enable(s, Phaser.Physics.ARCADE)
      }

      this.addSong()
      this.addEmptyToGame()
      this.addPlayButton()
      this.addKeyEvents()
    })
  }

  update = () => {}

  checkOverlap (s, nEmpty) {
    let hasHit = false

    const interval = setInterval(() => {
      if (s.y < 600 && s.y > 450) {
        var boundsA = s.getBounds()
        var boundsB = nEmpty.getBounds()
        hasHit = Phaser.Rectangle.intersects(boundsA, boundsB)
        if (hasHit && !nEmpty.hasHit) {
          clearInterval(interval)
          this.gotHit(s, nEmpty)
        }
      }
      if (s.y > 600) {
        clearInterval(interval)
      }
    }, 100)
  }

  gotHit (s, empty) {
    s.kill()
    this.score += 50
    this.fail = 0
    this.streak += 1
    if (this.streak > 10) { this.score += 50 }
    if (this.streak > 20) { this.score += 50 }
    streakText.setText(this.streak)
    empty.hasHit = true
    score.setText(this.score)
  }
}
