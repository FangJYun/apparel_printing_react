export function MiniPattern({ name }: { name: string }) {
  return <span className={`pattern pattern-${name}`} aria-hidden="true" />;
}
