import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {}

  preload () {
    //
    // load your assets
    //
    this.load.image('background', 'assets/images/background.png')
    this.load.image('n1', 'assets/images/n1.png')
    this.load.image('n2', 'assets/images/n2.png')
    this.load.image('n3', 'assets/images/n3.png')
    this.load.image('n4', 'assets/images/n4.png')
    this.load.image('n5', 'assets/images/n5.png')

    this.load.image('n1empty', 'assets/images/n1Vide.png')
    this.load.image('n2empty', 'assets/images/n2Vide.png')
    this.load.image('n3empty', 'assets/images/n3Vide.png')
    this.load.image('n4empty', 'assets/images/n4Vide.png')
    this.load.image('n5empty', 'assets/images/n5Vide.png')

    this.load.image('play', 'assets/images/play.png')

    this.game.load.audio('gameMusic', ['assets/songs/Infernoplex/Infernoplex.mp3'])
    this.game.load.audio('failAfterStreak', ['assets/sounds/failAfterStreak.mp3'])
    this.game.load.audio('failed', ['assets/sounds/failed.mp3'])
    this.game.load.audio('failTooMuch', ['assets/sounds/failTooMuch.mp3'])
    this.game.load.audio('streak', ['assets/sounds/streak.mp3'])
  }

  create () {
    this.state.start('Game')
  }
}
