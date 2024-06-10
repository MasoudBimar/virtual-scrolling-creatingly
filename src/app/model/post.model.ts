export interface PostHeight {
  value: number;
  source: 'predicted' | 'actual';
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}