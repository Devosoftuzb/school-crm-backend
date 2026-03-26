export interface AddFaceResult {
  success: boolean;
  message: string;
  hikvision_code: string;
}

export interface DeleteFaceResult {
  success: boolean;
  message: string;
}

export interface PingResult {
  success: boolean;
  message: string;
  status?: number;
  error?: string;
}