export interface AuthCredentialsResponse {
    credentials: {
        id: string;
        name: string;
        type: string;
        signinUrl: string;
        callbackUrl: string;
    };
}
