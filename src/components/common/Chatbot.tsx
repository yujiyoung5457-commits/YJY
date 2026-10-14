"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./Chatbot.module.scss";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "궁금한 것을 물어보세요😊",
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messageRef.current?.scrollTo({
      top: messageRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  // useEffect(() => {
  //   const openChatbot = () => setOpen(true);
  //   window.addEventListener("open-portfolio-chatbot", openChatbot);
  //   return () =>
  //     window.removeEventListener("open-portfolio-chatbot", openChatbot);
  // }, []);
  //다시 토글하면 닫힘
  useEffect(() => {
  const toggleChatbot = () => setOpen((prev) => !prev);

  window.addEventListener("open-portfolio-chatbot", toggleChatbot);

  return () =>
    window.removeEventListener("open-portfolio-chatbot", toggleChatbot);
}, []);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: trimmedQuestion },
    ]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "답변 요청에 실패했습니다.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer ?? "답변을 생성하지 못했어요.",
        },
      ]);
    } catch (error) {
      console.error("가이드 챗봇 오류", error);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatbot}>
      {open && (
        <section className={styles.panel} aria-label="포트폴리오 가이드 챗봇">
          <header className={styles.header}>
            <h2>Portfolio Guide</h2>
            <button
              type="button"
              className={styles.headerClose}
              onClick={() => setOpen(false)}
              aria-label="챗봇 닫기"
            >
              ×
            </button>
          </header>

          <div
            className={styles.messages}
            ref={messageRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((item, index) => (
              <p
                key={`${item.role}-${index}`}
                className={
                  item.role === "user" ? styles.userMessage : styles.answer
                }
              >
                {item.content}
              </p>
            ))}
            {loading && <p className={styles.answer}>답변을 찾고 있어요…</p>}
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={loading}
              maxLength={500}
              placeholder="메시지를 입력하세요..."
              aria-label="챗봇 질문 입력"
            />
            <button
              type="submit"
              className={styles.send}
              disabled={loading || !question.trim()}
              aria-label="질문 보내기"
            >
              ▲
            </button>
          </form>
        </section>
      )}

    </div>
  );
}
