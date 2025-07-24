/**
 * Visual Novel
 *
 * A class used to help with consuming a dialogue tree.
 */

/*

Example dialogue tree:

export const PenguinChatRoot = {
  them: () => "hellooo world, any1 out there?? >.>",
  choices: () => [
    {
      me: () => "hehe hi",
      next: () => PenguinChat1,
    },
    {
      me: () => "yo!!!!",
      next: () => PenguinChat1,
    },
    {
      me: () => "ummm bye",
      next: () => ({
        them: () => "HEYYY com back",
        choices: () => [
          {
            me: () => "lolk",
            next: () => PenguinChat1,
          },
          {
            me: () => "okokok",
            next: () => PenguinChat1,
          },
          {
            me: () => "o__O",
            next: () => PenguinChat1,
          },
        ],
      }),
    },
  ],
};

The dialogue tree structure is designed this way to
allow for dynamic responses.

I originally made this because I did not want to have
to deal with heavier dialogue engines or having to
create a GUI for defining dialogue trees.

It was perfect for LSO's puzzle that involved
selecting dialogue based on a specific order.

There are a lot of issues with this though, such that
you cannot recover the previous state of the dialogue
since it isn't serializable. And since this isn't
stored as a JSON, reading and manipulating it from
a tool is way more difficult.

*/

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

export class VisualNovel {
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
