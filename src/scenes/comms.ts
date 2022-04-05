import { SceneWorld } from "./world";

export class SceneComms extends Phaser.Scene {
  declare sceneWorld: SceneWorld;

  constructor() {
    super("comms");
  }

  create(data: { sceneWorld: SceneWorld }) {
    this.sceneWorld = data.sceneWorld;

    //this.createSpeechBubble(70, 400, 250, 100, "“And now you're a boss, too... of this pile of rubble.”", 5000);
    [
      "Hi captain! I hope you woke up well",
      "We got stuck in this planet, I lost my energy cells",
      "Can you pick them and charge them? (Use 'SPACE')",
      "Don't forget to keep yourself warm... maybe you will need the walls",
      "...and don't go too far, I can't fetch you from very far",
    ].forEach((message, i) => {
      this.time.delayedCall(i * 6000, () => {
        this.createSpeechBubble(70, 400, 250, 100, `”${message}”`, 5000);
      });
    });

    this.events.on("messages", (messages: string[]) => {
      messages.forEach((message, i) => {
        this.time.delayedCall(i * 6000, () => {
          this.createSpeechBubble(70, 400, 250, 100, `”${message}”`, 5000);
        });
      });
    });

    this.events.on("win_messages", (messages: string[]) => {
      this.time.delayedCall(10000, () => {
        this.createSpeechBubble(70, 400, 250, 100, `”${messages[1]}”`, 99999);
      });

      this.createSpeechBubble(70, 400, 250, 100, `”${messages[0]}”`, 9000);
    });
  }

  createSpeechBubble(x: number, y: number, width: number, height: number, quote: string, lifetime: number) {
    var bubbleWidth = width;
    var bubbleHeight = height;
    var bubblePadding = 10;
    var arrowHeight = bubbleHeight / 4;

    var bubble = this.add.graphics({ x: x, y: y });

    //  Bubble shadow
    bubble.fillStyle(0x222222, 0.5);
    bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
    bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
    bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
    bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
    var point1X = Math.floor(bubbleWidth / 7);
    var point1Y = bubbleHeight;
    var point2X = Math.floor((bubbleWidth / 7) * 2);
    var point2Y = bubbleHeight;
    var point3X = Math.floor(bubbleWidth / 7);
    var point3Y = Math.floor(bubbleHeight + arrowHeight);

    //  Bubble arrow shadow
    bubble.lineStyle(4, 0x222222, 0.5);
    bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

    //  Bubble arrow fill
    bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
    bubble.lineStyle(2, 0x565656, 1);
    bubble.lineBetween(point2X, point2Y, point3X, point3Y);
    bubble.lineBetween(point1X, point1Y, point3X, point3Y);

    var content = this.add.text(0, 0, quote, {
      fontFamily: "Fjalla One",
      fontSize: "20px",
      color: "#000000",
      align: "center",
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });

    var b = content.getBounds();

    content.setPosition(bubble.x + bubbleWidth / 2 - b.width / 2, bubble.y + bubbleHeight / 2 - b.height / 2);

    this.time.delayedCall(lifetime, () => {
      bubble.destroy();
      content.destroy();
    });
  }
}
