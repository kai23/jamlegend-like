import Phaser from 'phaser'

let n1, n2, n3, n4, n5
let n1empty, n2empty, n3empty, n4empty, n5empty

let play
let hasStarted = false

const bottomLine = 549

const n1Position = 31
const n2Position = 81
const n3Position = 131
const n4Position = 181
const n5Position = 231

export default class extends Phaser.State {
  init () { }
  preload () {}

  onTap (what, whereX) {
    what.y = bottomLine
    what.x = whereX
  }
  onTapUp (what) {
    what.y = -100
    what.x = 0
  }

  addEmptyToGame () {
    n1empty = this.game.add.sprite(-100, 0, 'n1empty')
    n2empty = this.game.add.sprite(-100, 0, 'n2empty')
    n3empty = this.game.add.sprite(-100, 0, 'n3empty')
    n4empty = this.game.add.sprite(-100, 0, 'n4empty')
    n5empty = this.game.add.sprite(-100, 0, 'n5empty')
  }
  addKeyEvents () {
    const keyA = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
    const keyZ = this.game.input.keyboard.addKey(Phaser.Keyboard.Z)
    const keyI = this.game.input.keyboard.addKey(Phaser.Keyboard.I)
    const keyO = this.game.input.keyboard.addKey(Phaser.Keyboard.O)
    const keyP = this.game.input.keyboard.addKey(Phaser.Keyboard.P)
    keyA.onDown.add(() => this.onTap(n1empty, n1Position), this)
    keyA.onUp.add(() => this.onTapUp(n1empty), this)
    keyZ.onDown.add(() => this.onTap(n2empty, n2Position), this)
    keyZ.onUp.add(() => this.onTapUp(n2empty), this)
    keyI.onDown.add(() => this.onTap(n3empty, n3Position), this)
    keyI.onUp.add(() => this.onTapUp(n3empty), this)
    keyO.onDown.add(() => this.onTap(n4empty, n4Position), this)
    keyO.onUp.add(() => this.onTapUp(n4empty), this)
    keyP.onDown.add(() => this.onTap(n5empty, n5Position), this)
    keyP.onUp.add(() => this.onTapUp(n5empty), this)
  }
  addPlayButton () {
    play = this.game.add.sprite(50, 100, 'play')
    play.inputEnabled = true
    play.input.useHandCursor = true
    play.events.onInputDown.add(this.startGame, this)
  }
  startGame () {
    n1 = this.game.add.sprite(n1Position, 0, 'n1')
    n2 = this.game.add.sprite(n2Position, 0, 'n2')
    n3 = this.game.add.sprite(n3Position, 0, 'n3')
    n4 = this.game.add.sprite(n4Position, 0, 'n4')
    n5 = this.game.add.sprite(n5Position, 0, 'n5')

    play.kill()
    this.game.physics.enable([n1, n1empty], Phaser.Physics.ARCADE)
    n1.body.velocity.y = 300
    hasStarted = true
  }

  create () {
    this.game.add.sprite(0, 0, 'background')
    this.addEmptyToGame()
    this.addPlayButton()
    this.addKeyEvents()
  }

  update () {
    if (hasStarted) {
      this.checkOverlap(n1, n1empty) && this.gotHit(n1)
      this.checkOverlap(n2, n2empty) && this.gotHit(n2)
      this.checkOverlap(n3, n3empty) && this.gotHit(n3)
      this.checkOverlap(n4, n4empty) && this.gotHit(n4)
      this.checkOverlap(n5, n5empty) && this.gotHit(n5)
    }
  }

  checkOverlap (spriteA, spriteB) {
    var boundsA = spriteA.getBounds()
    var boundsB = spriteB.getBounds()

    return Phaser.Rectangle.intersects(boundsA, boundsB)
  }

  gotHit () {
    console.log('Touché !')
  }
}
