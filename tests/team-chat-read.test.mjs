import assert from "node:assert/strict";
import test from "node:test";
import { mergeChatReadIds, parseChatReadIds, unreadChatCount } from "../lib/team-chat-read.ts";

test("chat unread markers survive reload, exclude own messages and preserve later arrivals", () => {
  const messages = [{ id: "a", authorId: "friend" }, { id: "b", authorId: "me" }, { id: "c", authorId: "friend" }];
  assert.equal(unreadChatCount(messages, "me", []), 2);
  const saved = JSON.stringify(mergeChatReadIds([], ["a", "b"]));
  assert.equal(unreadChatCount(messages, "me", parseChatReadIds(saved)), 1);
  assert.equal(unreadChatCount(messages, "friend", parseChatReadIds(saved)), 0);
  assert.equal(unreadChatCount(messages.slice(0, 2), "me", parseChatReadIds(saved)), 0);
});

test("damaged chat preferences recover safely and retained read history is bounded", () => {
  assert.deepEqual(parseChatReadIds("broken"), []);
  assert.deepEqual(parseChatReadIds('{"id":"bad"}'), []);
  assert.deepEqual(parseChatReadIds('["a",1,null,"a","b"]'), ["a", "b"]);
  const ids = mergeChatReadIds(Array.from({ length: 600 }, (_, i) => String(i)), ["latest", "latest"]);
  assert.equal(ids.length, 600);
  assert.equal(ids.at(-1), "latest");
  assert.equal(ids.includes("0"), false);
});
