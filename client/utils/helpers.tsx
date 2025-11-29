// Helper to get file by role
  export const getFileByRole = (files: any[], role: string) => files?.find((f) => f.role === role)?.url || null;
