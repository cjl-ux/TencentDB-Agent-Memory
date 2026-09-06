/**
 * Anthropic count_tokens 本地估算兜底。
 *
 * 05A（Claude Code → Chat 上游）下客户端每次都会先打
 * `/v1/messages/count_tokens` 预检，而 Chat 上游没有对位端点；这里用
 * “序列化字符数 / 4 + 消息条数固定开销”做粗粒度估算，只用于客户端上下文
 * 条提示，不作为计费依据（计费仍以上游 usage 为准）。
 */

function jsonLength(v: unknown): number {
  try {
    const s = JSON.stringify(v);
    return s ? s.length : 0;
  } catch {
    return 0;
  }
}

/** 估算 Anthropic Messages 请求的 input_tokens（纯函数，便于单测）。 */
export function estimateAnthropicInputTokens(body: Record<string, unknown>): number {
  let chars = 0;
  if (body.system !== undefined) chars += jsonLength(body.system);
  if (Array.isArray(body.messages)) {
    for (const m of body.messages) {
      chars += jsonLength(m);
      // 每条消息的 role / 结构开销近似 4 token
      chars += 16;
    }
  }
  if (body.tools !== undefined) chars += jsonLength(body.tools);
  if (body.metadata !== undefined) chars += jsonLength(body.metadata);
  // 保守下限：空请求也算少量 token，避免返回 0 让客户端误判“零上下文”。
  return Math.max(1, Math.ceil(chars / 4));
}
