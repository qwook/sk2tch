import { useEffect, useRef } from "react";

export function CustomCursor({ children }) {
  const cursor = useRef();

  useEffect(() => {
    const mouseMove = (e) => {
      console.log(e);
      console.log(e.clientX);
      console.log(e.clientY);
      if (!cursor.current) return;
      cursor.current.style.top = e.clientY + "px";
      cursor.current.style.left = e.clientX + "px";
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  });

  return (
    <div>
      <div
        className="custom-cursor"
        style={{
          zIndex: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: "none",
        }}
      >
        {children}
      </div>
      <div
        style={{
          zIndex: 2,
          position: "absolute",
          top: 0,
          left: 0,
          width: 200,
          height: 200,
          textAlign: "left",
          pointerEvents: "none",
          userSelect: "none",
        }}
        ref={cursor}
      >
        Cursor Here!
      </div>
    </div>
  );
}
