import Phaser from 'phaser'

const MidiConvert = require('midiconvert')
let music
let play
let notes
let score
let streakText
const bottomLine = 549

let failAfterStreakAudio
let failedAudio
let failTooMuchAudio
let streakAudio
let missedNotes = 0

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
    this.notesEmptyGroupe.enableBody = true
    this.notesEmptyGroupe.physicsBodyType = Phaser.Physics.ARCADE
    this.n1empty = this.notesEmptyGroupe.create(this.n1Position, bottomLine, 'n1empty')
    this.n1empty.visible = false
    this.n1empty.exists = false
    this.n2empty = this.notesEmptyGroupe.create(this.n2Position, bottomLine, 'n2empty')
    this.n2empty.visible = false
    this.n2empty.exists = false
    this.n3empty = this.notesEmptyGroupe.create(this.n3Position, bottomLine, 'n3empty')
    this.n3empty.visible = false
    this.n3empty.exists = false
    this.n4empty = this.notesEmptyGroupe.create(this.n4Position, bottomLine, 'n4empty')
    this.n4empty.visible = false
    this.n4empty.exists = false
    this.n5empty = this.notesEmptyGroupe.create(this.n5Position, bottomLine, 'n5empty')
    this.n5empty.visible = false
    this.n5empty.exists = false
  }
  addKeyEvents () {
    const keyA = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
    const keyZ = this.game.input.keyboard.addKey(Phaser.Keyboard.Z)
    const keyI = this.game.input.keyboard.addKey(Phaser.Keyboard.I)
    const keyO = this.game.input.keyboard.addKey(Phaser.Keyboard.O)
    const keyP = this.game.input.keyboard.addKey(Phaser.Keyboard.P)
    const keyPause = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACE)
    keyA.onDown.add(() => this.onTap(this.n1empty), this)
    keyA.onUp.add(() => this.onTapUp(this.n1empty), this)
    keyZ.onDown.add(() => this.onTap(this.n2empty), this)
    keyZ.onUp.add(() => this.onTapUp(this.n2empty), this)
    keyI.onDown.add(() => this.onTap(this.n3empty), this)
    keyI.onUp.add(() => this.onTapUp(this.n3empty), this)
    keyO.onDown.add(() => this.onTap(this.n4empty), this)
    keyO.onUp.add(() => this.onTapUp(this.n4empty), this)
    keyP.onDown.add(() => this.onTap(this.n5empty), this)
    keyP.onUp.add(() => this.onTapUp(this.n5empty), this)
    keyPause.onUp.add(() => {
      this.game.pause = this.game.pause ? !this.game.pause : true
      music.paused = true
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
    this.notesGroupe.setAll('body.velocity.y', 400)
  }

  addSong () {
    music = this.game.add.audio('gameMusic')
    failAfterStreakAudio = this.game.add.audio('failAfterStreak')
    failedAudio = this.game.add.audio('failed')
    failTooMuchAudio = this.game.add.audio('failTooMuch')
    streakAudio = this.game.add.audio('streak')
  }

  timeToPixel (time) {
    return 550 - (time * 400 / 1000)
  }

  onTap (what) {
    what.exists = true
    what.visible = true
  }
  onTapUp (what) {
    what.visible = false
    what.exists = false
    if (what.hasHit) {
      if (this.streak % 25 === 0 && !streakAudio.isPlaying) streakAudio.play()
    } else {
      if (this.fail) failedAudio.play()
      if (this.streak > 10) failAfterStreakAudio.play()
      if (this.fail > 10 && !failTooMuchAudio.isPlaying) failTooMuchAudio.play()
      this.fail += 1
      this.updateStreak(0)
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
        duration: n.duration
      }))
      // .reduce((p, c) => {
      //   p[c.time] = { jam: c.jam, duration: c.duration }
      //   return p
      // }, {})
    console.log('notes', notes)

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
      this.notesGroupe.enableBody = true
      this.notesGroupe.physicsBodyType = Phaser.Physics.ARCADE

      for (let index = 0; index < notes.length; index++) {
        const { jam, time } = notes[index]
        const s = this.notesGroupe.create(this[`n${jam}Position`], this.timeToPixel(time), `n${jam}`)
        s.checkWorldBounds = true
        s.events.onEnterBounds.add(() => {
          s.events.onOutOfBounds.add(() => {
            missedNotes += 1
            this.updateStreak(0)
            s.kill()
          })
        })
        this.game.physics.enable(s, Phaser.Physics.ARCADE)
      }

      this.addSong()
      this.addEmptyToGame()
      this.addPlayButton()
      this.addKeyEvents()
    })
  }

  update = () => {
    if (music && music.currentTime) {
      // if (notes[music.currentTime]) {
      //   console.log('notes[music.currentTime].jam', notes[music.currentTime].jam)
      // }

      // score.setText(music.currentTime)
      this.game.physics.arcade.overlap(this.notesGroupe, this.notesEmptyGroupe, this.gotHit)
    }
  }

  gotHit = (s, empty) => {
    if (!empty.hasHit) {
      s.kill()
      this.score += 50
      this.fail = 0
      this.updateStreak(this.streak + 1)
      if (this.streak > 10) { this.score += 50 }
      if (this.streak > 20) { this.score += 50 }
      empty.hasHit = true
      score.setText(this.score)
    }
  }

  updateStreak = (value) => {
    this.streak = value
    streakText.setText(this.streak)
  }
}
