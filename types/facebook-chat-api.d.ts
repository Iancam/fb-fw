export declare function index(loginData: any, callback: any): void;

declare enum FBResource {
  friends = "friends",
  messages = "messages",
  threads = "threads"
}

export type participant = {
  name: string;
};
export type timestamp = number;

export type thread = {
  threadID: string;
  name: string;
  participants: participant[];
  unreadCount: number;
};

export type message = {
  messageID: string;
  timestamp: number;
  body: string | null;
  type: string;
  senderID: string;
  threadID: string;
};

export type friend = {};

export type apiHandler = {
  [resource: string]: (x: any) => any | undefined;
};

export type command = "get" | "post";

type callbackType = (err: any, data: any) => any;
type threadListTags =
  | ["INBOX"]
  | ["ARCHIVED"]
  | ["PENDING"]
  | ["OTHER"]
  | ["INBOX", "unread"]
  | ["ARCHIVED", "unread"]
  | ["PENDING", "unread"]
  | ["OTHER", "unread"];

export type FBAPI = {
  getAppState(): any;
  listen(): void;
  addUserToGroup(
    userID: string,
    threadID: string,
    callback: callbackType
  ): void;
  changeAdminStatus(
    threadID: string,
    adminIDs: string[],
    adminStatus: any,
    callback: callbackType
  ): void;
  changeArchivedStatus(
    threadOrThreads: any,
    archive: any,
    callback: callbackType
  ): void;
  changeBlockedStatus(
    userID: string,
    block: Boolean,
    callback: callbackType
  ): void;
  changeGroupImage(
    image: string,
    threadID: string,
    callback: callbackType
  ): void;
  changeNickname(
    nickname: string,
    threadID: string,
    participantID: string,
    callback: callbackType
  ): void;
  changeThreadColor(
    color: string,
    threadID: string,
    callback: callbackType
  ): void;
  changeThreadEmoji(
    emoji: string,
    threadID: string,
    callback: callbackType
  ): void;
  createPoll(
    title: string,
    threadID: string,
    options: {},
    callback: callbackType
  ): void;
  deleteMessage(
    messageOrMessages: string | string[],
    callback: callbackType
  ): void;
  deleteThread(
    threadOrThreads: string | string[],
    callback: callbackType
  ): void;
  forwardAttachment(
    attachmentID: string,
    userOrUsers: string | string[],
    callback: callbackType
  ): void;
  getCurrentUserID(): void;
  getEmojiUrl(c: string, size: number, pixelRatio: string): void;
  getFriendsList(callback: callbackType): void;
  getThreadHistory(
    threadID: string,
    amount: number,
    timestamp: number | null,
    callback: callbackType
  ): void;
  getThreadInfoGraphQL(threadID: string, callback: callbackType): void;
  getThreadInfo(threadID: string, callback: callbackType): void;
  getThreadList(
    limit: number,
    timestamp: number | null,
    tags: threadListTags,
    callback: callbackType
  ): void;
  // getThreadList(start:number, end:number, type, callback:callbackType,):void
  getThreadPictures(
    threadID: string,
    offset: number,
    limit: number,
    callback: callbackType
  ): void;
  getUserID(name: string, callback: callbackType): void;
  getUserInfo(id: string, callback: callbackType): void;
  handleMessageRequest(
    threadID: string,
    accept: boolean,
    callback: callbackType
  ): void;
  logout(callback: callbackType): void;
  markAsRead(threadID: string, read: boolean, callback: callbackType): void;
  muteThread(
    threadID: string,
    muteSeconds: number,
    callback: callbackType
  ): void;
  removeUserFromGroup(
    userID: string,
    threadID: string,
    callback: callbackType
  ): void;
  resolvePhotoUrl(photoID: string, callback: callbackType): void;
  searchForThread(name: string, callback: callbackType): void;
  sendMessage(msg: string, threadID: string, callback: callbackType): void;
  sendTypingIndicator(threadID: string, callback: callbackType): void;
  setMessageReaction(
    reaction: string,
    messageID: string,
    callback: callbackType
  ): void;
  setTitle(newTitle: string, threadID: string, callback: callbackType): void;
  unsendMessage(messageID: string, callback: callbackType): void;
};

export type actionatePayload<
  C extends command,
  Res extends FBResource,
  R extends boolean
> = Res extends FBResource.messages
  ? C extends "get"
    ? R extends false
      ? getThreadHistoryParams
      : message[]
    : sendMessageParams
  : Res extends FBResource.friends
  ? C extends "get"
    ? R extends false
      ? getFriendsListParams
      : friend[]
    : never
  : Res extends FBResource.threads
  ? C extends "get"
    ? R extends false
      ? getThreadListParams
      : thread[]
    : never /** @todo: enumerate options  */
  : never;

export type listenParams = [];
export type addUserToGroupParams = [userID, threadID];
export type changeAdminStatusParams = [threadID, adminIDs[], adminStatus];
export type changeArchivedStatusParams = [threadOrThreads, archive];
export type changeBlockedStatusParams = [userID, block];
export type changeGroupImageParams = [image, threadID];
export type changeNicknameParams = [nickname, threadID, participantID];
export type changeThreadColorParams = [color, threadID];
export type changeThreadEmojiParams = [emoji, threadID];
export type createPollParams = [title, threadID, options];
export type deleteMessageParams = [messageOrMessages | string[]];
export type deleteThreadParams = [threadOrThreads | string[]];
export type forwardAttachmentParams = [attachmentID, userOrUsers | string[]];
export type getCurrentUserIDParams = [];
export type getEmojiUrlParams = [c, size, pixelRatio];
export type getFriendsListParams = [];
export type getThreadHistoryParams = [threadID, amount, timestamp | null];
export type getThreadInfoGraphQLParams = [threadID];
export type getThreadInfoParams = [threadID];
export type getThreadListParams = [limit, timestamp | null, threadListTags];
export type getThreadPicturesParams = [threadID, offset, limit];
export type getUserIDParams = [name];
export type getUserInfoParams = [id];
export type handleMessageRequestParams = [threadID, accept];
export type logoutParams = [];
export type markAsReadParams = [threadID, read];
export type muteThreadParams = [threadID, muteSeconds];
export type removeUserFromGroupParams = [userID, threadID];
export type resolvePhotoUrlParams = [photoID];
export type searchForThreadParams = [name];
export type sendMessageParams = [msg, threadID];
export type sendTypingIndicatorParams = [threadID];
export type setMessageReactionParams = [reaction, messageID];
export type setTitleParams = [newTitle, threadID];
export type unsendMessageParams = [messageID];

export type userID = string;
export type threadID = string;
export type callback = callbackType;
export type adminIDs = string;
export type adminStatus = any;
export type threadOrThreads = any;
export type archive = any;
export type block = Boolean;
export type image = string;
export type nickname = string;
export type participantID = string;
export type color = string;
export type emoji = string;
export type title = string;
export type options = {};
export type messageOrMessages = string;
export type attachmentID = string;
export type userOrUsers = string;
export type c = string;
export type size = number;
export type pixelRatio = string;
export type amount = number;
export type limit = number;
export type offset = number;
export type name = string;
export type id = string;
export type accept = boolean;
export type read = boolean;
export type muteSeconds = number;
export type photoID = string;
export type msg = string;
export type reaction = string;
export type messageID = string;
export type newTitle = string;
