export interface PostFrontmatter {
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  updatedAt?: string;
  author?: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
}
