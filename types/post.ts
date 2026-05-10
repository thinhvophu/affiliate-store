export interface PostFrontmatter {
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
}
