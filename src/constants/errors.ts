export const ErrorMessages = {
  ErrorOccurred: "An error occurred!",
  ErrorInErrorHandler: "Error occurred in error handler.",

  AIError: "An error occurred while the AI was processing.",
  AIConversationNotFound: "Conversation not found.",

  TTSFailed: "Failed to convert text to speech.",

  NotEnoughArgs: "Not enough arguments.",
  InvalidArgument: "Invalid argument.",
  DeveloperOnlyCommand: "This command is for developers only.",
  NotInvitedToAI: "You are not invited to test Ailsa at this time.",
  UnproxiedAttachment: "This attachment is unproxied, and can't be downloaded.",
  NeedsAudioOrVideo: "Please attach audio or video.",
  UnsupportedContentType: "The content type {content_type} is not supported. Please use one of the following: {supported_types}",
  UndetectableMimeType: "Couldn't detect a mime type for this file.",

  NoPermissionToJoinVoiceChannel: "I don't have permission to join that voice channel.",
  LivetalkSessionAlreadyActive: "There is already an active session in that channel.",
  NoLiveTalkSession: "There is no active live talk session in that channel.",

  UnsupportedBackendCapability: "This instance doesn't support the {capability} capability.",

  AIThreadCreateError: "# Awkward...\nWe couldn't create a thread in this channel.",
};

export const Messages = {
  AvatarNotFound: "No avatar found.",
  BannerNotFound: "No banner found.",

  TooLittleArguments: "Too little arguments.",
  InteractionsNotSupported: "Interactions are not supported for this feature.",
  Unimplemented: "This feature is unimplemented.",
  NoSpeechDetected: "No speech was detected.",
};
