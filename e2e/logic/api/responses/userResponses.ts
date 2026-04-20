export interface GetUsersResponse {
  result: {
    username: string;
    role: string;
    selected: boolean;
  }[];
}

export interface CreateUsersResponse {
  message: string;
}

export interface DeleteUsersResponse {
  message: string;
}

export interface UpdateUserResponse {
  message: string;
}
