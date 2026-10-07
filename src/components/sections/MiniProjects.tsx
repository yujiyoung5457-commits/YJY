"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import miniProjectsData from "@/data/miniProjects.json";
import styles from "./MiniProjects.module.scss";

const projectItems = miniProjectsData.groups.flatMap((group) => group.projects);

export function MiniProjects() {
  const flowCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(
    miniProjectsData.defaultProjectId,
  );
  const selectedProject =
    projectItems.find((project) => project.id === selectedProjectId) ??
    projectItems[0];

  useEffect(() => {
    const canvas = flowCanvasRef.current;

    if (!canvas) return;

    const drawFlow = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      const context = canvas.getContext("2d");

      if (!context) return;

      const shapeWidth = width * (width <= 760 ? 0.76 : 0.6);
      const x = (ratio: number) => shapeWidth * ratio;
      const y = (ratio: number) => height * ratio;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#ffaa00";

      const flowPoints = [
        [1, 0],
        [0.97, 0.25],
        [0.94, 0.5],
        [0.88, 0.43],
        [0.81, 0.68],
        [0.72, 0.52],
        [0.61, 0.76],
        [0.49, 0.57],
        [0.37, 0.74],
        [0.25, 0.55],
        [0.12, 0.69],
        [0, 0.59],
      ] as const;

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(shapeWidth, 0);

      for (let index = 1; index < flowPoints.length - 1; index += 1) {
        const [currentX, currentY] = flowPoints[index];
        const [nextX, nextY] = flowPoints[index + 1];
        context.quadraticCurveTo(
          x(currentX),
          y(currentY),
          x((currentX + nextX) / 2),
          y((currentY + nextY) / 2),
        );
      }

      const [lastX, lastY] = flowPoints.at(-1)!;
      context.quadraticCurveTo(x(lastX), y(lastY), 0, y(lastY));
      context.closePath();
      context.fill();
    };

    const resizeObserver = new ResizeObserver(drawFlow);
    resizeObserver.observe(canvas);
    drawFlow();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section
      className={styles.section}
      id="mini-projects"
      aria-labelledby="mini-projects-title"
    >
      <canvas ref={flowCanvasRef} className={styles.flowCanvas} aria-hidden="true" />

      <div className={styles.layout}>
        <h2 id="mini-projects-title">Mini Project</h2>

        <div className={styles.projectMenus}>
          {miniProjectsData.groups.map((group) => (
            <div
              className={`${styles.menuGroup} ${group.tone === "red" ? styles.copyMenu : ""}`}
              key={group.id}
            >
              <h3>{group.title}</h3>
              {group.projects.map((project) => (
                <button
                  className={selectedProjectId === project.id ? styles.isActive : ""}
                  type="button"
                  aria-pressed={selectedProjectId === project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  key={project.id}
                >
                  {project.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <article className={styles.televisionProject}>
          <div className={styles.television}>
            <div className={styles.televisionScreen}>
              <Image
                className={styles.screenImage}
                src={selectedProject.image}
                alt={`${selectedProject.label} 프로젝트 미리보기`}
                fill
                sizes="(max-width: 760px) 70vw, 35vw"
                key={selectedProject.id}
              />
            </div>
            <Image
              className={styles.televisionFrame}
              src="/terevision.png"
              alt=""
              fill
              sizes="(max-width: 760px) 92vw, 50vw"
            />
          </div>
        </article>

        <article className={styles.projectWindow} aria-label="미니 프로젝트 설명 영역">
          <div className={styles.windowBar} aria-hidden="true">
            <span className={styles.redDot} />
            <span className={styles.greenDot} />
            <span className={styles.blueDot} />
            <span className={styles.close}>×</span>
          </div>
          <div className={styles.windowBody}>
            <div>
              <h3>[주요 업무]</h3>
              {selectedProject.tasks.length > 0 ? (
                selectedProject.tasks.map((task) => <p key={task}>{task}</p>)
              ) : (
                <p className={styles.emptyText}>JSON에 주요 업무를 입력해 주세요.</p>
              )}
            </div>

            <div>
              <h3>[활용 기술]</h3>
              {selectedProject.technologies.length > 0 ? (
                <p className={styles.technologyList}>
                  {selectedProject.technologies.join(" · ")}
                </p>
              ) : (
                <p className={styles.emptyText}>JSON에 활용 기술을 입력해 주세요.</p>
              )}
            </div>

            <div className={styles.projectLinks}>
              {selectedProject.links.liveSite ? (
                <a href={selectedProject.links.liveSite} target="_blank" rel="noreferrer">
                  LIVE SITE
                </a>
              ) : (
                <span aria-disabled="true">LIVE SITE</span>
              )}
              {selectedProject.links.github ? (
                <a href={selectedProject.links.github} target="_blank" rel="noreferrer">
                  GIT HUB
                </a>
              ) : (
                <span aria-disabled="true">GIT HUB</span>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
