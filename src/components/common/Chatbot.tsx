"use client";

import { useState, useEffect, useRef } from "react";
import styles from './Chatbot.module.scss'

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "안녕하세요! 홈페이지 이용 방법을 안내해 드릴게요.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const messageRef = useRef<HTMLDivElement | null>(null);

  // 질문 전송
  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    // 사용자 메시지 추가
    setMessage((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      // Next.js API Route로 질문 전달
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "답변 요청에 실패했습니다."
        );
      }

      // OpenAI 답변 추가
      const botMessage: ChatMessage = {
        role: "assistant",
        content:
          data.answer || "답변을 생성하지 못했습니다.",
      };

      setMessage((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("가이드 챗봇 오류:", err);

      setMessage((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 메시지가 추가되면 아래로 자동 스크롤
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop =
        messageRef.current.scrollHeight;
    }
  }, [message, loading]);

  return (
    <div className={styles.chatbot}>
      {/* 챗봇 대화창 */}
      {open && (
        <section
          className={styles.panel}
          aria-label="홈페이지 가이드 챗봇"
        >
          {/* 상단 헤더 */}
          <div className={styles.blue}>
            <h3>홈페이지 가이드</h3>
            <p>궁금한 내용을 자유롭게 물어보세요!</p>
          </div>

          {/* 대화 내용 */}
          <div
            className={styles.message}
            ref={messageRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {message.map((item, index) => (
              <p
                key={index}
                className={
                  item.role === "user"
                    ? styles.userMessage
                    : styles.answer
                }
              >
                {item.content}
              </p>
            ))}

            {/* 답변 생성 중 */}
            {loading && (
              <p className={styles.answer}>
                답변을 작성하고 있어요...
              </p>
            )}
          </div>

          {/* 메시지 입력창 */}
          <div className={styles.inputArea}>
            <input
              type="text"
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
              placeholder="궁금한 내용을 입력하세요"
              aria-label="챗봇 질문 입력"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !question.trim()}
              className={styles.send}
            >
              {loading ? "대기중" : "전송"}
            </button>
          </div>
        </section>
      )}

      {/* 챗봇 열기 / 닫기 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={styles.close}
        aria-label={open ? "챗봇 닫기" : "챗봇 열기"}
        aria-expanded={open}
      >
        {open ? "×" : "✉"}
      </button>
    </div>
  );
};

export default Chatbot;
