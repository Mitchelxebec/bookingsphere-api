declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      roles: string[];
    };
  }
}
