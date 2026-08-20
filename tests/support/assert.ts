export function assert(condition: unknown, message = "Assertion failed."): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}.`);
  }
}

export function assertRejects(fn: () => unknown, expectedMessage: string): void {
  try {
    fn();
  } catch (error) {
    assert(error instanceof Error, "Expected an Error.");
    assert(
      error.message.includes(expectedMessage),
      `Expected error message to include "${expectedMessage}", got "${error.message}".`
    );
    return;
  }
  throw new Error("Expected function to throw.");
}
