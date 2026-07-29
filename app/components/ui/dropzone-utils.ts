// Drop-selection contract for the Dropzone component, kept framework-free so
// it can be unit tested with the node test runner.
//
// The contract preserves the all-or-nothing semantics of react-dropzone <19:
// a drop is applied only when at least one file was accepted and nothing was
// rejected. Otherwise the drop is ignored entirely (returns null), so the
// caller keeps its current selection and `onFileDrop` stays success-only.
// eslint-disable-next-line import/prefer-default-export
export function resolveDroppedFiles<T>(
  acceptedFiles: readonly T[],
  fileRejections: readonly unknown[]
): T[] | null {
  if (fileRejections.length > 0 || acceptedFiles.length === 0) {
    return null;
  }

  return [...acceptedFiles];
}
