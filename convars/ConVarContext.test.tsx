/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConVarContext, ConVarProvider } from "./ConVarContext";
import { useContext } from "react";
import { useCheatState } from "./ConVarHooks";

// Todo: Upgrade this to use the stores.

// function FakeCheat() {
//   const [testing, setTesting] = useCheatState("testing", true);
//   const [hiddenCheat, setHiddenCheat] = useCheatState("hidden-cheat", "yo");
//   return <div role="cheat-display">testing: {testing ? "true" : "false"}</div>;
// }

// function FakeCheatDisplay() {
//   const { conVarMap: conVarMap, conVarDispatch: conVarDispatch } =
//     useContext(ConVarContext);
//   return (
//     <>
//       <div role="all-cheats">{JSON.stringify(conVarMap)}</div>
//       {Object.keys(conVarMap).map((name) => (
//         <button
//           role={`cheat-${name}`}
//           value={name}
//           key={name}
//           onClick={(e) => {
//             conVarDispatch({
//               type: "set",
//               payload: {
//                 key: name,
//                 value: false,
//               },
//             });
//           }}
//         />
//       ))}
//     </>
//   );
// }

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
