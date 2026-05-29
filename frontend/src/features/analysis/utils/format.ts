export const formatMs = (ms: number) => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return `${ms}ms`;
};

export const formatCount = (count: number) => count.toLocaleString("ko-KR");
