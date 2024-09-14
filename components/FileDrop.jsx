import { useEffect } from "react";

export function DragAndDrop({ onDropJsonFile }) {
  useEffect(() => {
    const dragover = (e) => {
      var dt = e.dataTransfer;
      if (
        dt.types &&
        (dt.types.indexOf
          ? dt.types.indexOf("Files") !== -1
          : dt.types.contains("Files"))
      ) {
        e.preventDefault();
        console.log(dt.types);
      }
    };
    document.addEventListener("dragover", dragover);

    const drop = async (e) => {
      console.log(e);
      e.preventDefault();

      if (e.dataTransfer.items && e.dataTransfer.items.length === 1) {
        // Use DataTransferItemList interface to access the file(s)
        const item = e.dataTransfer.items[0];
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file.name.endsWith(".jsonc")) {
            console.log(await file.text());
            onDropJsonFile(await file.text());
          }
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
        const file = e.dataTransfer.files[0];
        console.log(file.name);
        if (file.name.endsWith(".jsonc")) {
          console.log(await file.text());
          onDropJsonFile(await file.text());
        }
      }
    };
    document.addEventListener("drop", drop);

    return () => {
      document.removeEventListener("dragover", dragover);
      document.removeEventListener("drop", drop);
    };
  }, [onDropJsonFile]);

  return <></>;
}
