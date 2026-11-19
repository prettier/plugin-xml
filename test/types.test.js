import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("XML options augment Prettier's Options", () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL("../node_modules/typescript/lib/tsc.js", import.meta.url)
      ),
      "--project",
      fileURLToPath(new URL("./types/tsconfig.json", import.meta.url))
    ],
    { encoding: "utf8" }
  );

  expect({
    status: result.status,
    output: result.stdout + result.stderr
  }).toEqual({
    status: 0,
    output: ""
  });
});
