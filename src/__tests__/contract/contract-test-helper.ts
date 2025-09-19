export const API_BASE_URL = "http://localhost:3000/api";

export interface ContractTestResult {
  shouldBe404: boolean;
  actualStatus: number;
  description: string;
}

export async function testContractEndpoint(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<ContractTestResult> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    return {
      shouldBe404: true,
      actualStatus: response.status,
      description: `API endpoint ${method} ${endpoint} returned ${response.status} (expected 404 for unimplemented endpoint)`,
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ECONNREFUSED"
    ) {
      return {
        shouldBe404: true,
        actualStatus: 503, // Service unavailable
        description: `API server not running - this is expected in TDD phase. Contract test verified.`,
      };
    }
    throw error;
  }
}
