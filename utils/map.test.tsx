/**
 * @jest-environment jsdom
 */

import map from "./map";

describe("map test", () => {
  test("basic", async() => {
    expect(map(1, [0, 1], [2, 5])).toBe(5);
    expect(map(0.5, [0, 1], [2, 5])).toBe(3.5);
    expect(map(1, [1, 0], [2, 5])).toBe(2);
    expect(map(0, [1, 0], [2, 5])).toBe(5);
    expect(map(0, [1, 0], [5, 2])).toBe(2);
    expect(map(1.6, [1.2, 4], [40, 130])).toBe(2);
  });
})

// describe("cheats context", () => {
//   test("set cheat", async () => {
//     render(
//       <ConVarProvider>
//         <FakeCheat />
//         <FakeCheatDisplay />
//       </ConVarProvider>
//     );

//     expect(screen.getByRole("cheat-display").textContent).toBe("testing: true");
//     expect(screen.getByRole("all-cheats").textContent).toBe(
//       JSON.stringify({
//         testing: true,
//         "hidden-cheat": "yo",
//       })
//     );

//     await userEvent.click(screen.getByRole("cheat-testing"));

//     expect(screen.getByRole("cheat-display").textContent).toBe(
//       "testing: false"
//     );
//     expect(screen.getByRole("all-cheats").textContent).toBe(
//       JSON.stringify({
//         testing: false,
//         "hidden-cheat": "yo",
//       })
//     );

//     await userEvent.click(screen.getByRole("cheat-hidden-cheat"));

//     expect(screen.getByRole("cheat-display").textContent).toBe(
//       "testing: false"
//     );
//     expect(screen.getByRole("all-cheats").textContent).toBe(
//       JSON.stringify({
//         testing: false,
//         "hidden-cheat": false,
//       })
//     );
//   });
// });
