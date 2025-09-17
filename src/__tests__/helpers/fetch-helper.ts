// テスト用のfetchヘルパー
export async function safeFetch(
  url: string, 
  options?: RequestInit
): Promise<{ status: number; json?: () => Promise<any> }> {
  try {
    const response = await fetch(url, options);
    return {
      status: response.status,
      json: () => response.json(),
    };
  } catch (error) {
    // 接続エラーの場合は500として扱う
    if (error instanceof Error && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('fetch failed')
    )) {
      return { status: 500 };
    }
    throw error;
  }
}