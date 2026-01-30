export const ECS_POS = {
  RESET: "\x1B\x40",
  ALIGN_LEFT: "\x1B\x61\x00",
  ALIGN_CENTER: "\x1B\x61\x01",
  ALIGN_RIGHT: "\x1B\x61\x02",
  BOLD_ON: "\x1B\x45\x01",
  BOLD_OFF: "\x1B\x45\x00",
  TEXT_NORMAL: "\x1D\x21\x00",
  TEXT_DOUBLE_HEIGHT: "\x1D\x21\x01",
  TEXT_DOUBLE_WIDTH: "\x1D\x21\x10",
  TEXT_DOUBLE: "\x1D\x21\x11",
  CUT: "\x1D\x56\x41\x00",
};

export interface PrinterConfig {
  paperWidth: "58mm" | "80mm";
  charsPerLine?: number;
  chunkSize?: number;
}

export class PrinterEncoder {
  private buffer: number[] = [];
  private encoder = new TextEncoder();
  private config: PrinterConfig;

  constructor(config: PrinterConfig = { paperWidth: "58mm" }) {
    this.config = config;
    if (!this.config.charsPerLine) {
       this.config.charsPerLine = this.config.paperWidth === "80mm" ? 48 : 32;
    }
    this.reset();
  }

  reset() {
    this.buffer = [];
    this.addCommand(ECS_POS.RESET);
  }

  private addCommand(command: string) {
    for (let i = 0; i < command.length; i++) {
      this.buffer.push(command.charCodeAt(i));
    }
  }

  text(text: string) {
    const encoded = this.encoder.encode(text);
    encoded.forEach((byte) => this.buffer.push(byte));
  }

  newline(count = 1) {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0a);
    }
  }

  line(text: string) {
    this.text(text);
    this.newline();
  }

  separator(char = "-") {
    const width = this.config.charsPerLine || 32;
    this.line(char.repeat(width));
  }

  row(left: string, right: string) {
    const width = this.config.charsPerLine || 32;
    const leftLen = left.length;
    const rightLen = right.length;
    // Ensure we have at least 1 space
    const spaceLen = Math.max(1, width - leftLen - rightLen);
    
    this.text(left);
    this.text(" ".repeat(spaceLen));
    this.line(right);
  }

  align(alignment: "left" | "center" | "right") {
    switch (alignment) {
      case "left":
        this.addCommand(ECS_POS.ALIGN_LEFT);
        break;
      case "center":
        this.addCommand(ECS_POS.ALIGN_CENTER);
        break;
      case "right":
        this.addCommand(ECS_POS.ALIGN_RIGHT);
        break;
    }
  }

  bold(enabled: boolean) {
    this.addCommand(enabled ? ECS_POS.BOLD_ON : ECS_POS.BOLD_OFF);
  }

  size(size: "normal" | "large") {
    this.addCommand(size === "large" ? ECS_POS.TEXT_DOUBLE : ECS_POS.TEXT_NORMAL);
  }

  cut() {
    this.newline(3); // Feed paper a bit before cutting
    this.addCommand(ECS_POS.CUT);
  }

  encode(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}