export interface Project {
  id: string;
  title: string;
  type: "Team" | "Personal";
  description: string;
  tech: string[];
  image: string;
  liveUrl?: string;
  githubUrl?: string;
}
