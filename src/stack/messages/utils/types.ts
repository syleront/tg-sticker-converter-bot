import { AttachmentType } from "puregram";

export type AttachmentTypeFromEnum = AttachmentType.ANIMATION | "animation"
  | AttachmentType.AUDIO | "audio"
  | AttachmentType.DOCUMENT | "document"
  | AttachmentType.PHOTO | "photo"
  | AttachmentType.STICKER | "sticker"
  | AttachmentType.VIDEO | "video"
  | AttachmentType.VIDEO_NOTE | "video_note"
  | AttachmentType.VOICE | "voice";
