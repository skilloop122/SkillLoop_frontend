declare module "@jitsi/react-sdk" {
  import type { ComponentType, ReactNode } from "react";

  export interface JitsiMeetingUserInfo {
    displayName?: string;
    email?: string;
  }

  export interface JitsiMeetingProps {
    domain?: string;
    roomName: string;
    configOverwrite?: Record<string, unknown>;
    interfaceConfigOverwrite?: Record<string, unknown>;
    userInfo?: JitsiMeetingUserInfo;
    onReadyToClose?: () => void;
    onMeetingEnd?: () => void;
    getIFrameRef?: (iframeRef: HTMLDivElement) => void;
    loadingComponent?: ComponentType | ReactNode;
    errorComponent?: ComponentType | ReactNode;
    spinner?: ComponentType;
    [key: string]: unknown;
  }

  export const JitsiMeeting: ComponentType<JitsiMeetingProps>;
}
