export interface DialogueNode {
  them: (state: any) => string;
  choices: (state: any) => DialogueChoice[];
  event?: string;
}

export interface DialogueChoice {
  me: (state: any) => string;
  next: (state: any) => DialogueNode;
}

type VisualNovelCallback = (arg: {
  text: string;
  choices: Array<{ text: string; id: number }>;
  choiceText?: string; // The text of the last choice made.
  event?: string;
}) => void;

export class VisualNovel2 {
  root: DialogueNode;
  state: any;
  cb: VisualNovelCallback;

  constructor(root: DialogueNode) {
    this.root = root;
    this.state = {};
  }

  // Sends the first message (from the NPC).
  start() {
    this.cb({
      text: this.root.them(this.state),
      choices: this.root.choices(this.state).map((choice, idx) => {
        return {
          text: choice.me(this.state),
          id: idx,
        };
      }),
    });
  }

  // Chooses a response from the list of responses.
  choose(idx) {
    const choiceText = this.root.choices(this.state)[idx].me(this.state);
    this.root = this.root.choices(this.state)[idx].next(this.state);
    this.cb({
      choiceText: choiceText,
      event: this.root.event,
      text: this.root.them(this.state),
      choices: this.root.choices(this.state).map((choice, idx) => {
        return {
          text: choice.me(this.state),
          id: idx,
        };
      }),
    });
  }

  // Sets the function that will be called when a message
  // is "received" from the NPC.
  setCallback(cb: VisualNovelCallback) {
    this.cb = cb;
  }
}
