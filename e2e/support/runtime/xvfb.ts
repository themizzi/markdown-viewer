import { spawn, type ChildProcess } from "node:child_process";

let xvfbProcess: ChildProcess | undefined;

export function startXvfbIfNeeded(): void {
  if (process.platform !== "linux") {
    return;
  }

  if (process.env.HEADLESS !== "true") {
    return;
  }

  if (xvfbProcess) {
    return;
  }

  xvfbProcess = spawn("Xvfb", [":99", "-screen", "0", "1280x1024x24"], {
    stdio: "ignore",
    detached: true,
  });

  xvfbProcess.unref();
  process.env.DISPLAY = ":99";
}

export function stopXvfbIfStarted(): void {
  if (!xvfbProcess?.pid) {
    return;
  }

  try {
    process.kill(-xvfbProcess.pid, "SIGTERM");
  } catch {
    try {
      process.kill(xvfbProcess.pid, "SIGTERM");
    } catch {
      // best-effort cleanup
    }
  }

  xvfbProcess = undefined;
}
