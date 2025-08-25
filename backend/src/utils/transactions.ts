import mongoose from "mongoose";
import type { ClientSession } from "mongoose";

/**
 * Utility to wrap DB operations in a transaction
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
}
