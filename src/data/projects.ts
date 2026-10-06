import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "project-one",
    title: "Project One",
    type: "Personal",
    description: "프로젝트 설명을 여기에 작성하세요.",
    tech: ["Next.js", "TypeScript"],
    image: "/assets/images/project-one.jpg",
  },
  {
    id: "project-two",
    title: "Project Two",
    type: "Team",
    description: "프로젝트 설명을 여기에 작성하세요.",
    tech: ["React", "Three.js"],
    image: "/assets/images/project-two.jpg",
  },
  {
    id: "project-three",
    title: "Project Three",
    type: "Personal",
    description: "프로젝트 설명을 여기에 작성하세요.",
    tech: ["UI/UX", "CSS"],
    image: "/assets/images/project-three.jpg",
  },
];
