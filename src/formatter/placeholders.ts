import { Placeholder, ProtectedSource } from './types';

export function protectAspBlocks(source: string): ProtectedSource {
  const placeholders: Placeholder[] = [];
  const protectedSource = source.replace(/<%[\s\S]*?%>/g, (value) => {
    const prefix = value.startsWith('<%=') ? 'ASP_EXPR' : 'ASP_BLOCK';
    const token = `___${prefix}_${placeholders.length}___`;
    placeholders.push({ token, value });
    return token;
  });

  return { source: protectedSource, placeholders };
}

export function restoreAspBlocks(source: string, placeholders: Placeholder[]): string {
  let restored = source;

  for (const placeholder of placeholders) {
    restored = restored.split(placeholder.token).join(placeholder.value);
  }

  return restored;
}
