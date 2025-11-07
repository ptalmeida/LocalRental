import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function for tests
// Add providers here if needed in the future (e.g., Router, Context, etc.)
function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { ...options });
}

export * from '@testing-library/react';
export { customRender as render };
