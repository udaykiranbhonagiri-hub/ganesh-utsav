export const PARTICIPANT_ID_STORAGE_KEY = "ganesh-utsav-participant-id";

export function getSavedParticipantId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PARTICIPANT_ID_STORAGE_KEY);
}

export function saveParticipantId(participantId: string) {
  window.localStorage.setItem(PARTICIPANT_ID_STORAGE_KEY, participantId);
}
