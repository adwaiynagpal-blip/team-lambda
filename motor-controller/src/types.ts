export interface LogEntry {
  id: number;
  time: string;
  text: string;
  success: boolean;
}

export interface ControllerConfig {
  label: string;
  forwardCmd: string;
  reverseCmd: string;
  stopCmd: string;
}
