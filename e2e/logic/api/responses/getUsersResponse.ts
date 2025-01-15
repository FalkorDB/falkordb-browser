export interface GetUsersResponse {
  result: {
    username: string;
    role: string;
    checked: boolean;
  }[];
}
