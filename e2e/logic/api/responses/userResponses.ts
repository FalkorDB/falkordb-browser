export interface GetUsersResponse {
  result: {
    username: string;
    role: string;
    checked: boolean;
  }[];
}

export interface CreateUsersResponse {
  message: string;
}

export interface DeleteUsersResponse {
  message: string;
}
