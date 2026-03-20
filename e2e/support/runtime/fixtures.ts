import * as fs from "node:fs";
import * as path from "node:path";

const fixturesDir = path.resolve(process.cwd(), "e2e/fixtures");
const testFile = path.join(fixturesDir, "test.md");
const openDialogTargetFile = path.join(fixturesDir, "open-dialog-target.md");
const sampleImage = path.join(fixturesDir, "sample.png");
const sampleImageBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pF8nKQAAAAASUVORK5CYII=",
  "base64"
);

export function ensureFixturesDir(): void {
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
}

export function writeDeterministicFixtures(): void {
  const initialFixtureContent = `# Test Markdown

This is a **test** document.

- Item 1
- Item 2

OPEN_FILE_INITIAL_FIXTURE
`;

  const targetFixtureContent = `# Target Test Document

OPEN_FILE_TARGET_FIXTURE

This is the target document selected from the Open File dialog.
`;

  fs.writeFileSync(testFile, initialFixtureContent);
  fs.writeFileSync(openDialogTargetFile, targetFixtureContent);
  fs.writeFileSync(sampleImage, sampleImageBuffer);
}
