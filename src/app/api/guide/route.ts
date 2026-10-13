import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

export const runtime = "nodejs";

type GuideSection = {
  text: string;
  title: string;
  keywords: string[];
};

const normalize = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}+#]/gu, "");

const tokenize = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .match(/[\p{L}\p{N}+#.]+/gu)
    ?.filter((word) => word.length >= 2) ?? [];

const parseSections = (guideText: string): GuideSection[] =>
  guideText
    .split(/(?=^\[\d{2}\.\s.+\]\s*$)/gm)
    .map((text) => text.trim())
    .filter((text) => /^\[\d{2}\./.test(text))
    .map((text) => ({
      text,
      title:
        text.match(/^대표\s*명칭:\s*(.+)$/m)?.[1]?.trim() ??
        text.match(/^\[\d{2}\.\s*(.+)\]$/m)?.[1]?.trim() ??
        "",
      keywords:
        text
          .match(/^관련\s*표현:\s*(.+)$/m)?.[1]
          ?.split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean) ?? [],
    }));

const scoreSection = (question: string, section: GuideSection) => {
  const normalizedQuestion = normalize(question);
  const normalizedSection = normalize(section.text);
  const questionWords = [...new Set(tokenize(question))];
  let score = 0;

  const phrases = [section.title, ...section.keywords]
    .map(normalize)
    .filter(Boolean);

  for (const phrase of phrases) {
    if (normalizedQuestion.includes(phrase)) {
      score += 80 + phrase.length;
    }
  }

  for (const word of questionWords) {
    const normalizedWord = normalize(word);
    if (normalizedWord && normalizedSection.includes(normalizedWord)) {
      score += Math.min(16, normalizedWord.length * 2);
    }
  }

  if (
    normalizedQuestion.length >= 4 &&
    normalizedSection.includes(normalizedQuestion)
  ) {
    score += 120;
  }

  return score;
};

const searchGuide = (question: string, guideText: string) => {
  const sections = parseSections(guideText);
  const commonRule =
    sections.find((section) => section.text.startsWith("[00."))?.text ?? "";

  const selected = sections
    .filter((section) => !section.text.startsWith("[00."))
    .map((section) => ({
      text: section.text,
      score: scoreSection(question, section),
    }))
    .filter((section) => section.score >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((section) => section.text);

  return {
    found: selected.length > 0,
    context: [commonRule, ...selected].filter(Boolean).join("\n\n"),
  };
};

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const question =
      typeof body === "object" && body !== null && "question" in body
        ? (body as { question?: unknown }).question
        : undefined;

    if (typeof question !== "string" || !question.trim()) {
      return Response.json({ error: "질문을 입력해 주세요." }, { status: 400 });
    }

    if (question.length > 500) {
      return Response.json(
        { error: "질문은 500자 이내로 입력해 주세요." },
        { status: 400 },
      );
    }

    const guidePath = path.join(
      process.cwd(),
      "public",
      "data",
      "myChatBot.txt",
    );
    const guideText = await readFile(guidePath, "utf8");
    const searchResult = searchGuide(question.trim(), guideText);

    if (!searchResult.found) {
      return Response.json({
        answer:
          "제공된 포트폴리오 자료에서는 해당 내용을 확인하기 어려워요. 제작자 소개, 기술, 프로젝트 또는 협업 경험을 질문해 주세요.",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 503 },
      );
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      store: false,
      max_output_tokens: 350,
      instructions: `당신은 유지영의 포트폴리오 안내 챗봇입니다.
아래 검색 자료에 적힌 사실만 사용해 방문자의 질문에 답하세요.

답변 규칙:
- 자료에 없는 경력, 기능, 수치, 링크는 추측하거나 만들어내지 않습니다.
- 팀 프로젝트에서는 제작자 본인의 담당 범위와 팀 전체 결과를 구분합니다.
- 개인정보나 확인되지 않은 내용은 답하지 않습니다.
- 자연스럽고 친절한 한국어로 핵심만 2~5문장으로 답합니다.
- 질문과 무관한 정보는 덧붙이지 않습니다.

[검색된 포트폴리오 안내 자료]
${searchResult.context}`,
      input: question.trim(),
    });

    const answer = response.output_text.trim();
    return Response.json({
      answer:
        answer || "답변을 만들지 못했어요. 질문을 조금 다르게 입력해 주세요.",
    });
  } catch (error) {
    console.error("포트폴리오 가이드 챗봇 오류", error);
    return Response.json(
      { error: "AI 답변 생성에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
