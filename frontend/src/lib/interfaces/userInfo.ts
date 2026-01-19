export interface UserInfo {
  userData: {
    id: string;
    avatar: string | null;
    global_name?: string;
    username: string;
  };
}
