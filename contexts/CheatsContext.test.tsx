/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheatsContext, CheatsProvider, useCheatState } from "./CheatsContext";
import { useContext } from "react";

function FakeCheat() {
  const [testing, setTesting] = useCheatState("testing", true);
  const [hiddenCheat, setHiddenCheat] = useCheatState("hidden-cheat", "yo");
  return <div role="cheat-display">testing: {testing ? "true" : "false"}</div>;
}

function FakeCheatDisplay() {
  const { cheatsMap, cheatsDispatch } = useContext(CheatsContext);
  return (
    <>
      <div role="all-cheats">{JSON.stringify(cheatsMap)}</div>
      {Object.keys(cheatsMap).map((name) => (
        <button
          role={`cheat-${name}`}
          value={name}
          key={name}
          onClick={(e) => {
            console.log("hey");
            console.log(name);
            cheatsDispatch({
              type: "set",
              payload: {
                key: name,
                value: false,
              },
            });
          }}
        />
      ))}
    </>
  );
}

describe("cheats context", () => {
  test("set cheat", async () => {
    render(
      <CheatsProvider>
        <FakeCheat />
        <FakeCheatDisplay />
      </CheatsProvider>
    );

    expect(screen.getByRole("cheat-display").textContent).toBe("testing: true");
    expect(screen.getByRole("all-cheats").textContent).toBe(
      JSON.stringify({
        testing: true,
        "hidden-cheat": "yo",
      })
    );

    await userEvent.click(screen.getByRole("cheat-testing"));

    expect(screen.getByRole("cheat-display").textContent).toBe(
      "testing: false"
    );
    expect(screen.getByRole("all-cheats").textContent).toBe(
      JSON.stringify({
        testing: false,
        "hidden-cheat": "yo",
      })
    );

    await userEvent.click(screen.getByRole("cheat-hidden-cheat"));

    expect(screen.getByRole("cheat-display").textContent).toBe(
      "testing: false"
    );
    expect(screen.getByRole("all-cheats").textContent).toBe(
      JSON.stringify({
        testing: false,
        "hidden-cheat": false,
      })
    );
  });
});
