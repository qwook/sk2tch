# Visual Novel Tool

Goals:

- Make it easy to save state.
- Make it editable by an external editor.
- Make it extendable with functions.

Draft 1:

```
{
  root: {
    text: "hello",
    choices: [
      { text: "yoo", jump: "tree1" }
    ]
  },
  tree1: {
    text: "yo",
    choices: [
      { text: "ayo", jump: "root" }
    ],
  }
}
```

Draft 2 (Action-based Design):

```
{
  root: [
    {action: "showText", text: "hello"}
    {action: "showChoice", choices: [
      { text: "yo", jump: "root" }
    ]}
  ]
}
```
