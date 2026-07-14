import { STANDALONE_APP } from "../utils/defines";

export default function Anchor({ href, children, ...props }) {
  return STANDALONE_APP ? (
    <a
      href="#"
      rel="noreferrer"
      onClick={(e) => {
        e.preventDefault();
        window?.electronAPI?.steamworks?.overlay.activateToWebPage(href);
      }}
      {...props}
      className={["cursor-pointer", props.className].join(" ")}
    >
      {children}
    </a>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...props}
      className={["cursor-pointer", props.className].join(" ")}
    >
      {children}
    </a>
  );
}
