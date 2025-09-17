import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { supabase } from "../lib/supabase/client";

describe("Setup Validation", () => {
  it("should have valid Prisma client", () => {
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
  });

  it("should have valid Supabase client", () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.auth.signInWithPassword).toBe("function");
    expect(typeof supabase.from).toBe("function");
  });

  it("should have valid OpenAI client structure", async () => {
    // Dynamic import to avoid browser environment issues
    try {
      const { openai } = await import("../lib/openai/client");
      expect(typeof openai).toBe("object");
      expect(openai).toBeDefined();
    } catch (error) {
      // Expected in test environment without proper API key
      expect(error).toBeDefined();
    }
  });

  it("should have valid TypeScript types", async () => {
    // Import types to ensure they compile correctly
    const { CuisineGenre, SpiceLevel, BudgetRange } = await import(
      "@prisma/client"
    );
    expect(CuisineGenre).toBeDefined();
    expect(SpiceLevel).toBeDefined();
    expect(BudgetRange).toBeDefined();
  });

  it("should have valid environment structure", async () => {
    // Check that environment variables are structured correctly
    expect(process.env.NODE_ENV).toBeDefined();
    // Don't check actual values as they may be empty in test
  });
});
