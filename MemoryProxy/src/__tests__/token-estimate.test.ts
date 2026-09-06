import { describe, it, expect } from "vitest";
import { estimateAnthropicInputTokens } from "../common/token-estimate.js";

describe("estimateAnthropicInputTokens（count_tokens 本地兜底）", () => {
  it("按 system/messages/tools 序列化长度估算，返回正整数", () => {
    const n = estimateAnthropicInputTokens({
      model: "m",
      system: "you are a helpful assistant",
      messages: [
        { role: "user", content: "hello world this is a longer message" },
        { role: "assistant", content: "hi there" },
      ],
      tools: [{ name: "f", description: "tool", input_schema: { type: "object" } }],
    });
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThan(0);
  });

  it("文本越长估算越大", () => {
    const short = estimateAnthropicInputTokens({
      messages: [{ role: "user", content: "hi" }],
    });
    const long = estimateAnthropicInputTokens({
      messages: [{ role: "user", content: "x".repeat(500) }],
    });
    expect(long).toBeGreaterThan(short);
  });

  it("空 body 也返回 >= 1", () => {
    expect(estimateAnthropicInputTokens({})).toBeGreaterThanOrEqual(1);
  });
});
