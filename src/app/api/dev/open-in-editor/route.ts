import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

type OpenEditorRequest = {
  file?: unknown;
  line?: unknown;
  column?: unknown;
};

function findVsCodeExecutable() {
  if (process.platform !== "win32") return "code";

  const localAppData = process.env.LOCALAPPDATA;
  const candidates = [
    localAppData &&
      path.join(localAppData, "Programs", "Microsoft VS Code", "Code.exe"),
    process.env.ProgramFiles &&
      path.join(process.env.ProgramFiles, "Microsoft VS Code", "Code.exe"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find(existsSync) ?? "code";
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const body = (await request.json()) as OpenEditorRequest;

  if (
    typeof body.file !== "string" ||
    typeof body.line !== "number" ||
    typeof body.column !== "number"
  ) {
    return new Response("잘못된 파일 위치입니다.", { status: 400 });
  }

  const projectRoot = path.resolve(process.cwd());
  const targetFile = path.resolve(body.file);
  const relativeFile = path.relative(projectRoot, targetFile);
  const isInsideProject =
    relativeFile !== "" &&
    !relativeFile.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativeFile);
  const isEditableSource = /\.(?:[cm]?[jt]sx?|s[ac]ss|css|mdx?)$/i.test(
    targetFile,
  );

  if (!isInsideProject || !isEditableSource || !existsSync(targetFile)) {
    return new Response("프로젝트 밖의 파일은 열 수 없습니다.", { status: 403 });
  }

  const line = Math.max(1, Math.trunc(body.line));
  const column = Math.max(1, Math.trunc(body.column));
  const editor = spawn(
    findVsCodeExecutable(),
    ["--goto", `${targetFile}:${line}:${column}`],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  editor.unref();

  return new Response(null, { status: 204 });
}
